/**
 * Trust Score Service
 * Implements the Credity Trust Score algorithm as defined in PRD Section 5.1 Feature 3
 * 
 * Score Components (0-100 total):
 * - Identity Verification (40%): Liveness, Document, Biometrics
 * - Activity & Behavior (30%): Verifications, Connections, Recency
 * - Reputation & Trust (30%): Suspicious activity, Endorsements, Feedback
 */

export interface TrustScoreBreakdown {
    identity: {
        livenessPassed: number;      // 0-20 points
        documentVerified: number;     // 0-15 points
        biometricsMatched: number;    // 0-5 points
        total: number;                // 0-40 points
    };
    activity: {
        verificationCount: number;    // 0-15 points
        platformConnections: number;  // 0-10 points
        recencyBonus: number;         // 0-5 points
        total: number;                // 0-30 points
    };
    reputation: {
        noSuspiciousActivity: number; // 0-15 points
        platformEndorsements: number; // 0-10 points
        userFeedback: number;         // 0-5 points
        total: number;                // 0-30 points
    };
    totalScore: number;             // 0-100
    level: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding';
    levelLabel: string;
}

export interface TrustScoreImprovement {
    action: string;
    points: number;
    category: 'quick_win' | 'long_term';
    timeEstimate: string;
    completed: boolean;
}

export interface UserTrustData {
    userId: number;
    // Identity verification flags
    livenessVerified: boolean;
    documentVerified: boolean;
    biometricsSetup: boolean;
    digilockerConnected: boolean;
    // Activity metrics
    totalCredentials: number;
    totalVerifications: number;
    platformConnectionCount: number;
    lastActivityDate: Date | null;
    // Reputation
    suspiciousActivityFlags: number;
    endorsementCount: number;
    positiveFeedbackCount: number;
    negativeFeedbackCount: number;
}

/**
 * Calculate trust score based on user data
 */
export function calculateTrustScore(userData: UserTrustData): TrustScoreBreakdown {
    // Identity Verification (90% - Identity Centric)
    // - Liveness (Proof of Personhood): 40 pts
    // - DigiLocker (Government ID): 30 pts
    // - Biometrics (Secure Enclave): 20 pts
    const identity = {
        livenessPassed: userData.livenessVerified ? 40 : 0,
        documentVerified: userData.documentVerified ? 30 : (userData.digilockerConnected ? 20 : 0),
        biometricsMatched: userData.biometricsSetup ? 20 : 0,
        total: 0
    };
    identity.total = identity.livenessPassed + identity.documentVerified + identity.biometricsMatched;

    // Activity & Behavior (10%)
    const activity = {
        verificationCount: Math.min(4, userData.totalVerifications), // 4 pts max
        platformConnections: Math.min(3, userData.platformConnectionCount), // 3 pts max
        recencyBonus: calculateRecencyBonus(userData.lastActivityDate) > 0 ? 3 : 0, // 3 pts max
        total: 0
    };
    activity.total = activity.verificationCount + activity.platformConnections + activity.recencyBonus;

    // Reputation (Merged into Activity for simplicity in this model or kept minimal)
    const reputation = {
        noSuspiciousActivity: userData.suspiciousActivityFlags === 0 ? 0 : -50, // Penalty only
        platformEndorsements: 0,
        userFeedback: 0,
        total: 0
    };
    // apply penalty to total score instead of component

    // Total Score
    let totalScore = identity.total + activity.total;
    if (userData.suspiciousActivityFlags > 0) {
        totalScore = Math.max(0, totalScore - 50);
    }

    // Ensure 0-100 range
    totalScore = Math.min(100, Math.max(0, totalScore));

    const { level, levelLabel } = getScoreLevel(totalScore);

    return {
        identity,
        activity,
        reputation,
        totalScore,
        level,
        levelLabel
    };
}

/**
 * Calculate recency bonus based on last activity
 */
function calculateRecencyBonus(lastActivity: Date | null): number {
    if (!lastActivity) return 0;

    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceActivity <= 1) return 5;      // Active today/yesterday
    if (daysSinceActivity <= 7) return 4;      // Active this week
    if (daysSinceActivity <= 30) return 2;     // Active this month
    return 0;                                   // Inactive
}

/**
 * Calculate feedback score from positive/negative ratio
 */
function calculateFeedbackScore(positive: number, negative: number): number {
    if (positive + negative === 0) return 2; // Neutral baseline

    const ratio = positive / (positive + negative);
    return Math.round(ratio * 5);
}

/**
 * Get score level and label
 */
function getScoreLevel(score: number): { level: TrustScoreBreakdown['level']; levelLabel: string } {
    if (score >= 95) return { level: 'outstanding', levelLabel: 'Outstanding' };
    if (score >= 85) return { level: 'excellent', levelLabel: 'Excellent' };
    if (score >= 70) return { level: 'good', levelLabel: 'Good' };
    if (score >= 50) return { level: 'fair', levelLabel: 'Fair' };
    return { level: 'poor', levelLabel: 'Poor' };
}

/**
 * Generate improvement suggestions based on current score
 */
export function generateImprovementSuggestions(userData: UserTrustData, breakdown: TrustScoreBreakdown): TrustScoreImprovement[] {
    const suggestions: TrustScoreImprovement[] = [];

    // Quick wins (3-5 points, <5 minutes)
    if (!userData.documentVerified && !userData.digilockerConnected) {
        suggestions.push({
            action: 'Connect DigiLocker to verify your documents',
            points: 12,
            category: 'quick_win',
            timeEstimate: '2 minutes',
            completed: false
        });
    }

    if (userData.totalCredentials < 3) {
        suggestions.push({
            action: 'Add more credentials to your wallet',
            points: 5,
            category: 'quick_win',
            timeEstimate: '3 minutes',
            completed: false
        });
    }

    if (userData.platformConnectionCount < 3) {
        suggestions.push({
            action: 'Connect to more platforms for wider verification',
            points: 4,
            category: 'quick_win',
            timeEstimate: '5 minutes',
            completed: false
        });
    }

    // Long-term actions (10-15 points)
    if (!userData.livenessVerified) {
        suggestions.push({
            action: 'Complete liveness verification',
            points: 20,
            category: 'long_term',
            timeEstimate: '1 minute',
            completed: false
        });
    }

    if (!userData.biometricsSetup) {
        suggestions.push({
            action: 'Set up biometric authentication (Face ID / Fingerprint)',
            points: 5,
            category: 'long_term',
            timeEstimate: '2 minutes',
            completed: false
        });
    }

    if (userData.endorsementCount < 5) {
        suggestions.push({
            action: 'Get endorsements from verified platforms',
            points: 10,
            category: 'long_term',
            timeEstimate: '1-2 weeks',
            completed: false
        });
    }

    // Sort by points (highest first)
    return suggestions.sort((a, b) => b.points - a.points);
}

/**
 * Get historical trend data (mock for now, would connect to DB)
 */
export function getScoreHistory(userId: number): { date: string; score: number }[] {
    // In production, this would fetch from database
    // For now, generate realistic mock data
    const today = new Date();
    const history: { date: string; score: number }[] = [];

    let baseScore = 45;
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Simulate gradual improvement with some variance
        baseScore = Math.min(100, baseScore + Math.random() * 2 - 0.5);

        history.push({
            date: date.toISOString().split('T')[0],
            score: Math.round(baseScore)
        });
    }

    return history;
}
