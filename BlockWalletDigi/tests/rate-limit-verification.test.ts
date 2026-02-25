import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../server/services/auth-service';

describe('Rate Limiting Logic', () => {
    it('should allow requests within limit', () => {
        const key = 'test-key-1';
        // First request: allowed
        expect(checkRateLimit(key, 2, 1000)).toBe(true);
        // Second request: allowed (count = 2)
        expect(checkRateLimit(key, 2, 1000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
        const key = 'test-key-2';
        // First request: allowed
        expect(checkRateLimit(key, 1, 1000)).toBe(true);
        // Second request: blocked (count > 1)
        expect(checkRateLimit(key, 1, 1000)).toBe(false);
    });
});
