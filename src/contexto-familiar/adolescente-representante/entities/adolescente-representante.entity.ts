import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { BooleanVF } from '../../../common/transformers/boolean-vf.transformer';
import { Adolescente } from '../../../adolescente/adolescente/entities/adolescente.entity';
import { Representante } from '../../representante/entities/representante.entity';
import { TipoParentesco } from '../../tipo-parentesco/entities/tipo-parentesco.entity';

@Entity({ schema: 'contexto_familiar', name: 'adolescente_representante' })
@Unique('uq_adolescente_representante', ['adlc_id', 'repr_id'])
export class AdolescenteRepresentante extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'adre_id' })
  id: number;

  @Column({ name: 'adlc_id', type: 'int4' })
  adlc_id: number;

  @ManyToOne(() => Adolescente, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adlc_id' })
  adolescente?: Adolescente;

  @Column({ name: 'repr_id', type: 'int4' })
  repr_id: number;

  @ManyToOne(() => Representante, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'repr_id' })
  representante?: Representante;

  @Column({ name: 'tprt_id', type: 'int4' })
  tprt_id: number;

  @ManyToOne(() => TipoParentesco, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tprt_id' })
  tipoParentesco?: TipoParentesco;

  @Column({
    name: 'es_referente',
    type: 'char',
    length: 1,
    default: 'F',
    transformer: BooleanVF,
  })
  es_referente: boolean;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio?: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin?: string;
}
