import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoColumn } from '../../../common/decorators/estado-column.decorator';
import { Perfil } from '../../perfil/entities/perfil.entity';
import { UsuarioEntity } from '../../../users/entities/user.entity';

/**
 * seguridad.sesn — Bitácora de sesiones.
 * sesnfcin = inicio de sesión (login), sesnfcfn = cierre (logout).
 * estado 'V' = sesión abierta, 'F' = sesión cerrada.
 * (Esta tabla no tiene fcCrea/fcMod en el DDL v8.)
 */
@Entity({ schema: 'seguridad', name: 'sesn' })
export class Sesion {
  @PrimaryGeneratedColumn({ name: 'sesn_id' })
  id: number;

  @Column({ name: 'prpf_id', type: 'int4', nullable: true })
  prpf_id: number | null;

  @Column({ name: 'prfl_id', type: 'int4' })
  prfl_id: number;

  @Column({ name: 'prsn_id', type: 'int4' })
  prsn_id: number;

  @Column({ name: 'sesnfcin', type: 'timestamp', default: () => 'NOW()' })
  fechaInicio: Date;

  @Column({ name: 'sesnfcfn', type: 'timestamp', nullable: true })
  fechaFin: Date | null;

  @EstadoColumn()
  estado: boolean;

  @ManyToOne(() => Perfil, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prfl_id' })
  perfil: Perfil;

  @ManyToOne(() => UsuarioEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prsn_id' })
  usuario: UsuarioEntity;
}
