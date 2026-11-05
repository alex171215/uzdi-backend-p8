import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'estructura_institucional', name: 'uzdi' })
export class Uzdi {
  @PrimaryGeneratedColumn({ name: 'uzdi_id' })
  id: number;

  @Column({ name: 'cntn_id', type: 'int4' })
  cntn_id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'zona', type: 'varchar', length: 100 })
  zona: string;

  @Column({ name: 'direccion', type: 'varchar', length: 255, nullable: true })
  direccion?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @Column({ name: 'correo', type: 'varchar', length: 100, nullable: true })
  correo?: string;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
