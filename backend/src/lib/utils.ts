import type { UserRoleType } from '../../prisma/generated/zod/index.js';
import type { auth } from './auth.js';

export function hasRole(
  user: typeof auth.$Infer.Session.user,
  role: UserRoleType[] | UserRoleType
) {
  if (Array.isArray(role)) {
    return role.includes(user.role as UserRoleType);
  }

  return user.role === role;
}
