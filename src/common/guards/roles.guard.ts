import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = context.switchToHttp().getRequest().user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new UnauthorizedException(
        `Rol requerido: ${requiredRoles.join(', ')}. Tu rol: ${user.role}`, // eslint-disable-line @typescript-eslint/no-unsafe-member-access
      );
    }

    return true;
  }
}
