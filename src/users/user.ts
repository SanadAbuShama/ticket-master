
export type Role = 'attendee' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  roles: Role[];
}
