import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admission } from './admission.entity';
import { User } from '../users/entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { AdmissionsController } from './admissions.controller';
import { AdmissionsService } from './admissions.service';

@Module({
    imports: [TypeOrmModule.forFeature([Admission, User, Profile])],
    controllers: [AdmissionsController],
    providers: [AdmissionsService],
    exports: [TypeOrmModule],
})
export class AdmissionsModule { }
