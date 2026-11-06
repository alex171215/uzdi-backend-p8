import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsDateString,
  IsIn,
  IsInt,
  IsBoolean,
  Min,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateAdolescenteDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Matches(/^(?:\d{10}|[A-Za-z0-9]{6,20})$/, {
    message:
      'cedula debe ser una cédula de 10 dígitos o un pasaporte alfanumérico de 6 a 20 caracteres',
  })
  cedula: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  apellido: string;

  @IsDateString()
  fecha_nac: string;

  @IsString()
  @IsIn(['M', 'F', 'O'])
  sexo: string;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  @Matches(/^[\p{L}\p{M} ./'-]+$/u)
  nved_nombre?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  hijos?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  reincide?: boolean;

  @IsDateString()
  fecha_ingr: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  hijoPpl?: boolean;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  observaciones?: string;

  // --- FKs a catálogos ---
  @IsInt()
  @Min(1)
  nacn_id: number;

  @IsInt()
  @Min(1)
  etcv_id: number;

  @IsInt()
  @Min(1)
  etna_id: number;

  @IsInt()
  @Min(1)
  cntn_id: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  gdo_id?: number;
}
