import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Perfil } from '../../perfil/entities/perfil.entity';

/**
 * seguridad.prpf — Perfiles institucionales asignados a cada persona.
 * Creada en db/02_seguridad_rbac.sql (el DDL v8 solo tenía la columna sesn.prpf_id).
 * Un usuario solo puede iniciar sesión con un perfil que tenga asignado aquí.
 */
@Entity({ schema: 'seguridad', name: 'prpf' })
@Unique('uq_prpf_prsn_prfl', ['prsn_id', 'prfl_id'])
export class PersonaPerfil extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'prpf_id' })
  id: number;

  @Column({ name: 'prsn_id', type: 'int4' })
  prsn_id: number;

  @Column({ name: 'prfl_id', type: 'int4' })
  prfl_id: number;

  @ManyToOne(() => Perfil, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prfl_id' })
  perfil: Perfil;
}
