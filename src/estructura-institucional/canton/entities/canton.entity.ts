import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EstadoColumn } from '../../../common/decorators/estado-column.decorator';
import { Provincia } from '../../provincia/entities/provincia.entity';

@Entity({ schema: 'estructura_institucional', name: 'canton' })
export class Canton {
  @EstadoColumn()
  estado: boolean;

  @PrimaryGeneratedColumn({ name: 'cntn_id' })
  id: number;

  @Column({ name: 'prov_id', type: 'int4' })
  prov_id: number;

  @ManyToOne(() => Provincia, { eager: true })
  @JoinColumn({ name: 'prov_id' })
  provincia: Provincia;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({
    name: 'fcCrea',
    type: 'timestamp',
    insert: false,
    update: false,
    nullable: true,
  })
  fcCrea?: Date;

  @Column({
    name: 'fcMod',
    type: 'timestamp',
    insert: false,
    update: false,
    nullable: true,
  })
  fcMod?: Date;
}
