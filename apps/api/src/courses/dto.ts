import {
    IsDateString,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    title: string;

    @IsString()
    @MinLength(2)
    @MaxLength(15)
    code: string;

    @IsInt()
    @Min(1)
    @Max(10)
    credits: number;

    @IsUUID()
    departmentId: string;
}

export class UpdateCourseDto {
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    @IsOptional()
    title?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(15)
    @IsOptional()
    code?: string;

    @IsInt()
    @Min(1)
    @Max(10)
    @IsOptional()
    credits?: number;

    @IsUUID()
    @IsOptional()
    departmentId?: string;
}

export class CreateSemesterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    isActive?: boolean;
}

export class UpdateSemesterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @IsOptional()
    name?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsOptional()
    isActive?: boolean;
}

export class CreateOfferingDto {
    @IsUUID()
    courseId: string;

    @IsUUID()
    semesterId: string;

    @IsUUID()
    teacherProfileId: string;
}

export class UpdateOfferingDto {
    @IsUUID()
    @IsOptional()
    courseId?: string;

    @IsUUID()
    @IsOptional()
    semesterId?: string;

    @IsUUID()
    @IsOptional()
    teacherProfileId?: string;
}

export class CreateEnrollmentDto {
    @IsUUID()
    studentProfileId: string;

    @IsUUID()
    courseOfferingId: string;
}

export class UpdateGradeDto {
    @IsNumber()
    @Min(0)
    @Max(100)
    grade: number;
}

export class UpdateEnrollmentStatusDto {
    @IsString()
    status: string;
}