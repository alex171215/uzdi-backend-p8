import { IsString, IsNotEmpty, IsOptional, Length, IsDateString, IsIn, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdolescenteDto {
  @IsString() @IsNotEmpty() @Length(1, 20)
  cedula: string;

  @IsString() @IsNotEmpty() @Length(1, 100)
  nombre: string;

  @IsString() @IsNotEmpty() @Length(1, 100)
  apellido: string;

  @IsDateString()
  fecha_nac: string;

  @IsString() @IsIn(['M', 'F', 'O'])
  sexo: string;

  @IsString() @IsOptional() @Length(0, 100)
  nved_nombre?: string;

  @IsInt() @Min(0) @IsOptional() @Type(() => Number)
  hijos?: number;

  @IsBoolean() @IsOptional()
  reincide?: boolean;

  @IsDateString()
  fecha_ingr: string;

  @IsBoolean() @IsOptional()
  hijoPpl?: boolean;

  @IsString() @IsOptional() @Length(0, 255)
  observaciones?: string;

  // --- FKs a catálogos ---
  @IsInt() @Type(() => Number)
  nacn_id: number;

  @IsInt() @Type(() => Number)
  etcv_id: number;

  @IsInt() @Type(() => Number)
  etna_id: number;

  @IsInt() @Type(() => Number)
  cntn_id: number;

  @IsInt() @IsOptional() @Type(() => Number)
  gdo_id?: number;
}
