import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFacultyDto {
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    code: string;
}

export class UpdateFacultyDto {
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    @IsOptional()
    name?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    @IsOptional()
    code?: string;
}