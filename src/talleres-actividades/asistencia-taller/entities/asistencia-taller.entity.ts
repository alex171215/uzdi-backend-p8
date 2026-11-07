import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { BooleanVF } from '../../../common/transformers/boolean-vf.transformer';
import { Taller } from '../../taller/entities/taller.entity';
import { Adolescente } from '../../../adolescente/adolescente/entities/adolescente.entity';
import { AdolescenteRepresentante } from '../../../contexto-familiar/adolescente-representante/entities/adolescente-representante.entity';

@Entity({ schema: 'talleres_actividades', name: 'asistencia_taller' })
export class AsistenciaTaller extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'asta_id' })
  id: number;

  @Column({ name: 'tall_id', type: 'int4' })
  tall_id: number;

  @ManyToOne(() => Taller, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tall_id' })
  taller?: Taller;

  @Column({ name: 'adlc_id', type: 'int4', nullable: true })
  adlc_id?: number | null;

  @ManyToOne(() => Adolescente, { eager: true, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adlc_id' })
  adolescente?: Adolescente | null;

  @Column({ name: 'adre_id', type: 'int4', nullable: true })
  adre_id?: number | null;

  @ManyToOne(
    () => AdolescenteRepresentante,
    { eager: true, nullable: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'adre_id' })
  adolescenteRepresentante?: AdolescenteRepresentante | null;

  @Column({ name: 'tipo_asistente', type: 'varchar', length: 50 })
  tipo_asistente: 'adolescente' | 'representante';

  @Column({
    name: 'asistio',
    type: 'char',
    length: 1,
    default: 'F',
    transformer: BooleanVF,
  })
  asistio: boolean;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones?: string;
}
