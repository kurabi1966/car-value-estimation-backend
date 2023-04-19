import { Expose, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsLongitude,
  IsLatitude,
  Max,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @Min(0)
  @Max(5000000)
  price: number;

  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(1930)
  @Max(2050)
  @IsNotEmpty()
  year: number;

  @IsNotEmpty()
  @IsLongitude()
  lng: number;

  @IsNumber()
  @IsNotEmpty()
  @IsLatitude()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1000000)
  mileage: number;
}

export class ReportDto {
  @Expose()
  id: number;
  @Expose()
  price: number;
  @Expose()
  make: string;
  @Expose()
  model: string;
  @Expose()
  year: number;
  @Expose()
  lng: number;
  @Expose()
  lat: number;
  @Expose()
  mileage: number;
  @Expose()
  created_at: Date;
  @Expose()
  updated_at: Date;

  @Transform(({ obj }) => {
    return obj.user?.id;
  })
  @Expose()
  userId: number;

  @Expose()
  approved: boolean;
}

export class ApproveReportDto {
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;
}

export class GetEstimateDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1930)
  @Max(2050)
  @Transform(({ value }) => parseInt(value))
  year: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  @Transform(({ value }) => parseInt(value))
  mileage: number;

  @IsLongitude()
  @Transform(({ value }) => parseFloat(value))
  lng: number;

  @IsLatitude()
  @Transform(({ value }) => parseFloat(value))
  lat: number;
}

export class GetReportsDto {
  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1930)
  @Max(2050)
  @Transform(({ value }) => parseInt(value))
  year?: number;

  @IsOptional()
  @IsString()
  approved?: string;

  @IsOptional()
  @IsLongitude()
  @Transform(({ value }) => parseFloat(value))
  lng?: number;

  @IsOptional()
  @IsLatitude()
  @Transform(({ value }) => parseFloat(value))
  lat?: number;
}
