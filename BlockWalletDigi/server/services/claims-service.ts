/**
 * Claims Verification Service
 * Implements PRD v3.1 Feature 2: Claims Verification System (B2B Core)
 * 
 * Three-Layer Verification:
 * - Layer 1: Identity Verification (WHO) - 40%
 * - Layer 2: Claims Validation (WHAT) - 30%
 * - Layer 3: Evidence Authentication (PROOF) - 30%
 */

export interface TimelineEvent {
    event: string;
    time: string;
    location: string;
}

export interface EvidenceItem {
    type: 'image' | 'video' | 'document';
    url: string;
    uploadedAt: string;
}

export interface ClaimVerifyRequest {
    userId: string;
    claimType: 'insurance_auto' | 'refund_request' | 'age_verification' | 'identity_check';
    claimAmount?: number;
    description: string;
    timeline: TimelineEvent[];
    evidence: EvidenceItem[];
    userCredentials: string[];
}

export interface ClaimVerifyResponse {
    claimId: string;
    trustScore: number;
    recommendation: 'approve' | 'review' | 'investigate' | 'reject';
    breakdown: {
        identityScore: number;
        integrityScore: number;
        authenticityScore: number;
    };
    redFlags: string[];
    aiAnalysis: {
        deepfakeDetected: boolean;
        timelineConsistent: boolean;
        fraudPatternMatch: number;
        llmConfidence: number;
    };
    processingTimeMs: number;
    costBreakdown: {
        identityVerification: number;
        mlInference: number;
        llmAnalysis: number;
        deepfakeCheck: number;
        blockchainTimestamp: number;
        totalInr: number;
    };
}

/**
 * Main claims verification function
 * Implements the 3-layer verification process per PRD v3.1
 */
export async function verifyClaim(request: ClaimVerifyRequest): Promise<ClaimVerifyResponse> {
    const startTime = Date.now();
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Layer 1: Identity Verification (WHO)
    const identityResult = await verifyIdentity(request);

    // Layer 2: Claims Validation (WHAT)
    const integrityResult = await validateClaim(request);

    // Layer 3: Evidence Authentication (PROOF)
    const authenticityResult = await authenticateEvidence(request);

    // Calculate Trust Score using PRD v3.1 formula
    // Trust Score = (Identity × 0.4) + (Integrity × 0.3) + (Authenticity × 0.3)
    const trustScore = Math.round(
        (identityResult.score * 0.4) +
        (integrityResult.score * 0.3) +
        (authenticityResult.score * 0.3)
    );

    // Determine recommendation based on Trust Score
    const recommendation = getRecommendation(trustScore);

    // Combine all red flags
    const redFlags = [
        ...identityResult.redFlags,
        ...integrityResult.redFlags,
        ...authenticityResult.redFlags
    ];

    const processingTimeMs = Date.now() - startTime;

    return {
        claimId,
        trustScore,
        recommendation,
        breakdown: {
            identityScore: identityResult.score,
            integrityScore: integrityResult.score,
            authenticityScore: authenticityResult.score
        },
        redFlags,
        aiAnalysis: {
            deepfakeDetected: authenticityResult.deepfakeDetected,
            timelineConsistent: integrityResult.timelineConsistent,
            fraudPatternMatch: integrityResult.fraudPatternMatch,
            llmConfidence: integrityResult.llmConfidence
        },
        processingTimeMs,
        costBreakdown: calculateCost(request)
    };
}

/**
 * Layer 1: Identity Verification
 * Verifies the user is who they claim to be
 */
interface IdentityResult {
    score: number;
    redFlags: string[];
    credentialsVerified: string[];
}

async function verifyIdentity(request: ClaimVerifyRequest): Promise<IdentityResult> {
    const redFlags: string[] = [];
    let score = 0;
    const credentialsVerified: string[] = [];

    // Check if user has "verified_human" credential
    if (request.userCredentials.includes('verified_human')) {
        score += 40; // Base score for verified human
        credentialsVerified.push('verified_human');
    } else {
        redFlags.push('User does not have verified_human credential');
        score += 10; // Minimal score without verification
    }

    // Check for government ID
    if (request.userCredentials.includes('government_id')) {
        score += 30;
        credentialsVerified.push('government_id');
    }

    // Check for age verification (if applicable)
    if (request.userCredentials.includes('age_18') || request.userCredentials.includes('age_21')) {
        score += 15;
        credentialsVerified.push('age_verified');
    }

    // Check for location credential
    if (request.userCredentials.includes('location')) {
        score += 15;
        credentialsVerified.push('location');
    }

    // Cap at 100
    score = Math.min(100, score);

    // Flag if no credentials provided
    if (request.userCredentials.length === 0) {
        redFlags.push('No credentials provided with claim');
        score = 20; // Very low score
    }

    return { score, redFlags, credentialsVerified };
}

