import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: { email: string; password: string; isSuperAdmin?: boolean }) {
        const existing = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existing) {
            throw new ConflictException(`User with email ${createUserDto.email} already exists`);
        }
        const user = this.userRepository.create({
            email: createUserDto.email,
            passwordHash: await bcrypt.hash(createUserDto.password, 10),
            isSuperAdmin: createUserDto.isSuperAdmin ?? false,
        });
        const saved = await this.userRepository.save(user);
        const { passwordHash, ...result } = saved;
        return result;
    }

    async findAll() {
        const users = await this.userRepository.find();
        return users.map(({ passwordHash, ...rest }) => rest);
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        const { passwordHash, ...result } = user;
        return result;
    }

    async update(id: string, updateUserDto: { email?: string; isSuperAdmin?: boolean }) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        Object.assign(user, updateUserDto);
        const saved = await this.userRepository.save(user);
        const { passwordHash, ...result } = saved;
        return result;
    }

    async findOneByEmail(email: string) {
        return this.userRepository.findOne({ where: { email } });
    }

    async findOneByEmailWithRelations(email: string) {
        return this.userRepository.findOne({
            where: { email },
            relations: ['profiles'] // Load profiles to get role
        });
    }

    async remove(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepository.remove(user);
        return { deleted: true, id };
    }
}
