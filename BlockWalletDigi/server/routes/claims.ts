/**
 * Claims API Routes
 * Implements PRD v3.1 Feature 2: Claims Verification System
 * 
 * Endpoints:
 * - POST /api/v1/claims/verify - Submit claim for verification
 * - GET /api/v1/claims/:id - Get claim status
 * - POST /api/v1/evidence/upload - Upload evidence file
 * - GET /api/v1/evidence/:id/analysis - Get evidence analysis
 */

import { Router, Request, Response } from 'express';
import { verifyClaim, ClaimVerifyRequest, getClaimById } from '../services/claims-service';
import { analyzeEvidence, EvidenceUploadRequest } from '../services/evidence-analysis';

const router = Router();

// In-memory store for claims (would be database in production)
const claimsStore = new Map<string, any>();
const evidenceStore = new Map<string, any>();

/**
 * POST /api/v1/claims/verify
 * Submit a claim for verification
 * 
 * Per PRD v3.1: Process claim through 3-layer verification and return Trust Score
 */
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const request: ClaimVerifyRequest = {
            userId: req.body.user_id || req.body.userId,
            claimType: req.body.claim_type || req.body.claimType || 'identity_check',
            claimAmount: req.body.claim_amount || req.body.claimAmount,
            description: req.body.description || '',
            timeline: req.body.timeline || [],
            evidence: req.body.evidence || [],
            userCredentials: req.body.user_credentials || req.body.userCredentials || []
        };

        // Validate required fields
        if (!request.userId) {
            return res.status(400).json({
                success: false,
                error: 'user_id is required'
            });
        }

        // Process the claim through 3-layer verification
        const result = await verifyClaim(request);

        // Store the claim result
        claimsStore.set(result.claimId, {
            ...result,
            request,
            createdAt: new Date().toISOString()
        });

        // Return PRD v3.1 format response
        res.json({
            success: true,
            claim_id: result.claimId,
            trust_score: result.trustScore,
            recommendation: result.recommendation,
            breakdown: {
                identity_score: result.breakdown.identityScore,
                integrity_score: result.breakdown.integrityScore,
                authenticity_score: result.breakdown.authenticityScore
            },
            red_flags: result.redFlags,
            ai_analysis: {
                deepfake_detected: result.aiAnalysis.deepfakeDetected,
                timeline_consistent: result.aiAnalysis.timelineConsistent,
                fraud_pattern_match: result.aiAnalysis.fraudPatternMatch,
                llm_confidence: result.aiAnalysis.llmConfidence
            },
            processing_time_seconds: result.processingTimeMs / 1000,
            cost_breakdown: {
                identity_verification: result.costBreakdown.identityVerification,
                ml_inference: result.costBreakdown.mlInference,
                llm_analysis: result.costBreakdown.llmAnalysis,
                deepfake_check: result.costBreakdown.deepfakeCheck,
                blockchain_timestamp: result.costBreakdown.blockchainTimestamp,
                total_inr: result.costBreakdown.totalInr
            }
        });
    } catch (error: any) {
        console.error('Claims verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify claim',
            message: error.message
        });
    }
});

/**
 * GET /api/v1/claims/:id
 * Get claim verification status
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const claim = claimsStore.get(id);

        if (!claim) {
            return res.status(404).json({
                success: false,
                error: 'Claim not found'
            });
        }

        res.json({
            success: true,
            claim: {
                id: claim.claimId,
                trust_score: claim.trustScore,
                recommendation: claim.recommendation,
                breakdown: claim.breakdown,
                red_flags: claim.redFlags,
                created_at: claim.createdAt,
                status: 'processed'
            }
        });
    } catch (error: any) {
        console.error('Get claim error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get claim'
        });
    }
});

/**
 * GET /api/v1/claims
 * List all claims for a platform (paginated)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const platformId = req.query.platform_id as string;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        // Get all claims (filter by platform if specified)
        let claims = Array.from(claimsStore.values());

        if (platformId) {
            claims = claims.filter(c => c.request?.platformId === platformId);
        }

        // Sort by creation date (newest first)
        claims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Paginate
        const paginated = claims.slice(offset, offset + limit);

        // Calculate stats
        const stats = {
            total: claims.length,
            approved: claims.filter(c => c.recommendation === 'approve').length,
            review: claims.filter(c => c.recommendation === 'review').length,
            investigate: claims.filter(c => c.recommendation === 'investigate').length,
            rejected: claims.filter(c => c.recommendation === 'reject').length,
            avgTrustScore: claims.length > 0
                ? Math.round(claims.reduce((sum, c) => sum + c.trustScore, 0) / claims.length)
                : 0
        };

        res.json({
            success: true,
            claims: paginated.map(c => ({
                id: c.claimId,
                trust_score: c.trustScore,
                recommendation: c.recommendation,
                claim_type: c.request?.claimType,
                created_at: c.createdAt
            })),
            stats,
            pagination: {
                total: claims.length,
                limit,
                offset,
                hasMore: offset + limit < claims.length
            }
        });
    } catch (error: any) {
        console.error('List claims error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list claims'
        });
    }
});

/**
 * POST /api/v1/evidence/upload
 * Upload evidence for a claim
 */
router.post('/evidence/upload', async (req: Request, res: Response) => {
    try {
        const { user_id, claim_id, media_type, url, metadata } = req.body;

        if (!user_id || !url) {
            return res.status(400).json({
                success: false,
                error: 'user_id and url are required'
            });
        }

        const evidenceId = `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Analyze evidence
        const analysisRequest: EvidenceUploadRequest = {
            userId: user_id,
            claimId: claim_id,
            mediaType: media_type || 'image',
            url,
            metadata: metadata || {}
        };

        const analysis = await analyzeEvidence(analysisRequest);

        // Store evidence
        evidenceStore.set(evidenceId, {
            id: evidenceId,
            ...analysisRequest,
            analysis,
            uploadedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            evidence_id: evidenceId,
            authenticity_score: analysis.authenticityScore,
            is_ai_generated: analysis.isAiGenerated,
            manipulation_detected: analysis.manipulationDetected,
            blockchain_hash: analysis.blockchainHash,
            metadata_extracted: analysis.metadataExtracted
        });
    } catch (error: any) {
        console.error('Evidence upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload evidence'
        });
    }
});

/**
 * GET /api/v1/evidence/:id/analysis
 * Get evidence analysis details
 */
router.get('/evidence/:id/analysis', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const evidence = evidenceStore.get(id);

        if (!evidence) {
            return res.status(404).json({
                success: false,
                error: 'Evidence not found'
            });
        }

        res.json({
            success: true,
            evidence: {
                id: evidence.id,
                media_type: evidence.mediaType,
                url: evidence.url,
                uploaded_at: evidence.uploadedAt
            },
            analysis: evidence.analysis
        });
    } catch (error: any) {
        console.error('Get evidence analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get evidence analysis'
        });
    }
});

export default router;
