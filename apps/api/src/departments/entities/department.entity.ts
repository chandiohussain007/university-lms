import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseFacultyEntity } from '../../common/entities/base.entity';
import { Faculty } from '../../faculties/entities/faculty.entity';

@Entity('departments')
export class Department extends BaseFacultyEntity {
    @Column()
    name: string; // e.g. "Computer Science"

    @Column()
    code: string; // e.g. "CS"

    @ManyToOne(() => Faculty, (faculty) => faculty.departments)
    @JoinColumn({ name: 'facultyId' })
    faculty: Faculty;
}
