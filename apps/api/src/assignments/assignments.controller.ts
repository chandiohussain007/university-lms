import { Controller, Get, Post, Body, Param, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, SubmitAssignmentDto, GradeSubmissionDto } from './dto';

@Controller('assignments')
@UseGuards(AuthGuard('jwt'))
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    // Teacher: assignments across my offerings
    @Get('mine')
    findMine(@Request() req: any) {
        return this.assignmentsService.findMine(req.user.userId);
    }

    // Student: assignments for my enrolled courses (+ my submission)
    @Get('student')
    findForStudent(@Request() req: any) {
        return this.assignmentsService.findForStudent(req.user.userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const assignment = await this.assignmentsService.findOne(id);
        if (!assignment) throw new NotFoundException(`Assignment with ID ${id} not found`);
        return assignment;
    }

    // Teacher: create assignment
    @Post()
    create(@Request() req: any, @Body() dto: CreateAssignmentDto) {
        return this.assignmentsService.create(dto, req.user.userId);
    }

    // Teacher: submissions for an assignment
    @Get(':id/submissions')
    findSubmissions(@Request() req: any, @Param('id') id: string) {
        return this.assignmentsService.findSubmissions(id, req.user.userId);
    }

    // Student: submit work
    @Post(':id/submit')
    submit(@Request() req: any, @Param('id') id: string, @Body() dto: SubmitAssignmentDto) {
        return this.assignmentsService.submit(id, req.user.userId, dto.content);
    }

    // Teacher: grade a submission
    @Post('submissions/:submissionId/grade')
    grade(
        @Request() req: any,
        @Param('submissionId') submissionId: string,
        @Body() dto: GradeSubmissionDto,
    ) {
        return this.assignmentsService.grade(submissionId, req.user.userId, dto.grade, dto.feedback);
    }
}