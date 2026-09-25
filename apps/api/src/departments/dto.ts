import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateDepartmentDto {
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(10)
    code: string;

    @IsUUID()
    facultyId: string;
}

export class UpdateDepartmentDto {
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

    @IsUUID()
    @IsOptional()
    facultyId?: string;
}