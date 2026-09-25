import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseFacultyEntity } from '../../common/entities/base.entity';
import { Department } from '../../departments/entities/department.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';

@Entity('courses')
export class Course extends BaseFacultyEntity {
    @Column()
    title: string;

    @Column()
    code: string; // e.g. "CS-101"

    @Column({ type: 'int' })
    credits: number;

    @ManyToOne(() => Department)
    @JoinColumn({ name: 'departmentId' })
    department: Department;

    @Column({ type: 'uuid' })
    departmentId: string;

    @ManyToOne(() => Faculty)
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;
}
