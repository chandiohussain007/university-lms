import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseFacultyEntity } from '../../common/entities/base.entity';
import { CourseOffering } from './course-offering.entity';

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

@Entity('time_slots')
export class TimeSlot extends BaseFacultyEntity {
    @ManyToOne(() => CourseOffering, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseOfferingId' })
    courseOffering: CourseOffering;

    @Column({ type: 'uuid' })
    courseOfferingId: string;

    @Column({
        type: 'enum',
        enum: DayOfWeek,
    })
    dayOfWeek: DayOfWeek;

    @Column({ type: 'varchar', length: 10 })
    startTime: string; // e.g. "09:00"

    @Column({ type: 'varchar', length: 10 })
    endTime: string; // e.g. "10:30"

    @Column({ type: 'varchar', nullable: true })
    room: string; // e.g. "Hall A-101"
}
