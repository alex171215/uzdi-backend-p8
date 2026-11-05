import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BooleanVF } from '../../../common/transformers/boolean-vf.transformer';
import { Nacionalidad } from '../../nacionalidad/entities/nacionalidad.entity';
import { EstadoCivil } from '../../estado-civil/entities/estado-civil.entity';
import { Etnia } from '../../etnia/entities/etnia.entity';
import { Gdo } from '../../gdo/entities/gdo.entity';
import { Canton } from '../../../estructura-institucional/canton/entities/canton.entity';

@Entity({ schema: 'adolescente', name: 'adolescente' })
export class Adolescente {
  @PrimaryGeneratedColumn({ name: 'adlc_id' })
  id: number;

  @Column({ name: 'cedula', type: 'varchar', length: 20, unique: true })
  cedula: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', length: 100 })
  apellido: string;

  @Column({ name: 'fecha_nac', type: 'date' })
  fecha_nac: string;

  @Column({ name: 'sexo', type: 'char', length: 1 })
  sexo: string;

  @Column({ name: 'nved_nombre', type: 'varchar', length: 100, nullable: true })
  nved_nombre?: string;

  @Column({ name: 'hijos', type: 'int2', default: 0 })
  hijos: number;

  // CHAR(1) 'V'/'F' en BD <-> boolean en la API
  @Column({ name: 'reincide', type: 'char', length: 1, default: 'F', transformer: BooleanVF })
  reincide: boolean;

  @Column({ name: 'fecha_ingr', type: 'date' })
  fecha_ingr: string;

  @Column({ name: 'hijoPpl', type: 'char', length: 1, default: 'F', transformer: BooleanVF })
  hijoPpl: boolean;

  @Column({ name: 'observaciones', type: 'varchar', length: 255, nullable: true })
  observaciones?: string;

  // --- Llaves foráneas a catálogos (columna + relación eager para resolver nombre) ---
  @Column({ name: 'nacn_id', type: 'int4' })
  nacn_id: number;

  @ManyToOne(() => Nacionalidad, { eager: true })
  @JoinColumn({ name: 'nacn_id' })
  nacionalidad: Nacionalidad;

  @Column({ name: 'etcv_id', type: 'int4' })
  etcv_id: number;

  @ManyToOne(() => EstadoCivil, { eager: true })
  @JoinColumn({ name: 'etcv_id' })
  estadoCivil: EstadoCivil;

  @Column({ name: 'etna_id', type: 'int4' })
  etna_id: number;

  @ManyToOne(() => Etnia, { eager: true })
  @JoinColumn({ name: 'etna_id' })
  etnia: Etnia;

  @Column({ name: 'cntn_id', type: 'int4' })
  cntn_id: number;

  @ManyToOne(() => Canton, { eager: true })
  @JoinColumn({ name: 'cntn_id' })
  canton: Canton;

  @Column({ name: 'gdo_id', type: 'int4', nullable: true })
  gdo_id?: number;

  @ManyToOne(() => Gdo, { eager: true, nullable: true })
  @JoinColumn({ name: 'gdo_id' })
  gdo?: Gdo;

  @Column({ name: 'fcCrea', type: 'timestamp', insert: false, update: false, nullable: true })
  fcCrea?: Date;

  @Column({ name: 'fcMod', type: 'timestamp', insert: false, update: false, nullable: true })
  fcMod?: Date;
}