/**
 * Layer 2: Claims Validation
 * Validates the claim content and timeline
 */
interface IntegrityResult {
    score: number;
    redFlags: string[];
    timelineConsistent: boolean;
    fraudPatternMatch: number;
    llmConfidence: number;
}

async function validateClaim(request: ClaimVerifyRequest): Promise<IntegrityResult> {
    const redFlags: string[] = [];
    let score = 50; // Start at neutral

    // Timeline Analysis
    const timelineAnalysis = analyzeTimeline(request.timeline);
    const timelineConsistent = timelineAnalysis.isConsistent;

    if (timelineConsistent) {
        score += 25;
    } else {
        score -= 20;
        redFlags.push(...timelineAnalysis.issues);
    }

    // Pattern Matching (simplified - in production would use ML model)
    const fraudPatternMatch = checkFraudPatterns(request);
    if (fraudPatternMatch > 0.7) {
        score -= 30;
        redFlags.push(`High fraud pattern match: ${(fraudPatternMatch * 100).toFixed(0)}%`);
    } else if (fraudPatternMatch > 0.4) {
        score -= 15;
        redFlags.push(`Moderate fraud pattern similarity detected`);
    } else {
        score += 15;
    }

    // LLM Confidence (placeholder - would call DeepSeek/Gemini in production)
    const llmConfidence = estimateLlmConfidence(request.description);
    if (llmConfidence > 0.8) {
        score += 10;
    } else if (llmConfidence < 0.5) {
        score -= 10;
        redFlags.push('Claim description raises concerns');
    }

    // Claim amount reasonability check
    if (request.claimAmount) {
        if (request.claimType === 'insurance_auto' && request.claimAmount > 1000000) {
            redFlags.push('Unusually high claim amount');
            score -= 10;
        }
        if (request.claimType === 'refund_request' && request.claimAmount > 50000) {
            redFlags.push('Refund amount above normal threshold');
            score -= 5;
        }
    }

    // Cap between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        redFlags,
        timelineConsistent,
        fraudPatternMatch,
        llmConfidence
    };
}

/**
 * Layer 3: Evidence Authentication
 * Validates the evidence provided with the claim
 */
interface AuthenticityResult {
    score: number;
    redFlags: string[];
    deepfakeDetected: boolean;
    metadataValid: boolean;
    blockchainVerified: boolean;
}

async function authenticateEvidence(request: ClaimVerifyRequest): Promise<AuthenticityResult> {
    const redFlags: string[] = [];
    let score = 50; // Start at neutral

    // If no evidence provided
    if (request.evidence.length === 0) {
        return {
            score: 60, // Some claims don't require evidence
            redFlags: ['No evidence provided'],
            deepfakeDetected: false,
            metadataValid: true,
            blockchainVerified: false
        };
    }

    // Deepfake Detection (simplified - would use ML model in production)
    const deepfakeDetected = false; // Placeholder - would call detection API
    if (deepfakeDetected) {
        score = 10;
        redFlags.push('AI-generated content detected in evidence');
    } else {
        score += 20;
    }

    // Metadata Validation (simplified)
    const metadataValid = validateEvidenceMetadata(request);
    if (metadataValid) {
        score += 20;
    } else {
        score -= 15;
        redFlags.push('Evidence metadata inconsistent with claim');
    }

    // Blockchain Verification (placeholder)
    const blockchainVerified = request.evidence.length > 0;
    if (blockchainVerified) {
        score += 10;
    }

    // Evidence quantity check
    if (request.evidence.length >= 3) {
        score += 10; // Good amount of evidence
    }

    // Cap between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        redFlags,
        deepfakeDetected,
        metadataValid,
        blockchainVerified
    };
}

/**
 * Analyze timeline for logical consistency
 */
