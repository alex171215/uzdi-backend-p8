import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity({ schema: 'contexto_familiar', name: 'tipo_parentesco' })
export class TipoParentesco extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'tprt_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100, unique: true })
  nombre: string;
}
