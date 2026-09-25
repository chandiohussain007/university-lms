import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from './attendance-record.entity';

export class CreateAttendanceSessionDto {
    @IsUUID()
    courseOfferingId: string;

    @IsDateString()
    date: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    topic?: string;
}

export class AttendanceMarkDto {
    @IsUUID()
    studentProfileId: string;

    @IsEnum(AttendanceStatus)
    status: AttendanceStatus;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    note?: string;
}

export class BulkMarkDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AttendanceMarkDto)
    records: AttendanceMarkDto[];
}

export class AttendanceQueryDto {
    @IsUUID()
    @IsOptional()
    courseOfferingId?: string;

    @IsDateString()
    @IsOptional()
    from?: string;

    @IsDateString()
    @IsOptional()
    to?: string;

    @IsInt()
    @Min(1)
    @Max(1000)
    @IsOptional()
    limit?: number;
}