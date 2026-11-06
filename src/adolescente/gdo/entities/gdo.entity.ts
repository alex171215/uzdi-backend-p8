import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { EstadoColumn } from '../../../common/decorators/estado-column.decorator';

@Entity({ schema: 'adolescente', name: 'gdo' })
export class Gdo {
  @EstadoColumn()
  estado: boolean;

  @PrimaryGeneratedColumn({ name: 'gdo_id' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 255 })
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
