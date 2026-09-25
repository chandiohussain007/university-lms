import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Faculty } from '../faculties/entities/faculty.entity';
import { Department } from '../departments/entities/department.entity';

export enum ApplicationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

@Entity('admissions')
export class Admission extends BaseEntity {
    @Column({ unique: true })
    applicationCode: string; // e.g. APP-1699000000000

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    // Temporary credential for the applicant (hashed on accept)
    @Column()
    passwordHash: string;

    @ManyToOne(() => Faculty)
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;

    @Column({ type: 'uuid' })
    facultyId: string;

    @ManyToOne(() => Department, { nullable: true })
    @JoinColumn({ name: 'departmentId' })
    department: Department;

    @Column({ type: 'uuid', nullable: true })
    departmentId: string | null;

    @Column({ type: 'text', nullable: true })
    statementOfPurpose: string | null;

    @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
    status: ApplicationStatus;

    @Column({ type: 'uuid', nullable: true })
    reviewedByUserId: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    decidedAt: Date | null;

    // Filled when accepted: the provisioned account
    @Column({ type: 'uuid', nullable: true })
    generatedUserId: string | null;

    @Column({ type: 'uuid', nullable: true })
    generatedProfileId: string | null;
}