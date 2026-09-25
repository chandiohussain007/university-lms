import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';

@Injectable()
export class FacultiesService {
    constructor(
        @InjectRepository(Faculty)
        private readonly facultyRepository: Repository<Faculty>,
    ) { }

    create(createFacultyDto: { name: string; code: string }) {
        const faculty = this.facultyRepository.create(createFacultyDto);
        return this.facultyRepository.save(faculty);
    }

    findAll() {
        return this.facultyRepository.find();
    }

    async findOne(id: string) {
        const faculty = await this.facultyRepository.findOne({ where: { id } });
        if (!faculty) {
            throw new NotFoundException(`Faculty with ID ${id} not found`);
        }
        return faculty;
    }

    async update(id: string, updateFacultyDto: { name?: string; code?: string }) {
        const faculty = await this.findOne(id);
        Object.assign(faculty, updateFacultyDto);
        return this.facultyRepository.save(faculty);
    }

    async remove(id: string) {
        const faculty = await this.findOne(id);
        return this.facultyRepository.remove(faculty);
    }
}
