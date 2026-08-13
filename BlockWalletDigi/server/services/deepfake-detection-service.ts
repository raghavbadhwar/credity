export interface DeepfakeDetectionResult {
    verdict: 'real' | 'fake' | 'unknown';
    confidence: number | null;
    provider: string;
    reason?: string;
}

export async function detectDeepfakeFromUrl(url: string): Promise<DeepfakeDetectionResult> {
    const endpoint = process.env.DEEPFAKE_API_URL;
    const apiKey = process.env.DEEPFAKE_API_KEY;

    if (!endpoint || !apiKey) {
        return {
            verdict: 'unknown',
            confidence: null,
            provider: 'not_configured',
            reason: 'DEEPFAKE_API_URL or DEEPFAKE_API_KEY not configured',
        };
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            return {
                verdict: 'unknown',
                confidence: null,
                provider: 'remote_api',
                reason: `Provider returned status ${response.status}`,
            };
        }

        const data = await response.json();
        const score = typeof data.score === 'number' ? data.score : null;
        const isFake = data.isFake === true || (typeof score === 'number' && score >= 0.7);
        return {
            verdict: isFake ? 'fake' : 'real',
            confidence: score,
            provider: data.provider || 'remote_api',
        };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            verdict: 'unknown',
            confidence: null,
            provider: 'remote_api',
            reason: error?.message || 'Deepfake provider request failed',
        };
    }
}
