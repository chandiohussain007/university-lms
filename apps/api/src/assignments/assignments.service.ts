import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Assignment } from './assignment.entity';
import { Submission } from './submission.entity';
import { Profile, ProfileType } from '../profiles/entities/profile.entity';
import { Enrollment, EnrollmentStatus } from '../courses/entities/enrollment.entity';

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class AssignmentsService {
    constructor(
        @InjectRepository(Assignment)
        private readonly assignmentRepository: Repository<Assignment>,
        @InjectRepository(Submission)
        private readonly submissionRepository: Repository<Submission>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
        private readonly notificationsService: NotificationsService,
    ) { }

    // ---- Teacher: create an assignment for an offering they teach ----
    async create(dto: {
        title: string;
        description?: string;
        courseOfferingId: string;
        dueDate?: string;
        maxScore?: number;
    }, userId: string) {
        const offering: any = await this.assertTeacherOfOffering(dto.courseOfferingId, userId);

        const assignment = this.assignmentRepository.create({
            title: dto.title,
            description: dto.description,
            courseOfferingId: dto.courseOfferingId,
            facultyId: offering.facultyId, // inherit tenant from the offering
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            maxScore: dto.maxScore ?? 100,
        });
        try {
            const saved = await this.assignmentRepository.save(assignment);

            // Notify all enrolled students
            const enrollments = await this.enrollmentRepository.find({
                where: { courseOfferingId: dto.courseOfferingId, status: EnrollmentStatus.ENROLLED },
                relations: ['student', 'student.user'],
            });
            for (const e of enrollments) {
                if (e.student?.userId) {
                    await this.notificationsService.createNotification({
                        userId: e.student.userId,
                        title: `New Assignment: ${saved.title}`,
                        message: `A new assignment "${saved.title}" has been posted. Due: ${saved.dueDate ? new Date(saved.dueDate).toLocaleDateString() : 'N/A'}.`,
                        type: NotificationType.ASSIGNMENT_POSTED,
                    });
                }
            }

            return saved;
        } catch (e: any) {
            if (e?.code === '23505') {
                throw new ConflictException('An assignment title must be unique per offering');
            }
            throw e;
        }
    }

    // ---- Teacher: assignments across the offerings they teach ----
    async findMine(userId: string) {
        const teacherProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.TEACHER },
        });
        if (teacherProfiles.length === 0) return [];
        return this.assignmentRepository.find({
            where: { courseOffering: { teacherProfileId: In(teacherProfiles.map((p) => p.id)) } },
            relations: ['courseOffering', 'courseOffering.course', 'submissions'],
            order: { createdAt: 'DESC' },
        });
    }

    // ---- Student: assignments for enrolled offerings (+ own submission) ----
    async findForStudent(userId: string) {
        const studentProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.STUDENT },
        });
        if (studentProfiles.length === 0) return [];

        const enrollments = await this.enrollmentRepository.find({
            where: {
                studentProfileId: In(studentProfiles.map((p) => p.id)),
                status: EnrollmentStatus.ENROLLED,
            },
        });
        const offeringIds = [...new Set(enrollments.map((e) => e.courseOfferingId))];
        if (offeringIds.length === 0) return [];

        const assignments = await this.assignmentRepository.find({
            where: { courseOfferingId: In(offeringIds) },
            relations: ['courseOffering', 'courseOffering.course'],
            order: { dueDate: 'ASC' },
        });
        if (assignments.length === 0) return [];

        const submissions = await this.submissionRepository.find({
            where: {
                assignmentId: In(assignments.map((a) => a.id)),
                studentProfileId: In(studentProfiles.map((p) => p.id)),
            },
        });
        const byAssignment = new Map(submissions.map((s) => [s.assignmentId, s]));
        return assignments.map((a) => ({ ...a, mySubmission: byAssignment.get(a.id) ?? null }));
    }

    findOne(id: string) {
        return this.assignmentRepository.findOne({
            where: { id },
            relations: ['courseOffering', 'courseOffering.course', 'submissions', 'submissions.student', 'submissions.student.user'],
        });
    }

    // ---- Teacher: submissions for an assignment ----
    async findSubmissions(assignmentId: string, userId: string) {
        const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
        if (!assignment) throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
        await this.assertTeacherOfOffering(assignment.courseOfferingId, userId);
        return this.submissionRepository.find({
            where: { assignmentId },
            relations: ['student', 'student.user'],
            order: { createdAt: 'ASC' },
        });
    }

    // ---- Student: submit their work ----
    async submit(assignmentId: string, userId: string, content?: string) {
        const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
        if (!assignment) throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);

        const studentProfile = await this.getStudentProfileForOffering(userId, assignment.courseOfferingId);

        const existing = await this.submissionRepository.findOne({
            where: { assignmentId, studentProfileId: studentProfile.id },
        });
        if (existing) {
            if (existing.grade !== null && existing.grade !== undefined) {
                throw new ConflictException('Cannot resubmit after the assignment has been graded');
            }
            existing.content = content ?? existing.content;
            existing.submittedAt = new Date();
            return this.submissionRepository.save(existing);
        }

        const submission = this.submissionRepository.create({
            assignmentId,
            studentProfileId: studentProfile.id,
            facultyId: assignment.facultyId, // inherit tenant from the assignment
            content,
            submittedAt: new Date(),
        });
        try {
            return await this.submissionRepository.save(submission);
        } catch (e: any) {
            if (e?.code === '23505') {
                throw new ConflictException('You have already submitted this assignment');
            }
            throw e;
        }
    }

    // ---- Teacher: grade a submission ----
    async grade(submissionId: string, userId: string, grade: number, feedback?: string) {
        const submission = await this.submissionRepository.findOne({
            where: { id: submissionId },
            relations: ['assignment', 'student', 'student.user'],
        });
        if (!submission) throw new NotFoundException(`Submission with ID ${submissionId} not found`);
        await this.assertTeacherOfOffering(submission.assignment.courseOfferingId, userId);

        if (grade > submission.assignment.maxScore) {
            throw new ForbiddenException(
                `Grade cannot exceed the assignment max score (${submission.assignment.maxScore})`,
            );
        }

        submission.grade = grade;
        submission.feedback = feedback ?? null;
        submission.gradedAt = new Date();
        const saved = await this.submissionRepository.save(submission);

        if (submission.student?.userId) {
            await this.notificationsService.createNotification({
                userId: submission.student.userId,
                title: `Grade Posted: ${submission.assignment.title}`,
                message: `Your assignment "${submission.assignment.title}" has been graded: ${grade}/${submission.assignment.maxScore}.`,
                type: NotificationType.GRADE_POSTED,
            });
        }

        return saved;
    }

    // ---- Helpers ----
    private async assertTeacherOfOffering(offeringId: string, userId: string) {
        const teacherProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.TEACHER },
        });
        const offering = await this.offeringRepository().findOne({ where: { id: offeringId } });
        if (!offering) throw new NotFoundException(`Course offering with ID ${offeringId} not found`);

        const isTeacher = (offering as any).teacherProfileId &&
            teacherProfiles.some((p) => p.id === (offering as any).teacherProfileId);
        if (!isTeacher) {
            throw new ForbiddenException('You are not the teacher of this course offering');
        }
        return offering;
    }

    private async getStudentProfileForOffering(userId: string, offeringId: string) {
        const studentProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.STUDENT },
        });
        if (studentProfiles.length === 0) {
            throw new ForbiddenException('Only students can submit assignments');
        }

        const enrollment = await this.enrollmentRepository.findOne({
            where: {
                courseOfferingId: offeringId,
                studentProfileId: In(studentProfiles.map((p) => p.id)),
                status: EnrollmentStatus.ENROLLED,
            },
        });
        if (!enrollment) {
            throw new ForbiddenException('You are not enrolled in this course offering');
        }
        return studentProfiles.find((p) => p.id === enrollment.studentProfileId)!;
    }

    private offeringRepository() {
        return this.assignmentRepository.manager.getRepository('CourseOffering');
    }
}