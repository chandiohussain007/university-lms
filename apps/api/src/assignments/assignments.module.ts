import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from './assignment.entity';
import { Submission } from './submission.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Enrollment } from '../courses/entities/enrollment.entity';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Assignment,
            Submission,
            Profile,
            Enrollment,
        ]),
        NotificationsModule,
    ],
    controllers: [AssignmentsController],
    providers: [AssignmentsService],
    exports: [TypeOrmModule],
})
export class AssignmentsModule { }