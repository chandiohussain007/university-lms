import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { AttendanceRecord, AttendanceStatus } from './attendance-record.entity';
import { Profile, ProfileType } from '../profiles/entities/profile.entity';
import { Enrollment, EnrollmentStatus } from '../courses/entities/enrollment.entity';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(AttendanceSession)
        private readonly sessionRepository: Repository<AttendanceSession>,
        @InjectRepository(AttendanceRecord)
        private readonly recordRepository: Repository<AttendanceRecord>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
    ) { }

    // ---- Teacher/admin: create a session for an offering they teach ----
    async createSession(dto: { courseOfferingId: string; date: string; topic?: string }, userId: string) {
        const teacherProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.TEACHER },
        });
        const isTeacherOf = teacherProfiles.length > 0 && (
            await this.sessionRepository.manager
                .getRepository('CourseOffering')
                .findOne({ where: { id: dto.courseOfferingId, teacherProfileId: In(teacherProfiles.map((p) => p.id)) } })
        );
        // Admins/staff may create for any offering in their reach; teachers only their own
        if (!isTeacherOf) {
            const offering = await this.sessionRepository.manager
                .getRepository('CourseOffering')
                .findOne({ where: { id: dto.courseOfferingId } });
            if (!offering) throw new NotFoundException(`Course offering with ID ${dto.courseOfferingId} not found`);
        }

        const offering: any = await this.sessionRepository.manager
            .getRepository('CourseOffering')
            .findOne({ where: { id: dto.courseOfferingId } });
        if (!offering) throw new NotFoundException(`Course offering with ID ${dto.courseOfferingId} not found`);

        const existing = await this.sessionRepository.findOne({
            where: { courseOfferingId: dto.courseOfferingId, date: dto.date },
        });
        if (existing) {
            throw new ConflictException('A session for this offering already exists on that date');
        }

        const session = this.sessionRepository.create({
            courseOfferingId: dto.courseOfferingId,
            facultyId: offering.facultyId, // inherit tenant
            date: dto.date,
            topic: dto.topic ?? null,
            createdByProfileId: teacherProfiles[0]?.id ?? null as any,
        });
        const saved = await this.sessionRepository.save(session);
        return this.sessionRepository.findOne({
            where: { id: saved.id },
            relations: ['courseOffering', 'courseOffering.course'],
        });
    }

    // ---- Teacher: sessions for offerings they teach ----
    async findMySessions(userId: string) {
        const teacherProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.TEACHER },
        });
        if (teacherProfiles.length === 0) return [];
        return this.sessionRepository.find({
            where: { courseOffering: { teacherProfileId: In(teacherProfiles.map((p) => p.id)) } },
            relations: ['courseOffering', 'courseOffering.course'],
            order: { date: 'DESC' },
        });
    }

    // ---- Get one session with its records (teacher/admin) ----
    async findOneSession(id: string) {
        const session = await this.sessionRepository.findOne({
            where: { id },
            relations: ['courseOffering', 'courseOffering.course', 'records', 'records.student', 'records.student.user'],
        });
        if (!session) throw new NotFoundException(`Attendance session with ID ${id} not found`);
        return session;
    }

    // ---- Bulk upsert marks for a session ----
    async saveRecords(sessionId: string, userId: string, marks: Array<{ studentProfileId: string; status: AttendanceStatus; note?: string }>) {
        const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
        if (!session) throw new NotFoundException(`Attendance session with ID ${sessionId} not found`);
        await this.assertCanManage(session.courseOfferingId, userId);

        const results: AttendanceRecord[] = [];
        for (const mark of marks) {
            const record = await this.recordRepository.findOne({
                where: { sessionId, studentProfileId: mark.studentProfileId },
            });
            if (record) {
                record.status = mark.status;
                record.note = mark.note ?? record.note;
                results.push(await this.recordRepository.save(record));
            } else {
                const newRecord = this.recordRepository.create({
                    sessionId,
                    studentProfileId: mark.studentProfileId,
                    status: mark.status,
                    note: mark.note ?? null,
                });
                try {
                    results.push(await this.recordRepository.save(newRecord) as AttendanceRecord);
                } catch (e: any) {
                    if (e?.code === '23505') {
                        throw new ConflictException('Duplicate mark for a student in this session');
                    }
                    throw e;
                }
            }
        }
        return results;
    }

    // ---- Student: get attendance records for student's enrolled offerings ----
    async findStudentAttendance(userId: string) {
        const studentProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.STUDENT },
        });
        if (studentProfiles.length === 0) return [];

        return this.recordRepository.find({
            where: { studentProfileId: In(studentProfiles.map((p) => p.id)) },
            relations: ['session', 'session.courseOffering', 'session.courseOffering.course'],
            order: { createdAt: 'DESC' },
        });
    }

    private async assertCanManage(offeringId: string, userId: string) {
        const teacherProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.TEACHER },
        });
        if (teacherProfiles.length === 0) {
            throw new ForbiddenException('Only the course teacher can manage attendance');
        }
        const offering = await this.sessionRepository.manager
            .getRepository('CourseOffering')
            .findOne({ where: { id: offeringId, teacherProfileId: In(teacherProfiles.map((p) => p.id)) } });
        if (!offering) {
            throw new ForbiddenException('You are not the teacher of this course offering');
        }
    }
}