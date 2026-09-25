import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
    ) { }

    create(createCourseDto: { title: string; code: string; credits: number; departmentId: string; facultyId?: string }) {
        const course = this.courseRepository.create(createCourseDto);
        return this.courseRepository.save(course);
    }

    findAll(facultyId?: string) {
        // Only filter when the header holds a valid UUID (avoids DB cast errors)
        const where = facultyId && UUID_REGEX.test(facultyId) ? { facultyId } : {};
        return this.courseRepository.find({
            where,
            relations: ['department'],
        });
    }

    async findOne(id: string) {
        const course = await this.courseRepository.findOne({
            where: { id },
            relations: ['department'],
        });
        if (!course) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return course;
    }

    async update(id: string, updateCourseDto: { title?: string; code?: string; credits?: number; departmentId?: string }) {
        const course = await this.findOne(id);
        Object.assign(course, updateCourseDto);
        return this.courseRepository.save(course);
    }

    async remove(id: string) {
        const course = await this.findOne(id);
        return this.courseRepository.remove(course);
    }
}