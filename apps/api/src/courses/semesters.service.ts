import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from './entities/semester.entity';

@Injectable()
export class SemestersService {
    constructor(
        @InjectRepository(Semester)
        private readonly semesterRepository: Repository<Semester>,
    ) { }

    create(createSemesterDto: { name: string; startDate: string; endDate: string; isActive?: boolean }) {
        const semester = this.semesterRepository.create({
            name: createSemesterDto.name,
            startDate: new Date(createSemesterDto.startDate),
            endDate: new Date(createSemesterDto.endDate),
            isActive: createSemesterDto.isActive ?? true,
        });
        return this.semesterRepository.save(semester);
    }

    findAll() {
        return this.semesterRepository.find();
    }

    findActive() {
        return this.semesterRepository.find({ where: { isActive: true } });
    }

    async findOne(id: string) {
        const semester = await this.semesterRepository.findOne({ where: { id } });
        if (!semester) {
            throw new NotFoundException(`Semester with ID ${id} not found`);
        }
        return semester;
    }

    async update(id: string, updateSemesterDto: { name?: string; startDate?: string; endDate?: string; isActive?: boolean }) {
        const semester = await this.findOne(id);
        if (updateSemesterDto.startDate) semester.startDate = new Date(updateSemesterDto.startDate);
        if (updateSemesterDto.endDate) semester.endDate = new Date(updateSemesterDto.endDate);
        if (updateSemesterDto.name !== undefined) semester.name = updateSemesterDto.name;
        if (updateSemesterDto.isActive !== undefined) semester.isActive = updateSemesterDto.isActive;
        return this.semesterRepository.save(semester);
    }

    async remove(id: string) {
        const semester = await this.findOne(id);
        return this.semesterRepository.remove(semester);
    }
}