import { Global, Module } from '@nestjs/common';
import { RbacService } from './rbac.service';

/** Global para que `RolesGuard` funcione en cualquier módulo que lo use. */
@Global()
@Module({
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}
