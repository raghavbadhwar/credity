export type CredentialFormat = 'sd-jwt-vc' | 'vc+jwt' | 'vc+ldp';

export interface CredentialRecordContract {
    id: string;
    format: CredentialFormat;
    issuer_did: string;
    subject_did: string;
    status_list_id: string | null;
    status_list_index: number | null;
    anchor_batch_id: string | null;
    anchor_proof: Record<string, unknown> | null;
    holder_binding: Record<string, unknown> | null;
    issuance_flow: 'oid4vci' | 'legacy';
}

export interface VerificationResultContract {
    id: string;
    credential_validity: 'valid' | 'invalid' | 'unknown';
    status_validity: 'active' | 'revoked' | 'unknown';
    anchor_validity: 'anchored' | 'pending' | 'missing' | 'unknown';
    anchor_state?: 'queued' | 'submitted' | 'confirmed' | 'failed' | 'pending';
    fraud_score: number;
    fraud_explanations: string[];
    decision: 'approve' | 'review' | 'investigate' | 'reject';
    decision_reason_codes: string[];
    checked_at?: string;
}

export interface TrustScoreSnapshotContract {
    id: string;
    user_id: string;
    score: number;
    signals_version: string;
    features_hash: string;
    model_version: string;
    explanation_json: Record<string, unknown>;
    decay_applied_at: string | null;
    created_at: string;
}

export interface ConsentGrantContract {
    id: string;
    subject_id: string;
    verifier_id: string;
    purpose: string;
    data_elements: string[];
    expiry: string;
    revocation_ts: string | null;
    consent_proof: Record<string, unknown>;
}

export type ReputationCategoryContract =
    | 'transport'
    | 'accommodation'
    | 'delivery'
    | 'employment'
    | 'finance'
    | 'social'
    | 'identity';

export interface ReputationEventContract {
    id: string;
    event_id: string;
    user_id: number;
    platform_id: string;
    category: ReputationCategoryContract;
    signal_type: string;
    score: number; // 0-100
    occurred_at: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface ReputationCategoryBreakdownContract {
    category: ReputationCategoryContract;
    weight: number;
    score: number;
    weighted_score: number;
    event_count: number;
}

export interface ReputationScoreContract {
    user_id: number;
    score: number; // 0-1000
    event_count: number;
    category_breakdown: ReputationCategoryBreakdownContract[];
    computed_at: string;
    subject_did?: string;
    vertical?: string;
}

export interface SafeDateScoreContract {
    user_id: number;
    score: number; // 0-100
    breakdown: {
        identity_verified_points: number;
        liveness_points: number;
        background_clean_points: number;
        cross_platform_reputation_points: number;
        social_validation_points: number;
        harassment_free_points: number;
    };
    computed_at: string;
    reason_codes: string[];
}

export interface ReputationProfileContract {
    subject_did: string;
    scores: ReputationScoreContract[];
    signals?: Record<string, unknown>;
    signals_version?: string;
    computed_at?: string;
}

export interface PlatformAuthorityContract {
    id: string;
    platform_id: string;
    tenant_id: string | null;
    name: string;
    domain: string | null;
    status: 'pending' | 'active' | 'suspended';
    allowed_verticals: string[];
    allowed_categories: ReputationCategoryContract[];
    created_at: string;
}
