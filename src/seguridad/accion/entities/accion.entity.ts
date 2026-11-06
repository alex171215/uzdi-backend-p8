import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Permiso } from '../../permiso/entities/permiso.entity';

/** seguridad.accn — Acción del sistema sobre la que se otorgan permisos. */
@Entity({ schema: 'seguridad', name: 'accn' })
export class Accion extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'accn_id' })
  id: number;

  @Column({ name: 'ctrl_id', type: 'int4', nullable: true })
  controladorId: number | null;

  @Column({ name: 'mdlo_id', type: 'int4', nullable: true })
  moduloId: number | null;

  @Column({ name: 'tpac_id', type: 'int4', nullable: true })
  tipoAccionId: number | null;

  @Column({ name: 'accnnmbr', type: 'varchar', length: 63 })
  nombre: string;

  @Column({ name: 'accndscr', type: 'varchar', length: 63, nullable: true })
  descripcion: string | null;

  /** Indica si la acción debe auditarse (INT2). */
  @Column({ name: 'accnaudt', type: 'int2', nullable: true })
  auditable: number | null;

  @OneToMany(() => Permiso, (p) => p.accion)
  permisos: Permiso[];
}
