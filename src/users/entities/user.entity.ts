import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditableEntity } from '../../common/entities/auditable.entity';
import { TipoPersona } from './tipo-persona.entity';

/**
 * seguridad.prsn — Usuario del sistema (alias de dominio: UsuarioEntity).
 *
 * Cambio DDL v8: la relación con tipo_persona es 1:N mediante la FK
 * prsn.tppr_id. La tabla puente `prsn_tppr` que usaba la versión
 * anterior NO existe en el DDL, por eso se reemplazó el ManyToMany.
 */
@Entity({ schema: 'seguridad', name: 'prsn' })
export class User extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'prsn_id' })
  id: number;

  @Column({ name: 'uzdi_id', type: 'int4', nullable: true })
  uzdi_id: number | null;

  @Column({ name: 'tppr_id', type: 'int4', nullable: true })
  tppr_id: number | null;

  @Column({ name: 'prsnnmbr', type: 'varchar', length: 31 })
  nombres: string;

  @Column({ name: 'prsnapll', type: 'varchar', length: 31 })
  apellidos: string;

  @Column({ name: 'prsnsexo', type: 'char', length: 1, nullable: true })
  sexo: string;

  @Column({ name: 'prsndire', type: 'varchar', length: 255, nullable: true })
  direccion: string;

  @Column({ name: 'prsntelf', type: 'varchar', length: 63, nullable: true })
  telefono: string;

  @Column({ name: 'prsnmail', type: 'varchar', length: 63, nullable: true })
  correo: string;

  @Column({ name: 'prsnlogn', type: 'varchar', length: 30, unique: true })
  login: string;

  /** Hash bcrypt. No se selecciona por defecto para no filtrarlo en respuestas. */
  @Column({ name: 'prsnpass', type: 'varchar', length: 63, select: false })
  password?: string;

  @Column({ name: 'prsnobsr', type: 'varchar', length: 255, nullable: true })
  observaciones: string;

  @ManyToOne(() => TipoPersona, (tp) => tp.usuarios, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tppr_id' })
  tipoPersona: TipoPersona | null;
}

/** Alias de dominio pedido en la Tarea 3.1. */
export { User as UsuarioEntity };
