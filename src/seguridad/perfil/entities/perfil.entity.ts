import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Permiso } from '../../permiso/entities/permiso.entity';

/** seguridad.prfl — Perfil institucional (ADM, CORD, LEGAL, TSOC, PSIC, EDUC, CONS). */
@Entity({ schema: 'seguridad', name: 'prfl' })
export class Perfil extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'prfl_id' })
  id: number;

  /** Perfil padre (jerarquía de perfiles). */
  @Column({ name: 'prflpdre', type: 'int4', nullable: true })
  padreId: number | null;

  @Column({ name: 'prflcdgo', type: 'varchar', length: 5, nullable: true })
  codigo: string | null;

  @Column({ name: 'prflnmbr', type: 'varchar', length: 63 })
  nombre: string;

  @Column({ name: 'prfldscr', type: 'varchar', length: 63, nullable: true })
  descripcion: string | null;

  @Column({ name: 'prflobsr', type: 'varchar', length: 127, nullable: true })
  observaciones: string | null;

  @OneToMany(() => Permiso, (p) => p.perfil)
  permisos: Permiso[];
}
