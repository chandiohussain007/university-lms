import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseFacultyEntity } from '../../common/entities/base.entity';
import { CourseOffering } from './course-offering.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';

export enum EnrollmentStatus {
    ENROLLED = 'ENROLLED',
    WAITLISTED = 'WAITLISTED',
    DROPPED = 'DROPPED',
    COMPLETED = 'COMPLETED',
}

@Entity('enrollments')
export class Enrollment extends BaseFacultyEntity {
    @ManyToOne(() => CourseOffering)
    @JoinColumn({ name: 'courseOfferingId' })
    courseOffering: CourseOffering;

    @Column({ type: 'uuid' })
    courseOfferingId: string;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: 'studentProfileId' })
    student: Profile;

    @Column({ type: 'uuid' })
    studentProfileId: string;

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.ENROLLED,
    })
    status: EnrollmentStatus;

    @Column({ type: 'float', nullable: true })
    grade: number;

    @Column({ type: 'varchar', nullable: true })
    letterGrade: string;

    @Column({ type: 'float', nullable: true })
    gradePoints: number;

    @ManyToOne(() => Faculty)
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;
}
