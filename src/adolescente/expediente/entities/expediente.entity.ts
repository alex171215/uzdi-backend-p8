import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Adolescente } from '../../adolescente/entities/adolescente.entity';
import { MedidaSocioeducativa } from '../../medida-socioeducativa/entities/medida-socioeducativa.entity';
import { Infraccion } from '../../infraccion/entities/infraccion.entity';
import { Uzdi } from '../../../estructura-institucional/uzdi/entities/uzdi.entity';

// DDL: el expediente es el registro operativo por adolescente que enlaza
// infracción + medida + uzdi con un estado y las fechas de la medida.
@Entity({ schema: 'adolescente', name: 'expediente' })
export class Expediente {
  @PrimaryGeneratedColumn({ name: 'expe_id' })
  id: number;

  @Column({ name: 'estado', type: 'varchar', length: 50 })
  estado: string;

  @Column({ name: 'fecha_inicio_medida', type: 'date' })
  fecha_inicio_medida: string;

  @Column({ name: 'fecha_fin_medida', type: 'date', nullable: true })
  fecha_fin_medida?: string;

  @Column({ name: 'adlc_id', type: 'int4' })
  adlc_id: number;

  @ManyToOne(() => Adolescente, { eager: true })
  @JoinColumn({ name: 'adlc_id' })
  adolescente: Adolescente;

  @Column({ name: 'uzdi_id', type: 'int4' })
  uzdi_id: number;

  @ManyToOne(() => Uzdi, { eager: true })
  @JoinColumn({ name: 'uzdi_id' })
  uzdi: Uzdi;

  @Column({ name: 'infc_id', type: 'int4' })
  infc_id: number;

  @ManyToOne(() => Infraccion, { eager: true })
  @JoinColumn({ name: 'infc_id' })
  infraccion: Infraccion;

  @Column({ name: 'mdso_id', type: 'int4' })
  mdso_id: number;

  @ManyToOne(() => MedidaSocioeducativa, { eager: true })
  @JoinColumn({ name: 'mdso_id' })
  medida: MedidaSocioeducativa;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
