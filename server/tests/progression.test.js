import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, registerUser, getCookie, parseCookie } from './helpers.js';
describe('Progression & Missions Endpoints', () => {
    let app;
    let testPassword = '12345678';
    let authCookie;
    let userId;
    beforeAll(async () => {
        app = await createTestApp();
        // Create and verify a test user
        const registerResponse = await registerUser(app, {
            username: `proguser${Date.now()}`,
            email: `prog${Date.now()}@test.com`,
            password: '12345678',
        });
        const registerData = JSON.parse(registerResponse.body);
        const verifyResponse = await app.inject({
            method: 'POST',
            url: '/auth/verify-email',
            payload: {
                username: registerData.username,
                email: registerData.email,
                password: '12345678',
                code: registerData.devCode,
            },
        });
        const cookie = getCookie(verifyResponse.headers);
        authCookie = parseCookie(cookie);
    });
    afterAll(async () => {
        await app.close();
    });
    it('GET /progress - should return game progress and level progress', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/progress',
            headers: { cookie: authCookie },
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.gameProgress).toBeDefined();
        expect(data.gameProgress.currentLevelId).toBe(1);
        expect(data.levelProgress).toBeDefined();
        expect(Array.isArray(data.levelProgress)).toBe(true);
    });
    it('POST /progress/1/complete - should complete level 1', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/progress/1/complete',
            headers: {
                cookie: authCookie,
                'Content-Type': 'application/json',
            },
            payload: {
                timeSec: 120,
                stars: 3,
                deaths: 1,
                keys: 2,
                kills: 5,
            },
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.levelProgress.completed).toBe(true);
        expect(data.levelProgress.stars).toBe(3);
        expect(data.xpGain).toBeGreaterThan(0);
        expect(data.coinGain).toBeGreaterThan(0);
        expect(data.gameProgress.currentLevelId).toBe(2);
    });
    it('GET /missions - should return missions (empty initially)', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/missions',
            headers: { cookie: authCookie },
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.missions).toBeDefined();
        expect(Array.isArray(data.missions)).toBe(true);
    });
    it('POST /progress/1/complete again - should update progress', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/progress/1/complete',
            headers: {
                cookie: authCookie,
                'Content-Type': 'application/json',
            },
            payload: {
                timeSec: 90,
                stars: 3,
                deaths: 0,
                keys: 1,
                kills: 3,
            },
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        // Second completion with better time
        expect(data.levelProgress.bestTimeSec).toBeLessThanOrEqual(120);
    });
    it('POST /progress/999/complete - should fail with invalid level', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/progress/999/complete',
            headers: {
                cookie: authCookie,
                'Content-Type': 'application/json',
            },
            payload: {
                timeSec: 120,
                stars: 3,
                deaths: 1,
                keys: 2,
                kills: 5,
            },
        });
        expect(response.statusCode).toBe(404);
    });
    it('GET /progress after completion - should show updated progress', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/progress',
            headers: { cookie: authCookie },
        });
        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.ok).toBe(true);
        expect(data.gameProgress.currentLevelId).toBe(2);
        expect(data.levelProgress.length).toBeGreaterThan(0);
        expect(data.levelProgress[0].completed).toBe(true);
        expect(data.levelProgress[0].stars).toBe(3);
    });
});
//# sourceMappingURL=progression.test.js.map