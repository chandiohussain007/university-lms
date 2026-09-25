import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsUUID()
    facultyId: string;

    @IsUUID()
    @IsOptional()
    departmentId?: string;

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    statementOfPurpose?: string;
}

export class DecisionDto {
    @IsString()
    decision: string;
}