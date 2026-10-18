import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, registerUser, verifyEmail, loginUser, getCookie, parseCookie } from './helpers.js';
describe('Auth Endpoints', () => {
    let app;
    let testPassword = '12345678';
    let authCookie;
    beforeAll(async () => {
        app = await createTestApp();
    });
    afterAll(async () => {
        await app.close();
    });
    it('POST /auth/register - should send verification code', async () => {
        const testEmail = `test${Date.now()}@test.com`;
        const testUsername = `testuser${Date.now()}`;
        const response = await registerUser(app, {
            username: testUsername,
            email: testEmail,
            password: testPassword,
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.devCode).toBeDefined();
        expect(data.devCode.length).toBe(6);
    });
    it('POST /auth/verify-email - should verify code and return JWT cookie', async () => {
        const registerResponse = await registerUser(app, {
            username: `verifyuser${Date.now()}`,
            email: `verify${Date.now()}@test.com`,
            password: testPassword,
        });
        const registerData = JSON.parse(registerResponse.body);
        const response = await verifyEmail(app, {
            username: registerData.username || `verifyuser${Date.now()}`,
            email: registerData.email || `verify${Date.now()}@test.com`,
            password: testPassword,
            code: registerData.devCode,
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.user).toBeDefined();
        expect(data.user.id).toBeDefined();
        expect(data.user.emailVerified).toBe(true);
        const cookie = getCookie(response.headers);
        expect(cookie).toBeDefined();
        authCookie = parseCookie(cookie);
    });
    it('GET /auth/me - should return current user with valid cookie', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/auth/me',
            headers: { cookie: authCookie },
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.user.id).toBeDefined();
    });
    it('GET /auth/me - should return 401 without cookie', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/auth/me',
        });
        expect(response.statusCode).toBe(401);
    });
    it('POST /auth/login - should login with email/password', async () => {
        const loginEmail = `login${Date.now()}@test.com`;
        const loginUsername = `loginuser${Date.now()}`;
        // First register and verify
        await registerUser(app, {
            username: loginUsername,
            email: loginEmail,
            password: testPassword,
        });
        const registerResponse = await registerUser(app, {
            username: loginUsername + '2',
            email: loginEmail + '2',
            password: testPassword,
        });
        const registerData = JSON.parse(registerResponse.body);
        await verifyEmail(app, {
            username: registerData.username,
            email: registerData.email,
            password: testPassword,
            code: registerData.devCode,
        });
        // Now login
        const response = await loginUser(app, {
            email: registerData.email,
            password: testPassword,
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.user.email).toBe(registerData.email);
    });
    it('POST /auth/logout - should clear cookie', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/auth/logout',
            headers: { cookie: authCookie },
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.message).toContain('cerrada');
    });
    it('POST /auth/register - should fail with duplicate email', async () => {
        const email = `duplicate${Date.now()}@test.com`;
        const username = `dupuser${Date.now()}`;
        // First registration
        await registerUser(app, {
            username,
            email,
            password: testPassword,
        });
        // Second registration with same email
        const response = await registerUser(app, {
            username: username + '2',
            email,
            password: testPassword,
        });
        expect(response.statusCode).toBe(400);
        const data = JSON.parse(response.body);
        expect(data.error).toBeDefined();
    });
    it('POST /auth/verify-email - should fail with wrong code', async () => {
        const registerResponse = await registerUser(app, {
            username: `wrongcode${Date.now()}`,
            email: `wrongcode${Date.now()}@test.com`,
            password: testPassword,
        });
        const response = await verifyEmail(app, {
            username: `wrongcode${Date.now()}`,
            email: `wrongcode${Date.now()}@test.com`,
            password: testPassword,
            code: '000000',
        });
        expect(response.statusCode).toBe(500);
        const data = JSON.parse(response.body);
        expect(data.error).toBe('Internal Server Error');
    });
});
//# sourceMappingURL=auth.test.js.map