import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ProfileType } from '../profiles/entities/profile.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

// User administration — sensitive. Only Super Admins (or FACULTY_ADMIN role
// claim holders) may create/update/delete; listing requires authentication.
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(ProfileType.FACULTY_ADMIN)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Roles(ProfileType.FACULTY_ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Roles(ProfileType.FACULTY_ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
