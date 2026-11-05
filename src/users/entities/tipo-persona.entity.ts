import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ schema: 'seguridad', name: 'tipo_persona' })
export class TipoPersona {
  @PrimaryGeneratedColumn({ name: 'tppr_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
