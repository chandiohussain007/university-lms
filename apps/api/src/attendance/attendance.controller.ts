import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceSessionDto, BulkMarkDto } from './dto';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    // Teacher: create a session for one of their offerings
    @Post('sessions')
    createSession(@Request() req: any, @Body() dto: CreateAttendanceSessionDto) {
        return this.attendanceService.createSession(dto, req.user.userId);
    }

    // Student: list their own attendance records
    @Get('my-attendance')
    findMyAttendance(@Request() req: any) {
        return this.attendanceService.findStudentAttendance(req.user.userId);
    }

    // Teacher: list sessions they created
    @Get('sessions/mine')
    findMySessions(@Request() req: any) {
        return this.attendanceService.findMySessions(req.user.userId);
    }

    // Teacher: get one session with all student records
    @Get('sessions/:id')
    findOneSession(@Param('id') id: string) {
        return this.attendanceService.findOneSession(id);
    }

    // Teacher: bulk save/update attendance marks for a session
    @Post('sessions/:id/records')
    saveRecords(@Request() req: any, @Param('id') id: string, @Body() dto: BulkMarkDto) {
        return this.attendanceService.saveRecords(id, req.user.userId, dto.records);
    }
}
