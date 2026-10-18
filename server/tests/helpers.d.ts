import type { FastifyInstance } from 'fastify';
export declare function createTestApp(): Promise<FastifyInstance>;
export declare function registerUser(app: FastifyInstance, data: {
    username: string;
    email: string;
    password: string;
}): Promise<import("light-my-request").Response>;
export declare function verifyEmail(app: FastifyInstance, data: {
    username: string;
    email: string;
    password: string;
    code: string;
}): Promise<import("light-my-request").Response>;
export declare function loginUser(app: FastifyInstance, data: {
    email: string;
    password: string;
}): Promise<import("light-my-request").Response>;
export declare function createAuthenticatedUser(app: FastifyInstance, overrides?: Partial<{
    username: string;
    email: string;
    password: string;
}>): Promise<{
    username: string;
    email: string;
    password: string;
    authCookie: string;
    userId: any;
}>;
//# sourceMappingURL=helpers.d.ts.map