function analyzeTimeline(timeline: TimelineEvent[]): { isConsistent: boolean; issues: string[] } {
    const issues: string[] = [];

    if (timeline.length === 0) {
        return { isConsistent: true, issues: [] }; // No timeline to validate
    }

    // Sort by time
    const sorted = [...timeline].sort((a, b) =>
        new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // Check for impossible time gaps
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        const timeDiffMs = new Date(curr.time).getTime() - new Date(prev.time).getTime();
        const timeDiffMinutes = timeDiffMs / (1000 * 60);

        // Check if locations are different but time is too short
        if (prev.location !== curr.location && timeDiffMinutes < 30) {
            // Different cities in less than 30 min is suspicious
            if (!isSameCity(prev.location, curr.location)) {
                issues.push(`Impossible travel: ${prev.location} to ${curr.location} in ${timeDiffMinutes} minutes`);
            }
        }

        // Check for negative time (events out of order)
        if (timeDiffMs < 0) {
            issues.push(`Events out of order: ${prev.event} after ${curr.event}`);
        }
    }

    return {
        isConsistent: issues.length === 0,
        issues
    };
}

/**
 * Check if two locations are in the same city
 */
function isSameCity(loc1: string, loc2: string): boolean {
    return loc1.toLowerCase().trim() === loc2.toLowerCase().trim();
}

/**
 * Check for known fraud patterns
 */
function checkFraudPatterns(request: ClaimVerifyRequest): number {
    let patternScore = 0;
    const description = request.description.toLowerCase();

    // Common fraud indicators
    const fraudIndicators = [
        'urgent', 'emergency', 'immediately', 'asap',
        'no receipt', 'lost documentation', 'can\'t provide',
        'third party', 'someone else', 'friend\'s',
    ];

    for (const indicator of fraudIndicators) {
        if (description.includes(indicator)) {
            patternScore += 0.15;
        }
    }

    // High amount with minimal evidence
    if (request.claimAmount && request.claimAmount > 100000 && request.evidence.length < 2) {
        patternScore += 0.2;
    }

    // Very short description for complex claim
    if (request.claimType === 'insurance_auto' && request.description.length < 50) {
        patternScore += 0.1;
    }

    return Math.min(1, patternScore);
}

/**
 * Estimate LLM confidence (placeholder)
 * In production, this would call DeepSeek or Gemini API
 */
function estimateLlmConfidence(description: string): number {
    // Simple heuristic-based estimation
    let confidence = 0.7; // Base confidence

    // Longer, detailed descriptions are generally more credible
    if (description.length > 200) confidence += 0.1;
    if (description.length > 500) confidence += 0.1;

    // Check for specific details (dates, times, names)
    const hasSpecificDetails = /\d{1,2}[:\-\/]\d{1,2}|\d{4}[-\/]\d{2}|\d{1,2}(?:am|pm)/i.test(description);
    if (hasSpecificDetails) confidence += 0.1;

    return Math.min(1, confidence);
}

/**
 * Validate evidence metadata consistency
 */
function validateEvidenceMetadata(request: ClaimVerifyRequest): boolean {
    // Check if evidence upload times are reasonable (within claim timeline)
    if (request.timeline.length === 0 || request.evidence.length === 0) {
        return true; // No timeline to validate against
    }

    const earliestEvent = new Date(
        Math.min(...request.timeline.map(t => new Date(t.time).getTime()))
    );

    for (const ev of request.evidence) {
        const evidenceTime = new Date(ev.uploadedAt);
        // Evidence should generally be uploaded after the event
        if (evidenceTime < earliestEvent) {
            // Evidence uploaded before the event occurred is suspicious
            return false;
        }
    }

    return true;
}

/**
 * Get recommendation based on Trust Score
 */
function getRecommendation(trustScore: number): ClaimVerifyResponse['recommendation'] {
    if (trustScore >= 90) return 'approve';
    if (trustScore >= 70) return 'review';
    if (trustScore >= 50) return 'investigate';
    return 'reject';
}

/**
 * Calculate processing cost breakdown
 */
function calculateCost(request: ClaimVerifyRequest): ClaimVerifyResponse['costBreakdown'] {
    const identityVerification = 0; // Free (already verified in wallet)
    const mlInference = 2.00; // Base ML cost
    const llmAnalysis = 0.02; // ~500 tokens at ₹0.04/1K
    const deepfakeCheck = request.evidence.length > 0 ? 0 : 0; // Custom model = free
    const blockchainTimestamp = request.evidence.length * 0.01; // ₹0.01 per item

    return {
        identityVerification,
        mlInference,
        llmAnalysis,
        deepfakeCheck,
        blockchainTimestamp,
        totalInr: identityVerification + mlInference + llmAnalysis + deepfakeCheck + blockchainTimestamp
    };
}

/**
 * Get claim by ID (for status checking)
 */
export async function getClaimById(claimId: string): Promise<ClaimVerifyResponse | null> {
    // In production, would fetch from database
    // For now, return null to indicate not found
    return null;
}
