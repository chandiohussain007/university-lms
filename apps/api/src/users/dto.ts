import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsBoolean()
    @IsOptional()
    isSuperAdmin?: boolean;
}

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsBoolean()
    @IsOptional()
    isSuperAdmin?: boolean;
}