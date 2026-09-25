import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CourseOffering } from './entities/course-offering.entity';
import { Profile, ProfileType } from '../profiles/entities/profile.entity';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class OfferingsService {
    constructor(
        @InjectRepository(CourseOffering)
        private readonly offeringRepository: Repository<CourseOffering>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) { }

    create(createOfferingDto: { courseId: string; semesterId: string; teacherProfileId: string; facultyId?: string }) {
        const offering = this.offeringRepository.create({
            courseId: createOfferingDto.courseId,
            semesterId: createOfferingDto.semesterId,
            teacherProfileId: createOfferingDto.teacherProfileId,
        });
        if (createOfferingDto.facultyId) offering.facultyId = createOfferingDto.facultyId;
        return this.offeringRepository.save(offering);
    }

    findAll(facultyId?: string) {
        // Only filter when the header holds a valid UUID (avoids DB cast errors)
        const where = facultyId && UUID_REGEX.test(facultyId) ? { facultyId } : {};
        return this.offeringRepository.find({
            where,
            relations: ['course', 'semester', 'teacher', 'teacher.user'],
        });
    }

    // Offerings taught by the currently authenticated teacher
    async findMine(userId: string) {
        const teacherProfiles = await this.profileRepository.find({
            where: { userId, type: ProfileType.TEACHER },
        });
        if (teacherProfiles.length === 0) {
            return [];
        }
        return this.offeringRepository.find({
            where: { teacherProfileId: In(teacherProfiles.map((p) => p.id)) },
            relations: ['course', 'semester', 'teacher', 'teacher.user'],
        });
    }

    async findOne(id: string) {
        const offering = await this.offeringRepository.findOne({
            where: { id },
            relations: ['course', 'semester', 'teacher', 'teacher.user'],
        });
        if (!offering) {
            throw new NotFoundException(`Course offering with ID ${id} not found`);
        }
        return offering;
    }

    async update(id: string, updateOfferingDto: { courseId?: string; semesterId?: string; teacherProfileId?: string }) {
        const offering = await this.findOne(id);
        Object.assign(offering, updateOfferingDto);
        return this.offeringRepository.save(offering);
    }

    async remove(id: string) {
        const offering = await this.findOne(id);
        return this.offeringRepository.remove(offering);
    }
}