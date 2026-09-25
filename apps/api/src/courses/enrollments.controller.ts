import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentStatus } from './entities/enrollment.entity';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ProfileType } from '../profiles/entities/profile.entity';
import { CreateEnrollmentDto, UpdateGradeDto, UpdateEnrollmentStatusDto } from './dto';

@Controller('enrollments')
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    findMyEnrollments(@Request() req: any) {
        return this.enrollmentsService.findMyEnrollments(req.user.userId);
    }

    @Get('gpa')
    @UseGuards(AuthGuard('jwt'))
    getGpa(@Request() req: any) {
        return this.enrollmentsService.calculateGpa(req.user.userId);
    }

    @Get('my-schedule')
    @UseGuards(AuthGuard('jwt'))
    findMySchedule(@Request() req: any) {
        return this.enrollmentsService.findMySchedule(req.user.userId);
    }

    @Get('offering/:offeringId')
    findOfferingRoster(@Param('offeringId') offeringId: string) {
        return this.enrollmentsService.findOfferingRoster(offeringId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.enrollmentsService.findOne(id);
    }

    @Roles(ProfileType.FACULTY_ADMIN, ProfileType.STAFF, ProfileType.TEACHER)
    @Post()
    create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
        return this.enrollmentsService.create(createEnrollmentDto);
    }

    @Roles(ProfileType.TEACHER, ProfileType.FACULTY_ADMIN)
    @Patch(':id/grade')
    updateGrade(@Param('id') id: string, @Body() dto: UpdateGradeDto) {
        return this.enrollmentsService.updateGrade(id, dto.grade);
    }

    @Roles(ProfileType.TEACHER, ProfileType.FACULTY_ADMIN)
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: UpdateEnrollmentStatusDto) {
        return this.enrollmentsService.updateStatus(id, dto.status as EnrollmentStatus);
    }

    @Roles(ProfileType.FACULTY_ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.enrollmentsService.remove(id);
    }
}