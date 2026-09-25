import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { Public } from '../common/decorators/public.decorator';
import { CreateFacultyDto, UpdateFacultyDto } from './dto';

@Controller('faculties')
export class FacultiesController {
    constructor(private readonly facultiesService: FacultiesService) { }

    @Public()
    @Get()
    findAll() {
        return this.facultiesService.findAll();
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.facultiesService.findOne(id);
    }

    @Post()
    create(@Body() createFacultyDto: CreateFacultyDto) {
        return this.facultiesService.create(createFacultyDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
        return this.facultiesService.update(id, updateFacultyDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.facultiesService.remove(id);
    }
}
