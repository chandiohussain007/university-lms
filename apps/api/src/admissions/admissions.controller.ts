import { Body, Controller, Get, Param, Post, Query, Request, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdmissionsService } from './admissions.service';
import { CreateApplicationDto, DecisionDto } from './dto';
import { ApplicationStatus } from './admission.entity';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ProfileType } from '../profiles/entities/profile.entity';

@Controller('admissions')
export class AdmissionsController {
    constructor(private readonly admissionsService: AdmissionsService) { }

    // Public: anyone can apply (no account needed)
    @Public()
    @Post('apply')
    apply(@Body() dto: CreateApplicationDto) {
        return this.admissionsService.apply(dto);
    }

    // Staff / admins review applications
    @Roles(ProfileType.STAFF, ProfileType.FACULTY_ADMIN)
    @Get()
    findAll(@Query('status') status?: ApplicationStatus) {
        return this.admissionsService.findAll(status);
    }

    @Roles(ProfileType.STAFF, ProfileType.FACULTY_ADMIN)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.admissionsService.findOne(id);
    }

    // Staff / admins accept or reject. Accept provisions the student account.
    @Roles(ProfileType.STAFF, ProfileType.FACULTY_ADMIN)
    @Post(':id/decision')
    decide(
        @Request() req: any,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: DecisionDto,
    ) {
        return this.admissionsService.decide(id, dto.decision, req.user.userId);
    }
}
