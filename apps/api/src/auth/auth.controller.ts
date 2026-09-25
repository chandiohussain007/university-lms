import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto';
import { Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Body() dto: LoginDto, @Request() req: any) {
        return this.authService.login(req.user);
    }

    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
