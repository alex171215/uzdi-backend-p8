import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Uzdi } from '../../../estructura-institucional/uzdi/entities/uzdi.entity';
import { User } from '../../../users/entities/user.entity';

@Entity({ schema: 'talleres_actividades', name: 'taller' })
export class Taller extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'tall_id' })
  id: number;

  @Column({ name: 'uzdi_id', type: 'int4' })
  uzdi_id: number;

  @ManyToOne(() => Uzdi, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uzdi_id' })
  uzdi?: Uzdi;

  @Column({ name: 'prsn_id', type: 'int4' })
  prsn_id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prsn_id' })
  responsable?: User;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'tema', type: 'varchar', length: 255 })
  tema: string;

  @Column({ name: 'objetivo', type: 'text', nullable: true })
  objetivo?: string;

  @Column({ name: 'fecha', type: 'date' })
  fecha: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  hora_inicio: string;

  @Column({ name: 'hora_fin', type: 'time' })
  hora_fin: string;

  @Column({ name: 'lugar', type: 'varchar', length: 255, nullable: true })
  lugar?: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;
}
