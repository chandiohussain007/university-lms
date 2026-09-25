import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseFacultyEntity } from '../common/entities/base.entity';
import { Assignment } from './assignment.entity';
import { Profile } from '../profiles/entities/profile.entity';

@Entity('submissions')
@Unique(['assignmentId', 'studentProfileId'])
export class Submission extends BaseFacultyEntity {
    @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
    @JoinColumn({ name: 'assignmentId' })
    assignment: Assignment;

    @Column({ type: 'uuid' })
    assignmentId: string;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: 'studentProfileId' })
    student: Profile;

    @Column({ type: 'uuid' })
    studentProfileId: string;

    @Column({ type: 'text', nullable: true })
    content: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    submittedAt: Date | null;

    @Column({ type: 'float', nullable: true })
    grade: number | null;

    @Column({ type: 'text', nullable: true })
    feedback: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    gradedAt: Date | null;
}