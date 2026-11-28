
import { z } from 'zod';
import { userRole, users } from '../database/schema/index.js';

export const ROLES = ['attendee', 'organizer', 'admin'] as const;

export type Role = (typeof ROLES)[number]; 

export type UserRow = typeof users.$inferSelect;

export type InternalUser = Pick<UserRow, 'id' | 'name' | 'email' | 'emailVerified' | 'roles'>;

export const userResponseSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    roles: z.array(z.enum(ROLES)),
});

export type UserResponse = z.infer<typeof userResponseSchema>

export const toUserResponse = (user: InternalUser): UserResponse => ({
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
});