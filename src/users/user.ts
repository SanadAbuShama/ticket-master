
import { userRole } from '../database/schema/index.js';

type Role = (typeof userRole.enumValues)[number];

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string,
  roles: Role[];
}
