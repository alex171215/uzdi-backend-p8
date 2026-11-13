import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { auditContextStorage } from '../context/audit-context.storage';

/**
 * Suscriptor TypeORM para inyectar transaccionalmente la variable de sesión
 * `app.usuario_id` en la conexión activa de PostgreSQL justo antes de
 * cualquier inserción, actualización o eliminación, alimentando de forma
 * segura y real los triggers de `seguridad.historial`.
 */
@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  private async injectAuditContext(queryRunner: any) {
    const userId = auditContextStorage.getStore();
    if (userId && queryRunner && !queryRunner.isReleased) {
      try {
        await queryRunner.query(
          "SELECT set_config('app.usuario_id', $1, true)",
          [String(userId)],
        );
      } catch {
        // Silencioso si la conexión no está en transacción
      }
    }
  }

  async beforeInsert(event: InsertEvent<any>) {
    await this.injectAuditContext(event.queryRunner);
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    await this.injectAuditContext(event.queryRunner);
  }

  async beforeRemove(event: RemoveEvent<any>) {
    await this.injectAuditContext(event.queryRunner);
  }
}

