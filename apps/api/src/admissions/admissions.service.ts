import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admission, ApplicationStatus } from './admission.entity';
import { User } from '../users/entities/user.entity';
import { Profile, ProfileType } from '../profiles/entities/profile.entity';

@Injectable()
export class AdmissionsService {
    constructor(
        @InjectRepository(Admission)
        private readonly admissionRepository: Repository<Admission>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) { }

    // ---- Public: anyone can apply ----
    async apply(dto: {
        fullName: string;
        email: string;
        password: string;
        facultyId: string;
        departmentId?: string;
        statementOfPurpose?: string;
    }) {
        const existingApp = await this.admissionRepository.findOne({
            where: { email: dto.email },
        });
        if (existingApp && existingApp.status === ApplicationStatus.PENDING) {
            throw new ConflictException('An application with this email is already under review');
        }
        if (existingApp && existingApp.status === ApplicationStatus.ACCEPTED) {
            throw new ConflictException('This email has already been admitted');
        }

        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existingUser) {
            throw new ConflictException('An account with this email already exists');
        }

        const admission = this.admissionRepository.create({
            applicationCode: 'APP-' + Date.now(),
            fullName: dto.fullName,
            email: dto.email,
            passwordHash: await bcrypt.hash(dto.password, 10),
            facultyId: dto.facultyId,
            departmentId: dto.departmentId ?? null,
            statementOfPurpose: dto.statementOfPurpose ?? null,
            status: ApplicationStatus.PENDING,
        });
        const saved = await this.admissionRepository.save(admission);
        return {
            id: saved.id,
            applicationCode: saved.applicationCode,
            status: saved.status,
            message: 'Application received. You will be notified after review.',
        };
    }

    // ---- Staff/Admin: list applications ----
    findAll(status?: ApplicationStatus) {
        const where = status ? { status } : {};
        return this.admissionRepository.find({
            where,
            relations: ['faculty', 'department'],
            order: { createdAt: 'DESC' },
        });
    }

    findOne(id: string) {
        return this.admissionRepository.findOne({
            where: { id },
            relations: ['faculty', 'department'],
        });
    }

    // ---- Staff/Admin: accept -> provision user + student profile ----
    async decide(id: string, decision: string, reviewerUserId: string) {
        const admission = await this.admissionRepository.findOne({ where: { id } });
        if (!admission) {
            throw new NotFoundException(`Application with ID ${id} not found`);
        }
        if (admission.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException(
                `Application has already been ${admission.status.toLowerCase()}`,
            );
        }

        if (decision === 'ACCEPT') {
            // Never provision twice for the same email
            const existingUser = await this.userRepository.findOne({ where: { email: admission.email } });
            if (existingUser) {
                throw new ConflictException('An account with this email already exists');
            }

            const user = this.userRepository.create({
                email: admission.email,
                passwordHash: admission.passwordHash, // already hashed at apply-time
                isSuperAdmin: false,
            });
            const savedUser = await this.userRepository.save(user);

            const profile = this.profileRepository.create({
                user: savedUser,
                userId: savedUser.id,
                facultyId: admission.facultyId,
                departmentId: admission.departmentId ?? undefined,
                type: ProfileType.STUDENT,
                code: 'S-' + new Date().getFullYear() + '-' + savedUser.id.slice(0, 4).toUpperCase(),
                designation: 'Undergraduate',
                metadata: { admittedVia: admission.applicationCode },
            });
            const savedProfile = await this.profileRepository.save(profile);

            admission.status = ApplicationStatus.ACCEPTED;
            admission.reviewedByUserId = reviewerUserId;
            admission.decidedAt = new Date();
            admission.generatedUserId = savedUser.id;
            admission.generatedProfileId = savedProfile.id;
            await this.admissionRepository.save(admission);

            return {
                id: admission.id,
                applicationCode: admission.applicationCode,
                status: admission.status,
                generatedUserId: savedUser.id,
                generatedProfileId: savedProfile.id,
                message: 'Application accepted. Student account created.',
            };
        }

        if (decision === 'REJECT') {
            admission.status = ApplicationStatus.REJECTED;
            admission.reviewedByUserId = reviewerUserId;
            admission.decidedAt = new Date();
            await this.admissionRepository.save(admission);
            return {
                id: id,
                applicationCode: admission.applicationCode,
                status: admission.status,
                message: 'Application rejected.',
            };
        }

        throw new BadRequestException('Decision must be ACCEPT or REJECT');
    }
}
