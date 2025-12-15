import { sign, verify, generateEd25519KeyPair, sha256, encrypt, decrypt, type KeyPair, type EncryptedData } from './crypto-utils';

/**
 * VC Signer Service for CredVerse Issuer
 * Handles cryptographic signing of Verifiable Credentials using Ed25519
 */

interface IssuerKeyStore {
    publicKey: string;
    encryptedPrivateKey: EncryptedData;
    createdAt: Date;
}

// In-memory key store (in production, use secure vault like HashiCorp Vault)
const issuerKeys = new Map<string, IssuerKeyStore>();

// Encryption key for private key storage
const ISSUER_KEY_ENCRYPTION = process.env.ISSUER_KEY_ENCRYPTION || '0'.repeat(64);

/**
 * Get or create issuer keypair
 */
export function getOrCreateIssuerKey(issuerId: string): { publicKey: string; privateKey: string } {
    let keyStore = issuerKeys.get(issuerId);

    if (!keyStore) {
        // Generate new keypair for issuer
        const keyPair = generateEd25519KeyPair();
        const encryptedPrivateKey = encrypt(keyPair.privateKey, ISSUER_KEY_ENCRYPTION);

        keyStore = {
            publicKey: keyPair.publicKey,
            encryptedPrivateKey,
            createdAt: new Date(),
        };

        issuerKeys.set(issuerId, keyStore);
        console.log(`[VCSigner] Generated new keypair for issuer ${issuerId}`);
    }

    // Decrypt private key for signing
    const privateKey = decrypt(keyStore.encryptedPrivateKey, ISSUER_KEY_ENCRYPTION);

    return {
        publicKey: keyStore.publicKey,
        privateKey,
    };
}

/**
 * Sign a VC-JWT with Ed25519
 * Creates a proper JWT with cryptographic signature
 */
export async function signVcJwt(payload: any, issuerDid: string): Promise<string> {
    // Get issuer's keypair
    const { privateKey } = getOrCreateIssuerKey(issuerDid);

    // JWT Header - EdDSA for Ed25519
    const header = {
        alg: 'EdDSA',
        typ: 'JWT',
        kid: `${issuerDid}#keys-1`,
    };

    // Encode header and payload
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    // Sign the JWT
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = sign(signingInput, privateKey);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify a VC-JWT signature
 */
export async function verifyVcJwt(jwt: string, publicKey: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
    try {
        const parts = jwt.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Invalid JWT format' };
        }

        const [encodedHeader, encodedPayload, signature] = parts;
        const signingInput = `${encodedHeader}.${encodedPayload}`;

        // Verify signature
        const isValid = verify(signingInput, signature, publicKey);

        if (!isValid) {
            return { valid: false, error: 'Invalid signature' };
        }

        // Decode payload
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

        // Check expiration
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return { valid: false, error: 'Token expired' };
        }

        return { valid: true, payload };
    } catch (error) {
        return { valid: false, error: 'Failed to verify JWT' };
    }
}

/**
 * Get issuer's public key (for verification)
 */
export function getIssuerPublicKey(issuerId: string): string | null {
    const keyStore = issuerKeys.get(issuerId);
    return keyStore?.publicKey || null;
}

/**
 * Hash credential data for blockchain anchoring
 */
export function hashCredential(credentialData: any): string {
    const canonical = JSON.stringify(credentialData, Object.keys(credentialData).sort());
    return sha256(canonical);
}
