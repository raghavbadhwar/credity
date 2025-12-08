import { createHash } from 'crypto';
/**
 * Fraud Detection Service for CredVerse Recruiter Portal
 * Implements pattern-based fraud scoring and anomaly detection
 */

export interface FraudAnalysis {
    score: number; // 0-100 (higher = more suspicious)
    flags: FraudFlag[];
    recommendation: 'approve' | 'review' | 'reject';
    details: FraudDetail[];
}

export interface FraudFlag {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

export interface FraudDetail {
    check: string;
    result: string;
    impact: number;
}

// In-memory database for fraud patterns
const verifiedCredentials = new Map<string, CredentialFingerprint>();
const flaggedPatterns: FraudPattern[] = [];

interface CredentialFingerprint {
    hash: string;
    issuer: string;
    subject: string;
    type: string;
    issuanceDate: Date;
    firstSeen: Date;
    verificationCount: number;
}

interface FraudPattern {
    id: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    matcher: (credential: any) => boolean;
}

/**
 * Fraud Detection Service
 */
export class FraudDetector {
    constructor() {
        this.initializePatterns();
    }

    /**
     * Initialize known fraud patterns
     */
    private initializePatterns() {
        // Pattern 1: Future issuance date
        flaggedPatterns.push({
            id: 'FUTURE_DATE',
            type: 'temporal_anomaly',
            description: 'Credential has a future issuance date',
            severity: 'high',
            matcher: (cred) => {
                const date = new Date(cred.issuanceDate || cred.iat);
                return date > new Date();
            },
        });

        // Pattern 2: Suspicious graduation year
        flaggedPatterns.push({
            id: 'YOUNG_GRADUATE',
            type: 'logical_anomaly',
            description: 'Subject appears too young for claimed degree',
            severity: 'medium',
            matcher: (cred) => {
                const subject = cred.credentialSubject || cred.sub || {};
                const birthYear = subject.birthYear || subject.dateOfBirth?.slice(0, 4);
                const gradYear = subject.graduationYear || cred.issuanceDate?.slice(0, 4);

                if (birthYear && gradYear) {
                    const ageAtGrad = parseInt(gradYear) - parseInt(birthYear);
                    return ageAtGrad < 18 || ageAtGrad > 60;
                }
                return false;
            },
        });

        // Pattern 3: Known fake issuer patterns
        flaggedPatterns.push({
            id: 'FAKE_ISSUER',
            type: 'issuer_anomaly',
            description: 'Issuer matches known fake credential patterns',
            severity: 'critical',
            matcher: (cred) => {
                const issuer = (cred.issuer || '').toLowerCase();
                const fakePatterns = ['fake', 'test', 'demo', 'sample', 'example'];
                return fakePatterns.some(p => issuer.includes(p));
            },
        });

        // Pattern 4: Unusual character encoding
        flaggedPatterns.push({
            id: 'ENCODING_TRICKS',
            type: 'data_manipulation',
            description: 'Name contains unusual character encoding',
            severity: 'medium',
            matcher: (cred) => {
                const subject = cred.credentialSubject || {};
                const name = subject.name || subject.givenName || '';
                // Check for homoglyph attacks
                const hasUnusualChars = /[^\x00-\x7F]/.test(name) && name.length < 10;
                return hasUnusualChars;
            },
        });
    }

