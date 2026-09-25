import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('faculties')
export class Faculty extends BaseEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    code: string; // e.g. 'ENG', 'ARTS'

    @OneToMany(() => Department, (dept) => dept.faculty)
    departments: Department[];
}
