import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EstadoColumn } from '../../../common/decorators/estado-column.decorator';
import { Canton } from '../../canton/entities/canton.entity';

@Entity({ schema: 'estructura_institucional', name: 'uzdi' })
export class Uzdi {
  @EstadoColumn()
  estado: boolean;

  @PrimaryGeneratedColumn({ name: 'uzdi_id' })
  id: number;

  @Column({ name: 'cntn_id', type: 'int4' })
  cntn_id: number;

  @ManyToOne(() => Canton, { eager: true })
  @JoinColumn({ name: 'cntn_id' })
  canton: Canton;

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
