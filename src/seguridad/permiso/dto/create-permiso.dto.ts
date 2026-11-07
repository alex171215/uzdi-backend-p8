import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreatePermisoDto {
  @ApiProperty({ example: 4, description: 'prfl_id del perfil' })
  @IsInt({ message: 'prfl_id debe ser un entero' })
  @Min(1)
  prfl_id: number;

  @ApiProperty({ example: 12, description: 'accn_id de la acción' })
  @IsInt({ message: 'accn_id debe ser un entero' })
  @Min(1)
  accn_id: number;
}
