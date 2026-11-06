import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Adolescente } from '../../adolescente/entities/adolescente.entity';
import { Infraccion } from '../../infraccion/entities/infraccion.entity';
import { Uzdi } from '../../../estructura-institucional/uzdi/entities/uzdi.entity';
import { MedidaExpediente } from '../../medida-expediente/entities/medida-expediente.entity';

export const ESTADOS_PROCESALES = [
  'En proceso',
  'Atraso',
  'Incomparecencia',
  'Concluido',
  'Archivado',
];

// Tabla adolescente.expediente (DDL v8).
// Ya no tiene mdso_id, las medidas del expediente se guardan en medida_expediente
// porque un expediente puede tener una o varias medidas.
@Entity({ schema: 'adolescente', name: 'expediente' })
export class Expediente extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'expe_id' })
  id: number;

  @Column({ name: 'adlc_id', type: 'int4' })
  adlc_id: number;

  @ManyToOne(() => Adolescente, { eager: true })
  @JoinColumn({ name: 'adlc_id' })
  adolescente: Adolescente;

  @Column({ name: 'uzdi_id', type: 'int4' })
  uzdi_id: number;

  @ManyToOne(() => Uzdi, { eager: true })
  @JoinColumn({ name: 'uzdi_id' })
  uzdi: Uzdi;

  @Column({ name: 'infc_id', type: 'int4' })
  infc_id: number;

  @ManyToOne(() => Infraccion, { eager: true })
  @JoinColumn({ name: 'infc_id' })
  infraccion: Infraccion;

  @Column({
    name: 'numero_causa',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  numero_causa: string | null;

  @Column({
    name: 'estado_procesal',
    type: 'varchar',
    length: 50,
    default: 'En proceso',
  })
  estado_procesal: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string | null;

  @OneToMany(() => MedidaExpediente, (m) => m.expediente)
  medidas: MedidaExpediente[];
}
