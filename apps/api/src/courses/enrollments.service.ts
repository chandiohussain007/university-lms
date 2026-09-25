import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { Profile, ProfileType } from '../profiles/entities/profile.entity';
import { CourseOffering } from './entities/course-offering.entity';

import { TimeSlot } from './entities/time-slot.entity';

@Injectable()
export class EnrollmentsService {
    constructor(
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(CourseOffering)
        private readonly offeringRepository: Repository<CourseOffering>,
        @InjectRepository(TimeSlot)
        private readonly timeSlotRepository: Repository<TimeSlot>,
    ) { }

    // Enroll a student profile into a course offering
    async create(createEnrollmentDto: { studentProfileId: string; courseOfferingId: string }) {
        const offering = await this.offeringRepository.findOne({
            where: { id: createEnrollmentDto.courseOfferingId },
        });
        if (!offering) {
            throw new NotFoundException(
                `Course offering with ID ${createEnrollmentDto.courseOfferingId} not found`,
            );
        }

        const student = await this.profileRepository.findOne({
            where: { id: createEnrollmentDto.studentProfileId },
        });
        if (!student) {
            throw new NotFoundException(
                `Student profile with ID ${createEnrollmentDto.studentProfileId} not found`,
            );
        }

        const existing = await this.enrollmentRepository.findOne({
            where: {
                studentProfileId: createEnrollmentDto.studentProfileId,
                courseOfferingId: createEnrollmentDto.courseOfferingId,
            },
        });
        if (existing && existing.status !== EnrollmentStatus.DROPPED) {
            throw new ConflictException(
                'Student is already enrolled in this course offering',
            );
        }
        if (existing) {
            // Re-activate a previously dropped enrollment
            existing.status = EnrollmentStatus.ENROLLED;
            return this.enrollmentRepository.save(existing);
        }

        const enrollment = this.enrollmentRepository.create({
            studentProfileId: createEnrollmentDto.studentProfileId,
            courseOfferingId: createEnrollmentDto.courseOfferingId,
            facultyId: offering.facultyId,
            status: EnrollmentStatus.ENROLLED,
        });
        return this.enrollmentRepository.save(enrollment);
    }

    // Enrollments of the currently authenticated student
    async findMyEnrollments(userId: string) {
        const studentProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.STUDENT },
        });
        if (studentProfiles.length === 0) {
            return [];
        }
        return this.enrollmentRepository.find({
            where: { studentProfileId: In(studentProfiles.map((p) => p.id)) },
            relations: [
                'courseOffering',
                'courseOffering.course',
                'courseOffering.semester',
                'courseOffering.teacher',
                'courseOffering.teacher.user',
            ],
            order: { createdAt: 'DESC' },
        });
    }

    async findMySchedule(userId: string) {
        const enrollments = await this.findMyEnrollments(userId);
        const offeringIds = enrollments.map((e) => e.courseOfferingId);
        if (offeringIds.length === 0) return [];

        return this.timeSlotRepository.find({
            where: { courseOfferingId: In(offeringIds) },
            relations: ['courseOffering', 'courseOffering.course', 'courseOffering.teacher', 'courseOffering.teacher.user'],
            order: { startTime: 'ASC' },
        });
    }

    // Roster of students enrolled in an offering (teacher view)
    findOfferingRoster(offeringId: string) {
        return this.enrollmentRepository.find({
            where: { courseOfferingId: offeringId },
            relations: ['student', 'student.user', 'courseOffering', 'courseOffering.course'],
            order: { createdAt: 'ASC' },
        });
    }

    async findOne(id: string) {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id },
            relations: ['student', 'courseOffering', 'courseOffering.course'],
        });
        if (!enrollment) {
            throw new NotFoundException(`Enrollment with ID ${id} not found`);
        }
        return enrollment;
    }

    private getGradeDetails(grade: number): { letterGrade: string; gradePoints: number } {
        if (grade >= 90) return { letterGrade: 'A', gradePoints: 4.0 };
        if (grade >= 85) return { letterGrade: 'A-', gradePoints: 3.7 };
        if (grade >= 80) return { letterGrade: 'B+', gradePoints: 3.3 };
        if (grade >= 75) return { letterGrade: 'B', gradePoints: 3.0 };
        if (grade >= 70) return { letterGrade: 'B-', gradePoints: 2.7 };
        if (grade >= 65) return { letterGrade: 'C+', gradePoints: 2.3 };
        if (grade >= 60) return { letterGrade: 'C', gradePoints: 2.0 };
        if (grade >= 55) return { letterGrade: 'D', gradePoints: 1.0 };
        return { letterGrade: 'F', gradePoints: 0.0 };
    }

    async calculateGpa(userId: string) {
        const enrollments = await this.findMyEnrollments(userId);
        const completed = enrollments.filter(e => e.grade !== null && e.grade !== undefined);

        let totalPoints = 0;
        let totalCredits = 0;

        const courseBreakdown = completed.map(e => {
            const credits = e.courseOffering?.course?.credits || 3;
            const details = e.letterGrade && e.gradePoints !== undefined ? { letterGrade: e.letterGrade, gradePoints: e.gradePoints } : this.getGradeDetails(e.grade);
            totalPoints += details.gradePoints * credits;
            totalCredits += credits;
            return {
                id: e.id,
                courseCode: e.courseOffering?.course?.code,
                courseTitle: e.courseOffering?.course?.title,
                semester: e.courseOffering?.semester?.name,
                credits,
                grade: e.grade,
                letterGrade: details.letterGrade,
                gradePoints: details.gradePoints,
            };
        });

        const gpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

        return {
            gpa,
            totalCreditsCompleted: totalCredits,
            totalCoursesCompleted: completed.length,
            breakdown: courseBreakdown,
        };
    }

    async updateGrade(id: string, grade: number, status?: EnrollmentStatus) {
        const enrollment = await this.findOne(id);
        enrollment.grade = grade;
        if (grade !== null && grade !== undefined) {
            const details = this.getGradeDetails(grade);
            enrollment.letterGrade = details.letterGrade;
            enrollment.gradePoints = details.gradePoints;
            enrollment.status = status || EnrollmentStatus.COMPLETED;
        } else if (status) {
            enrollment.status = status;
        }
        return this.enrollmentRepository.save(enrollment);
    }

    async updateStatus(id: string, status: EnrollmentStatus) {
        const enrollment = await this.findOne(id);
        enrollment.status = status;
        return this.enrollmentRepository.save(enrollment);
    }

    async remove(id: string) {
        const enrollment = await this.findOne(id);
        return this.enrollmentRepository.remove(enrollment);
    }
}