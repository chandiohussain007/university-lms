import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('semesters')
export class Semester extends BaseEntity {
    @Column()
    name: string; // e.g. "Fall 2024"

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ default: true })
    isActive: boolean;
}
