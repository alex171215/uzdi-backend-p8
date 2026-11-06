import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

// query que se usa en los catalogos: ?incluirInactivos=true
export class EstadoQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  incluirInactivos?: boolean;
}
