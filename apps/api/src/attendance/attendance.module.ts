import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Enrollment } from '../courses/entities/enrollment.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

@Module({
    imports: [TypeOrmModule.forFeature([
        AttendanceSession,
        AttendanceRecord,
        Profile,
        Enrollment,
    ])],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [TypeOrmModule],
})
export class AttendanceModule { }
