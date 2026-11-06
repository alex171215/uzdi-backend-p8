import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Expediente } from '../../expediente/entities/expediente.entity';
import { MedidaSocioeducativa } from '../../medida-socioeducativa/entities/medida-socioeducativa.entity';

export const ESTADOS_CUMPLIMIENTO = [
  'En proceso',
  'Cumplida',
  'Incumplida',
  'Sustituida',
  'Suspendida',
];

// Tabla adolescente.medida_expediente (DDL v8).
// Guarda las medidas que se le pusieron a un expediente.
// orden: distinto orden = una despues de otra, mismo orden = al mismo tiempo.
@Entity({ schema: 'adolescente', name: 'medida_expediente' })
export class MedidaExpediente extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'mdex_id' })
  id: number;

  @Column({ name: 'expe_id', type: 'int4' })
  expe_id: number;

  @ManyToOne(() => Expediente, (e) => e.medidas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expe_id' })
  expediente: Expediente;

  @Column({ name: 'mdso_id', type: 'int4' })
  mdso_id: number;

  @ManyToOne(() => MedidaSocioeducativa, { eager: true })
  @JoinColumn({ name: 'mdso_id' })
  medida: MedidaSocioeducativa;

  @Column({ name: 'orden', type: 'int4' })
  orden: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fecha_inicio: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin: string | null;

  @Column({
    name: 'estado_cumplimiento',
    type: 'varchar',
    length: 50,
    default: 'En proceso',
  })
  estado_cumplimiento: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string | null;
}
