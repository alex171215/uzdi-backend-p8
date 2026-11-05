import { Column, ColumnOptions } from 'typeorm';
import { BooleanVF } from '../transformers/boolean-vf.transformer';

/**
 * Decorador estandarizado para la columna 'estado' CHAR(1) ('V'/'F')
 * requerido en todas las tablas del DDL v8.
 * 
 * Uso en entidades TypeORM:
 * ```typescript
 * @EstadoColumn()
 * estado: boolean;
 * ```
 */
export function EstadoColumn(options?: Partial<ColumnOptions>): PropertyDecorator {
  return Column({
    name: 'estado',
    type: 'char',
    length: 1,
    default: 'V',
    transformer: BooleanVF,
    ...options,
  });
}

