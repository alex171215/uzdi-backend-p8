import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { BooleanVF } from '../../../common/transformers/boolean-vf.transformer';
import { Expediente } from '../../../adolescente/expediente/entities/expediente.entity';
import { User } from '../../../users/entities/user.entity';
import { TipoDocumento } from '../../tipo-documento/entities/tipo-documento.entity';

export const ESTADOS_TRAMITE_DOCUMENTO = [
  'pendiente',
  'recibido',
  'verificado',
  'no aplica',
  'rechazado',
] as const;

export type EstadoTramiteDocumento = (typeof ESTADOS_TRAMITE_DOCUMENTO)[number];

@Entity({ schema: 'gestion_documental', name: 'documento_expediente' })
export class DocumentoExpediente extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'dcex_id' })
  id: number;

  @Column({ name: 'expe_id', type: 'int4' })
  expe_id: number;

  @ManyToOne(() => Expediente, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expe_id' })
  expediente?: Expediente;

  @Column({ name: 'prsn_id', type: 'int4' })
  prsn_id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prsn_id' })
  responsable?: User;

  @Column({ name: 'tpdc_id', type: 'int4' })
  tpdc_id: number;

  @ManyToOne(() => TipoDocumento, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tpdc_id' })
  tipoDocumento?: TipoDocumento;

  @Column({
    name: 'es_habilitante',
    type: 'char',
    length: 1,
    default: 'F',
    transformer: BooleanVF,
  })
  es_habilitante: boolean;

  @Column({
    name: 'estado_tramite',
    type: 'varchar',
    length: 50,
    default: 'pendiente',
  })
  estado_tramite: string;

  @Column({ name: 'numero_documento', type: 'varchar', length: 100, nullable: true })
  numero_documento?: string;

  @Column({ name: 'fecha_documento', type: 'date', nullable: true })
  fecha_documento?: string;

  @Column({ name: 'emisor', type: 'varchar', length: 255, nullable: true })
  emisor?: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
  fecha_registro?: Date;
}
