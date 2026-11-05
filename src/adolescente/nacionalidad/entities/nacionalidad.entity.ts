import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'adolescente', name: 'nacionalidad' })
export class Nacionalidad {
  @PrimaryGeneratedColumn({ name: 'nacn_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
