import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
    constructor(
        @InjectRepository(Department)
        private readonly departmentRepository: Repository<Department>,
    ) { }

    create(createDepartmentDto: { name: string; code: string; facultyId: string }) {
        const department = this.departmentRepository.create(createDepartmentDto);
        return this.departmentRepository.save(department);
    }

    findAll() {
        return this.departmentRepository.find({ relations: ['faculty'] });
    }

    async findOne(id: string) {
        const department = await this.departmentRepository.findOne({ where: { id }, relations: ['faculty'] });
        if (!department) {
            throw new NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }

    async update(id: string, updateDepartmentDto: { name?: string; code?: string; facultyId?: string }) {
        const department = await this.findOne(id);
        Object.assign(department, updateDepartmentDto);
        return this.departmentRepository.save(department);
    }

    async remove(id: string) {
        const department = await this.findOne(id);
        return this.departmentRepository.remove(department);
    }
}
