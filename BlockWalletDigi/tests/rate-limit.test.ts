import { describe, expect, it } from 'vitest';
import { checkRateLimit } from '../server/services/auth-service';

describe('Rate Limiting Security', () => {
    it('should allow requests up to the limit', () => {
        const key = 'test-allow-limit';
        const limit = 5;
        const window = 1000;

        for (let i = 0; i < limit; i++) {
            expect(checkRateLimit(key, limit, window)).toBe(true);
        }
    });

    it('should block requests exceeding the limit', () => {
        const key = 'test-block-limit';
        const limit = 5;
        const window = 1000;

        for (let i = 0; i < limit; i++) {
            checkRateLimit(key, limit, window);
        }

        expect(checkRateLimit(key, limit, window)).toBe(false);
    });

    it('should reset limit after window expires', async () => {
        const key = 'test-reset-limit';
        const limit = 1;
        const window = 100;

        expect(checkRateLimit(key, limit, window)).toBe(true);
        expect(checkRateLimit(key, limit, window)).toBe(false);

        // Wait for window to expire
        await new Promise(resolve => setTimeout(resolve, window + 50));

        expect(checkRateLimit(key, limit, window)).toBe(true);
    });
});