    /**
     * Analyze credential for fraud
     */
    async analyzeCredential(credential: any): Promise<FraudAnalysis> {
        const flags: FraudFlag[] = [];
        const details: FraudDetail[] = [];
        let totalScore = 0;

        // Check 1: Run pattern matching
        for (const pattern of flaggedPatterns) {
            try {
                if (pattern.matcher(credential)) {
                    flags.push({
                        type: pattern.type,
                        severity: pattern.severity,
                        description: pattern.description,
                    });

                    const impact = this.getSeverityImpact(pattern.severity);
                    totalScore += impact;

                    details.push({
                        check: pattern.id,
                        result: 'FLAGGED',
                        impact,
                    });
                } else {
                    details.push({
                        check: pattern.id,
                        result: 'PASSED',
                        impact: 0,
                    });
                }
            } catch (e) {
                // Pattern failed to execute, skip
            }
        }

        // Check 2: Duplicate detection
        const duplicateCheck = await this.checkDuplicate(credential);
        if (duplicateCheck.isDuplicate) {
            flags.push({
                type: 'duplicate',
                severity: 'high',
                description: 'Credential matches previously verified credential for different subject',
            });
            totalScore += 30;
            details.push({
                check: 'DUPLICATE_CHECK',
                result: 'FLAGGED',
                impact: 30,
            });
        } else {
            details.push({
                check: 'DUPLICATE_CHECK',
                result: 'PASSED',
                impact: 0,
            });
        }

        // Check 3: Name consistency
        const nameCheck = this.checkNameConsistency(credential);
        if (!nameCheck.consistent) {
            flags.push({
                type: 'data_mismatch',
                severity: 'medium',
                description: nameCheck.reason,
            });
            totalScore += 15;
            details.push({
                check: 'NAME_CONSISTENCY',
                result: 'FLAGGED',
                impact: 15,
            });
        } else {
            details.push({
                check: 'NAME_CONSISTENCY',
                result: 'PASSED',
                impact: 0,
            });
        }

        // Check 4: Velocity check (too many creds from same issuer recently)
        const velocityCheck = await this.checkVelocity(credential);
        if (velocityCheck.suspicious) {
            flags.push({
                type: 'velocity_anomaly',
                severity: 'low',
                description: velocityCheck.reason,
            });
            totalScore += 10;
            details.push({
                check: 'VELOCITY_CHECK',
                result: 'FLAGGED',
                impact: 10,
            });
        } else {
            details.push({
                check: 'VELOCITY_CHECK',
                result: 'PASSED',
                impact: 0,
            });
        }

        // Cap score at 100
        totalScore = Math.min(100, totalScore);

        // Determine recommendation
        let recommendation: 'approve' | 'review' | 'reject';
        if (totalScore >= 60) recommendation = 'reject';
        else if (totalScore >= 30) recommendation = 'review';
        else recommendation = 'approve';

        return {
            score: totalScore,
            flags,
            recommendation,
            details,
        };
    }

    /**
     * Get severity impact score
     */
    private getSeverityImpact(severity: 'low' | 'medium' | 'high' | 'critical'): number {
        const impacts = {
            low: 5,
            medium: 15,
            high: 30,
            critical: 50,
        };
        return impacts[severity];
    }

    /**
     * Check for duplicate credentials
     */
    private async checkDuplicate(credential: any): Promise<{ isDuplicate: boolean; existing?: CredentialFingerprint }> {
        const hash = this.hashCredential(credential);
        const existing = verifiedCredentials.get(hash);

        if (existing) {
            // Same credential seen before - check if same subject
            const currentSubject = credential.credentialSubject?.id || credential.sub;
            if (currentSubject && currentSubject !== existing.subject) {
                return { isDuplicate: true, existing };
            }

            // Update verification count
            existing.verificationCount++;
        } else {
            // Store fingerprint
            verifiedCredentials.set(hash, {
                hash,
                issuer: credential.issuer || 'unknown',
                subject: credential.credentialSubject?.id || credential.sub || 'unknown',
                type: (credential.type || ['unknown'])[0],
                issuanceDate: new Date(credential.issuanceDate || credential.iat || Date.now()),
                firstSeen: new Date(),
                verificationCount: 1,
            });
        }

        return { isDuplicate: false };
    }

    /**
     * Check name consistency across fields
     */
    private checkNameConsistency(credential: any): { consistent: boolean; reason: string } {
        const subject = credential.credentialSubject || {};

        // Check if name parts match full name
        if (subject.name && subject.givenName && subject.familyName) {
            const fullName = subject.name.toLowerCase();
            const givenName = subject.givenName.toLowerCase();
            const familyName = subject.familyName.toLowerCase();

            if (!fullName.includes(givenName) && !fullName.includes(familyName)) {
                return {
                    consistent: false,
                    reason: 'Full name does not contain given name or family name',
                };
            }
        }

        return { consistent: true, reason: '' };
    }

    /**
     * Check velocity (unusual patterns)
     */
    private async checkVelocity(credential: any): Promise<{ suspicious: boolean; reason: string }> {
        // In production, this would check against historical data
        // For MVP, we simulate
        const suspicious = Math.random() < 0.05; // 5% suspicious rate

        return {
            suspicious,
            reason: suspicious ? 'Unusual verification pattern detected' : '',
        };
    }

    /**
     * Hash credential for fingerprinting
     */
    private hashCredential(credential: any): string {
        // Use only stable fields for fingerprinting
        const fingerprint = {
            issuer: credential.issuer,
            type: credential.type,
            subject: credential.credentialSubject,
            issuanceDate: credential.issuanceDate,
        };
        const canonical = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
        return createHash('sha256').update(canonical).digest('hex');
    }

    /**
     * Get fraud statistics
     */
    getStatistics(): {
        totalVerified: number;
        uniqueCredentials: number;
        flaggedCount: number;
    } {
        const credentials = Array.from(verifiedCredentials.values());
        return {
            totalVerified: credentials.reduce((sum, c) => sum + c.verificationCount, 0),
            uniqueCredentials: credentials.length,
            flaggedCount: credentials.filter(c => c.verificationCount > 3).length,
        };
    }
}

export const fraudDetector = new FraudDetector();
