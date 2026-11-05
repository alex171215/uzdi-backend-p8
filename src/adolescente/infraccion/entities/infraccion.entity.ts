import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'adolescente', name: 'infraccion' })
export class Infraccion {
  @PrimaryGeneratedColumn({ name: 'infc_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'categoria', type: 'varchar', length: 127 })
  categoria: string;

  @Column({ name: 'articulo_cona', type: 'varchar', length: 50, nullable: true })
  articulo_cona?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
