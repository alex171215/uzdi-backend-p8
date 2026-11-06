import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuditableEntity } from '../../common/entities/auditable.entity';
import { User } from './user.entity';

/** seguridad.tipo_persona — Técnico, Coordinador, Administrativo, Director, Otro. */
@Entity({ schema: 'seguridad', name: 'tipo_persona' })
export class TipoPersona extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'tppr_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  nombre: string;

  @OneToMany(() => User, (user) => user.tipoPersona)
  usuarios: User[];
}
