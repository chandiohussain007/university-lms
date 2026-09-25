import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { AttendanceSession } from './attendance-session.entity';
import { Profile } from '../profiles/entities/profile.entity';

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    EXCUSED = 'EXCUSED',
}

@Entity('attendance_records')
@Unique(['sessionId', 'studentProfileId'])
export class AttendanceRecord extends BaseEntity {
    @ManyToOne(() => AttendanceSession, (session) => session.records)
    @JoinColumn({ name: 'sessionId' })
    session: AttendanceSession;

    @Column({ type: 'uuid' })
    sessionId: string;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: 'studentProfileId' })
    student: Profile;

    @Column({ type: 'uuid' })
    studentProfileId: string;

    @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
    status: AttendanceStatus;

    @Column({ type: 'text', nullable: true })
    note: string | null;
}