import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseFacultyEntity } from '../common/entities/base.entity';
import { CourseOffering } from '../courses/entities/course-offering.entity';
import { Submission } from './submission.entity';

@Entity('assignments')
@Unique(['courseOfferingId', 'title'])
export class Assignment extends BaseFacultyEntity {
    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => CourseOffering)
    @JoinColumn({ name: 'courseOfferingId' })
    courseOffering: CourseOffering;

    @Column({ type: 'uuid' })
    courseOfferingId: string;

    @Column({ type: 'timestamptz', nullable: true })
    dueDate: Date | null;

    @Column({ type: 'int', default: 100 })
    maxScore: number;

    @OneToMany(() => Submission, (submission) => submission.assignment)
    submissions: Submission[];
}