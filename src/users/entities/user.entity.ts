import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { TipoPersona } from './tipo-persona.entity';

@Entity({ schema: 'seguridad', name: 'prsn' })
export class User {
  @PrimaryGeneratedColumn({ name: 'prsn_id' })
  id: number;

  @Column({ name: 'uzdi_id', type: 'int4', nullable: true })
  uzdi_id: number;

  @Column({ name: 'tppr_id', type: 'int4', nullable: true })
  tppr_id?: number;

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

  @Column({ name: 'prsnpass', type: 'varchar', length: 63 })
  password?: string;

  @Column({ name: 'prsnobsr', type: 'varchar', length: 255, nullable: true })
  observaciones: string;

  @ManyToMany(() => TipoPersona, tp => tp.users, { eager: true, cascade: true })
  @JoinTable({
    name: 'prsn_tppr',
    schema: 'seguridad',
    joinColumn:        { name: 'prsn_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tppr_id', referencedColumnName: 'id' },
  })
  roles: TipoPersona[];
}
