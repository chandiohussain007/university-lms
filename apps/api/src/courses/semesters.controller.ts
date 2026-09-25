import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { Public } from '../common/decorators/public.decorator';
import { CreateSemesterDto, UpdateSemesterDto } from './dto';

@Controller('semesters')
export class SemestersController {
    constructor(private readonly semestersService: SemestersService) { }

    @Public()
    @Get()
    findAll() {
        return this.semestersService.findAll();
    }

    @Public()
    @Get('active')
    findActive() {
        return this.semestersService.findActive();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.semestersService.findOne(id);
    }

    @Post()
    create(@Body() createSemesterDto: CreateSemesterDto) {
        return this.semestersService.create(createSemesterDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSemesterDto: UpdateSemesterDto) {
        return this.semestersService.update(id, updateSemesterDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.semestersService.remove(id);
    }
}