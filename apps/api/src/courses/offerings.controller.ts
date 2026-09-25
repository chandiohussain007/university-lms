import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OfferingsService } from './offerings.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ProfileType } from '../profiles/entities/profile.entity';
import { CreateOfferingDto, UpdateOfferingDto } from './dto';

@Controller('offerings')
export class OfferingsController {
    constructor(private readonly offeringsService: OfferingsService) { }

    @Get('mine')
    @UseGuards(AuthGuard('jwt'))
    findMine(@Request() req: any) {
        return this.offeringsService.findMine(req.user.userId);
    }

    @Public()
    @Get()
    findAll(@Headers('x-faculty-id') facultyId?: string) {
        return this.offeringsService.findAll(facultyId);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.offeringsService.findOne(id);
    }

    @Roles(ProfileType.TEACHER, ProfileType.FACULTY_ADMIN)
    @Post()
    create(@Body() createOfferingDto: CreateOfferingDto) {
        return this.offeringsService.create(createOfferingDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOfferingDto: UpdateOfferingDto) {
        return this.offeringsService.update(id, updateOfferingDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.offeringsService.remove(id);
    }
}