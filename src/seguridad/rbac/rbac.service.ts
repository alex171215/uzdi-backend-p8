import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** Tiempo de vida de la matriz de permisos en memoria. */
const TTL_MS = 60_000;

interface MatrizRbac {
  /** Todas las acciones registradas en seguridad.accn (activas o no). */
  registradas: Set<string>;
  /** prfl_id -> acciones permitidas (prms, accn y prfl activos). */
  permisos: Map<number, Set<string>>;
  cargadaEn: number;
}

/**
 * Tarea 5.3 — Consulta en tiempo real de la matriz RBAC del recuadro ER CAI
 * (seguridad.prfl ↔ seguridad.prms ↔ seguridad.accn).
 *
 * La matriz se lee de la BD y se guarda en memoria 60 s para no hacer una
 * consulta por cada petición. Cualquier cambio en perfiles, acciones o
 * permisos llama a `invalidar()` y la siguiente petición la vuelve a leer.
 */
@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);
  private matriz: MatrizRbac | null = null;
  private cargando: Promise<MatrizRbac> | null = null;

  constructor(private readonly dataSource: DataSource) {}

  invalidar(): void {
    this.matriz = null;
    this.cargando = null; // descarta una carga en curso iniciada antes del cambio
  }

  private async cargar(): Promise<MatrizRbac> {
    const acciones: { accnnmbr: string }[] = await this.dataSource.query(
      'SELECT accnnmbr FROM seguridad.accn',
    );
    const filas: { prfl_id: number; accnnmbr: string }[] =
      await this.dataSource.query(
        `SELECT p.prfl_id, a.accnnmbr
         FROM seguridad.prms p
         JOIN seguridad.accn a ON a.accn_id = p.accn_id
         JOIN seguridad.prfl f ON f.prfl_id = p.prfl_id
        WHERE p.estado = 'V' AND a.estado = 'V' AND f.estado = 'V'`,
      );

    const permisos = new Map<number, Set<string>>();
    for (const { prfl_id, accnnmbr } of filas) {
      if (!permisos.has(prfl_id)) permisos.set(prfl_id, new Set());
      permisos.get(prfl_id)?.add(accnnmbr);
    }

    this.logger.debug(
      `Matriz RBAC cargada: ${acciones.length} acciones, ${filas.length} permisos`,
    );
    return {
      registradas: new Set(acciones.map((a) => a.accnnmbr)),
      permisos,
      cargadaEn: Date.now(),
    };
  }

  private async obtener(): Promise<MatrizRbac> {
    if (this.matriz && Date.now() - this.matriz.cargadaEn < TTL_MS)
      return this.matriz;
    if (this.cargando === null) {
      this.cargando = this.cargar().finally(() => (this.cargando = null));
    }
    this.matriz = await this.cargando;
    return this.matriz;
  }

  /** ¿La acción está dada de alta en seguridad.accn? */
  async accionRegistrada(accion: string): Promise<boolean> {
    return (await this.obtener()).registradas.has(accion);
  }

  /** ¿El perfil tiene la acción habilitada en seguridad.prms? */
  async perfilTieneAccion(prflId: number, accion: string): Promise<boolean> {
    return (await this.obtener()).permisos.get(prflId)?.has(accion) ?? false;
  }

  /** Acciones permitidas para un perfil (para el frontend: mostrar/ocultar menús). */
  async accionesDePerfil(prflId: number): Promise<string[]> {
    return [...((await this.obtener()).permisos.get(prflId) ?? [])].sort();
  }

  /**
   * La sesión del token sigue abierta en seguridad.sesn y el usuario sigue activo.
   * Así el logout y la desactivación de un usuario invalidan el token al instante.
   */
  async sesionVigente(sesionId: number, usuarioId: number): Promise<boolean> {
    const filas: unknown[] = await this.dataSource.query(
      `SELECT 1
         FROM seguridad.sesn s
         JOIN seguridad.prsn u ON u.prsn_id = s.prsn_id
        WHERE s.sesn_id = $1 AND s.prsn_id = $2
          AND s.sesnfcfn IS NULL AND s.estado = 'V' AND u.estado = 'V'
        LIMIT 1`,
      [sesionId, usuarioId],
    );
    return filas.length > 0;
  }
}
