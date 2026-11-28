import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { appOptions, configureApp } from '../src/app.setup.js';
import { sessions, users } from '../src/database/schema/index.js';
import { ErrorCode, messageByCode } from '../src/common/errors/error.codes.js';
import type { ErrorDetail } from '../src/common/errors/error.types.js';

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let db: NodePgDatabase;

    async function signUpAndGetCookie(email = 'sara@mail.com'): Promise<string[]> {
        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/sign-up')
            .send({ name: 'Sara', email, password: 'a-long-password-123' })
            .expect(201);

        return response.headers['set-cookie'] as unknown as string[];
    }

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = moduleRef.createNestApplication(appOptions);
        configureApp(app);
        await app.init();
        db = app.get(getDrizzleToken());
    });

    beforeEach(async () => {
        await db.execute(sql`TRUNCATE users CASCADE`);
    });

    afterAll(async () => {
        await app?.close();
    });

    describe('POST /api/v1/auth/sign-up', () => {
        it('creates the user, signs them in, and returns only safe fields', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-up')
                .send({ name: 'Sara', email: '  Sara@Mail.com ', password: 'a-long-password-123' })
                .expect(201);

            // Exactly these fields: nothing else (like emailVerified or the hash) leaks.
            expect(response.body).toEqual({
                id: expect.any(String),
                name: 'Sara',
                email: 'sara@mail.com',
                roles: ['attendee'],
            });

            // A session cookie was set, with the attributes we chose.
            const cookie = String(response.headers['set-cookie']);
            expect(cookie).toContain('__Host-sid=');
            expect(cookie).toContain('HttpOnly');
            expect(cookie).toContain('Secure');
            expect(cookie).toContain('SameSite=Lax');

            // The database holds a scrypt hash, never the password.
            const [row] = await db.select().from(users).where(eq(users.email, 'sara@mail.com'));
            expect(row?.passwordHash).toMatch(/^\$scrypt\$/);
            expect(row?.passwordHash).not.toContain('a-long-password-123');
        });

        it('rejects an email that is already registered, in any letter case', async () => {
            // Arrange: an existing user
            await request(app.getHttpServer())
                .post('/api/v1/auth/sign-up')
                .send({ name: 'Sara', email: 'sara@mail.com', password: 'a-long-password-123' })
                .expect(201);

            // Act: sign up again with the same email, differently written
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-up')
                .send({ name: 'Another Sara', email: ' SARA@Mail.com', password: 'another-password-456' })
                .expect(409);

            // Assert: the documented error, and still only one user
            expect(response.body).toEqual({
                error: {
                    code: ErrorCode.EMAIL_TAKEN,
                    message: messageByCode[ErrorCode.EMAIL_TAKEN],
                },
            });

            const rows = await db.select().from(users).where(eq(users.email, 'sara@mail.com'));
            expect(rows).toHaveLength(1);
            expect(rows[0]?.name).toBe('Sara');
        });

        it('rejects invalid email and password and lists the exact reasons', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-up')
                .send({ name: 'Another Sara', email: 'sara@mail', password: '123' })
                .expect(400);

            expect(response.body.error.code).toBe(ErrorCode.VALIDATION_FAILED);
            expect(response.body.error.message).toBe(messageByCode[ErrorCode.VALIDATION_FAILED]);
            const fields = response.body.error.details.map((detail: ErrorDetail) => detail.field);
            expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
            expect(fields).not.toContain('name');

            const rows = await db.select().from(users);
            expect(rows).toHaveLength(0);
        });

        it('rejects signing up as an admin, and creates no user', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-up')
                .send({ name: 'Mallory', email: 'mallory@mail.com', password: 'a-long-password-123', role: 'admin' })
                .expect(400);

            expect(response.body.error.code).toBe(ErrorCode.VALIDATION_FAILED);

            const fields = response.body.error.details.map((detail: ErrorDetail) => detail.field);
            expect(fields).toContain('role');

            const rows = await db.select().from(users);
            expect(rows).toHaveLength(0);
        });

        it('gives a user who signs up as an organizer both the attendee and organizer roles', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-up')
                .send({ name: 'Omar', email: 'omar@mail.com', password: 'a-long-password-123', role: 'organizer' })
                .expect(201);

            expect(response.body.roles).toEqual(expect.arrayContaining(['attendee', 'organizer']));
            expect(response.body.roles).toHaveLength(2);

            const [row] = await db.select().from(users).where(eq(users.email, 'omar@mail.com'));
            expect(row?.roles).toEqual(expect.arrayContaining(['attendee', 'organizer']));
            expect(row?.roles).toHaveLength(2);
        });

        it('gives a user who signs up without a role only the attendee role', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-up')
                .send({ name: 'Lina', email: 'lina@mail.com', password: 'a-long-password-123' })
                .expect(201);

            expect(response.body.roles).toEqual(['attendee']);

            const [row] = await db.select().from(users).where(eq(users.email, 'lina@mail.com'));
            expect(row?.roles).toEqual(['attendee']);
        });

        it('stores only a hash of the session token, never the token itself', async () => {
            const cookie = await signUpAndGetCookie();

            const token = String(cookie).split(';')[0]!.split('=')[1]!;

            const [session] = await db.select().from(sessions);
            expect(session?.id).toBeDefined();
            expect(session?.id).not.toBe(token);
            expect(session?.id).not.toContain(token);
        });
    });

    describe('POST /api/v1/auth/sign-in', () => {
        beforeEach(async () => {
            await signUpAndGetCookie();
        });

        it('signs in with the right password and starts a working session', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-in')
                .send({ email: ' Sara@Mail.com', password: 'a-long-password-123' })
                .expect(200);

            expect(response.body).toEqual({
                id: expect.any(String),
                name: 'Sara',
                email: 'sara@mail.com',
                roles: ['attendee'],
            });

            const cookie = response.headers['set-cookie'];
            expect(String(cookie)).toContain('__Host-sid=');

            const me = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', cookie)
                .expect(200);

            expect(me.body.email).toBe('sara@mail.com');
        });

        it('returns the same error for a wrong password and an unknown email', async () => {
            const wrongPassword = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-in')
                .send({ email: 'sara@mail.com', password: 'not-the-right-password' })
                .expect(401);

            const unknownEmail = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-in')
                .send({ email: 'nobody@mail.com', password: 'a-long-password-123' })
                .expect(401);

            const expected = {
                error: {
                    code: ErrorCode.INVALID_CREDENTIALS,
                    message: messageByCode[ErrorCode.INVALID_CREDENTIALS],
                },
            };
            expect(wrongPassword.body).toEqual(expected);
            expect(unknownEmail.body).toEqual(expected);

            expect(wrongPassword.headers['set-cookie']).toBeUndefined();
            expect(unknownEmail.headers['set-cookie']).toBeUndefined();
        });

        it('rejects a suspended user with the same error as wrong credentials', async () => {
            await db.update(users).set({ status: 'suspended' }).where(eq(users.email, 'sara@mail.com'));

            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-in')
                .send({ email: 'sara@mail.com', password: 'a-long-password-123' })
                .expect(401);

            expect(response.body.error.code).toBe(ErrorCode.INVALID_CREDENTIALS);
            expect(response.headers['set-cookie']).toBeUndefined();
        });

        it('issues a new session token on every sign-in', async () => {
            const first = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-in')
                .send({ email: 'sara@mail.com', password: 'a-long-password-123' })
                .expect(200);

            const second = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-in')
                .send({ email: 'sara@mail.com', password: 'a-long-password-123' })
                .expect(200);

            expect(String(first.headers['set-cookie'])).not.toBe(String(second.headers['set-cookie']));
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('returns the signed-in user', async () => {
            const cookie = await signUpAndGetCookie();

            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', cookie)
                .expect(200);

            expect(response.body).toEqual({
                id: expect.any(String),
                name: 'Sara',
                email: 'sara@mail.com',
                roles: ['attendee'],
            });
        });

        it('rejects a request without a session cookie', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .expect(401);

            expect(response.body).toEqual({
                error: {
                    code: ErrorCode.UNAUTHENTICATED,
                    message: messageByCode[ErrorCode.UNAUTHENTICATED],
                },
            });
        });

        it('rejects a made-up session cookie', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', '__Host-sid=not-a-real-session')
                .expect(401);
        });

        it('rejects a session whose user has been suspended', async () => {
            const cookie = await signUpAndGetCookie();

            await db.update(users).set({ status: 'suspended' }).where(eq(users.email, 'sara@mail.com'));

            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', cookie)
                .expect(401);

            const remaining = await db.select().from(sessions);
            expect(remaining).toHaveLength(0);
        });

        it('rejects a session that has been idle for longer than the idle timeout', async () => {
            const cookie = await signUpAndGetCookie();

            // Pretend the session was last used 4 days ago (the idle timeout is 3 days).
            await db.update(sessions).set({ lastActiveAt: daysAgo(4) });

            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', cookie)
                .expect(401);
        });

        it('keeps a session that was used within the idle timeout', async () => {
            const cookie = await signUpAndGetCookie();

            await db.update(sessions).set({ lastActiveAt: daysAgo(2) });

            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', cookie)
                .expect(200);
        });

        it('rejects a session past its absolute expiry, even if recently used', async () => {
            const cookie = await signUpAndGetCookie();

            await db.update(sessions).set({ expiresAt: daysAgo(1) });

            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', cookie)
                .expect(401);
        });
    });

    describe('POST /api/v1/auth/sign-out', () => {
        it('ends the session, so the old cookie no longer works', async () => {
            const cookie = await signUpAndGetCookie();

            const signOut = await request(app.getHttpServer())
                .post('/api/v1/auth/sign-out')
                .set('Cookie', cookie)
                .expect(204);

            expect(String(signOut.headers['set-cookie'])).toContain('__Host-sid=');

            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Cookie', cookie)
                .expect(401);

            const remaining = await db.select().from(sessions);
            expect(remaining).toHaveLength(0);
        });

        it('rejects signing out without a session', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/sign-out')
                .expect(401);
        });
    });
});