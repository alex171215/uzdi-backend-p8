import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

// Catalogo de tipos de medida (DDL v8).
// La medida que se le asigna a un expediente se guarda en medida_expediente.
@Entity({ schema: 'adolescente', name: 'medida_socioeducativa' })
export class MedidaSocioeducativa extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'mdso_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255, unique: true })
  nombre: string;

  @Column({ name: 'duracion_meses', type: 'int2', nullable: true })
  duracion_meses?: number;
}
