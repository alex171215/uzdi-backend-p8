import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EstadoColumn } from '../decorators/estado-column.decorator';

/**
 * Columnas comunes del DDL v8: borrado lógico (`estado` 'V'/'F')
 * y marcas de tiempo "fcCrea" / "fcMod" (fcMod lo actualiza el trigger
 * seguridad.fn_actualizar_fcmod, aquí solo se lee).
 */
export abstract class AuditableEntity {
  @EstadoColumn()
  estado: boolean;

  @CreateDateColumn({ name: 'fcCrea', type: 'timestamp' })
  fcCrea: Date;

  @UpdateDateColumn({ name: 'fcMod', type: 'timestamp' })
  fcMod: Date;
}
