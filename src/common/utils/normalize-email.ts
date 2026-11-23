export const normalizeEmail = (email: string) => email.trim().normalize('NFC').toLowerCase();
