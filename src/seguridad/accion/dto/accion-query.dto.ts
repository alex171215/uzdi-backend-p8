import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoQueryDto } from '../../../common/dto/estado-query.dto';

export class AccionQueryDto extends EstadoQueryDto {
  @ApiPropertyOptional({
    example: 'adolescente',
    description: 'Filtra por texto en el nombre',
  })
  @IsOptional()
  @IsString()
  @MaxLength(63)
  q?: string;
}
