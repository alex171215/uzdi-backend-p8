import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ schema: 'estructura_institucional', name: 'canton' })
export class Canton {
  @PrimaryGeneratedColumn({ name: 'cntn_id' })
  id: number;

  @Column({ name: 'prov_id', type: 'int4' })
  prov_id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
