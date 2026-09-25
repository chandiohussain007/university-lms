import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Semester } from './entities/semester.entity';
import { CourseOffering } from './entities/course-offering.entity';
import { Enrollment } from './entities/enrollment.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { SemestersController } from './semesters.controller';
import { SemestersService } from './semesters.service';
import { OfferingsController } from './offerings.controller';
import { OfferingsService } from './offerings.service';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
    imports: [TypeOrmModule.forFeature([
        Course,
        Semester,
        CourseOffering,
        Enrollment,
        TimeSlot,
        Profile
    ])],
    controllers: [
        CoursesController,
        SemestersController,
        OfferingsController,
        EnrollmentsController,
    ],
    providers: [
        CoursesService,
        SemestersService,
        OfferingsService,
        EnrollmentsService,
    ],
    exports: [TypeOrmModule],
})
export class CoursesModule { }
