import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// CAMBIO v6/DDL: la medida_socioeducativa es un CATÁLOGO de tipos de medida.
// La medida aplicada a un adolescente vive en `adolescente.expediente`.
@Entity({ schema: 'adolescente', name: 'medida_socioeducativa' })
export class MedidaSocioeducativa {
  @PrimaryGeneratedColumn({ name: 'mdso_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
  nombre: string;

  @Column({ name: 'duracion_meses', type: 'int2', nullable: true })
  duracion_meses?: number;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
