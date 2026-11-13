import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Contexto asíncrono para propagar el identificador del usuario autenticado (ID real de la BD)
 * hacia los suscriptores y transacciones de TypeORM sin depender de cabeceras HTTP inseguras.
 */
export const auditContextStorage = new AsyncLocalStorage<number>();

