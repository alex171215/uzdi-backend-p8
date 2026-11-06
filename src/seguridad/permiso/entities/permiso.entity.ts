import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Perfil } from '../../perfil/entities/perfil.entity';
import { Accion } from '../../accion/entities/accion.entity';

/** seguridad.prms — Matriz RBAC: qué acciones puede ejecutar cada perfil. */
@Entity({ schema: 'seguridad', name: 'prms' })
@Unique('uq_prms_prfl_accn', ['prfl_id', 'accn_id'])
export class Permiso extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'prms_id' })
  id: number;

  @Column({ name: 'prfl_id', type: 'int4' })
  prfl_id: number;

  @Column({ name: 'accn_id', type: 'int4' })
  accn_id: number;

  @ManyToOne(() => Perfil, (p) => p.permisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prfl_id' })
  perfil: Perfil;

  @ManyToOne(() => Accion, (a) => a.permisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accn_id' })
  accion: Accion;
}
