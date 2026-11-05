import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'gestion_documental', name: 'tipo_documento' })
export class TipoDocumento {
  @PrimaryGeneratedColumn({ name: 'tpdc_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
