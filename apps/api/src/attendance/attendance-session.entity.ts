import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseFacultyEntity } from '../common/entities/base.entity';
import { CourseOffering } from '../courses/entities/course-offering.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { AttendanceRecord } from './attendance-record.entity';

@Entity('attendance_sessions')
@Unique(['courseOfferingId', 'date'])
export class AttendanceSession extends BaseFacultyEntity {
    @ManyToOne(() => CourseOffering)
    @JoinColumn({ name: 'courseOfferingId' })
    courseOffering: CourseOffering;

    @Column({ type: 'uuid' })
    courseOfferingId: string;

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @Column({ type: 'text', nullable: true })
    topic: string | null;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: 'createdByProfileId' })
    createdBy: Profile;

    @Column({ type: 'uuid' })
    createdByProfileId: string;

    @OneToMany(() => AttendanceRecord, (record) => record.session)
    records: AttendanceRecord[];
}