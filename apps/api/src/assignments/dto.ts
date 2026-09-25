import {
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateAssignmentDto {
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(4000)
    description?: string;

    @IsUUID()
    courseOfferingId: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsNumber()
    @Min(1)
    @Max(1000)
    @IsOptional()
    maxScore?: number;
}

export class SubmitAssignmentDto {
    @IsString()
    @IsOptional()
    @MaxLength(20000)
    content?: string;
}

export class GradeSubmissionDto {
    @IsNumber()
    @Min(0)
    grade: number;

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    feedback?: string;
}