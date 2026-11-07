import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Canton } from '../../../estructura-institucional/canton/entities/canton.entity';

@Entity({ schema: 'contexto_familiar', name: 'representante' })
export class Representante extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'repr_id' })
  id: number;

  @Column({ name: 'cntn_id', type: 'int4' })
  cntn_id: number;

  @ManyToOne(() => Canton, { eager: true })
  @JoinColumn({ name: 'cntn_id' })
  canton?: Canton;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', length: 100 })
  apellido: string;

  @Column({ name: 'cedula', type: 'varchar', length: 20, unique: true })
  cedula: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @Column({ name: 'direccion', type: 'varchar', length: 255, nullable: true })
  direccion?: string;
}
