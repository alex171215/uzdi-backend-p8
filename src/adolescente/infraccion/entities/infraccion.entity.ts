import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

// Catalogo de infracciones (DDL v8). Hereda estado, fcCrea y fcMod de AuditableEntity
@Entity({ schema: 'adolescente', name: 'infraccion' })
export class Infraccion extends AuditableEntity {
  @PrimaryGeneratedColumn({ name: 'infc_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'categoria', type: 'varchar', length: 127 })
  categoria: string;

  @Column({
    name: 'articulo_cona',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  articulo_cona?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;
}
