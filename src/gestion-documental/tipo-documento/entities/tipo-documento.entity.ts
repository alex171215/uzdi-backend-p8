import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity({ schema: 'gestion_documental', name: 'tipo_documento' })
export class TipoDocumento extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'tpdc_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255, unique: true })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;
}
