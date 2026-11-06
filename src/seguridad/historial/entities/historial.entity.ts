import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * seguridad.historial — Auditoría inmutable alimentada por triggers
 * (fn_registrar_historial). Solo lectura desde la API.
 */
@Entity({ schema: 'seguridad', name: 'historial' })
export class Historial {
  @PrimaryGeneratedColumn({ name: 'hist_id' })
  id: number;

  @Column({ name: 'tabla_afectada', type: 'varchar', length: 100 })
  tablaAfectada: string;

  @Column({ name: 'registro_id', type: 'int4' })
  registroId: number;

  @Column({ name: 'usua_id', type: 'int4' })
  usuarioId: number;

  @Column({ name: 'fecha', type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'accion', type: 'varchar', length: 100 })
  accion: string;

  @Column({ name: 'estado_anterior', type: 'text', nullable: true })
  estadoAnterior: string | null;

  @Column({ name: 'estado_nuevo', type: 'text', nullable: true })
  estadoNuevo: string | null;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string | null;
}
