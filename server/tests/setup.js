// Test setup - runs before all tests
process.env.NODE_ENV = 'test';
process.env.NODE_ENV = 'development'; // Force development for email service
// Increase timeout for slow operations
vi.setConfig({ testTimeout: 60000 });
// Global test app instance
import { createApp } from '../src/app.js';
let _testApp = null;
export async function getTestApp() {
    if (!_testApp) {
        _testApp = await createApp();
        await _testApp.ready();
    }
    return _testApp;
}
export async function closeTestApp() {
    if (_testApp) {
        await _testApp.close();
        _testApp = null;
    }
}
// Clean up after all tests
afterAll(async () => {
    await closeTestApp();
});
//# sourceMappingURL=setup.js.map