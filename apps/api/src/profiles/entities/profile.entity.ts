import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseFacultyEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';
import { Department } from '../../departments/entities/department.entity';

export enum ProfileType {
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
    STAFF = 'STAFF',
    FACULTY_ADMIN = 'FACULTY_ADMIN',
}

@Entity('profiles')
export class Profile extends BaseFacultyEntity {
    @Column({
        type: 'enum',
        enum: ProfileType,
    })
    type: ProfileType;

    // e.g. "S-2024-001" for students, or Employee ID
    @Column({ nullable: true })
    code: string;

    // e.g. "Assistant Professor", "Undergraduate Student"
    @Column({ nullable: true })
    designation: string;

    // JSONB for flexible fields (e.g. { "joiningDate": "...", "specialization": "AI" })
    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @ManyToOne(() => User, (user) => user.profiles)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => Faculty)
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;

    @ManyToOne(() => Department, { nullable: true })
    @JoinColumn({ name: 'departmentId' })
    department: Department;

    @Column({ type: 'uuid', nullable: true })
    departmentId: string;
}
