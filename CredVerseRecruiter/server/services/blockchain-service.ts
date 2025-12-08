import { ethers } from 'ethers';
import crypto from 'crypto';

// CredentialRegistry ABI (simplified)
const REGISTRY_ABI = [
    "function anchorCredential(bytes32 _credentialHash) external",
    "function revokeCredential(bytes32 _credentialHash, string calldata _reason) external",
    "function verifyCredential(bytes32 _credentialHash) external view returns (bool isValid, address issuer, uint256 anchoredAt)",
    "function isRevoked(bytes32 _credentialHash) external view returns (bool)",
    "function getCredential(bytes32 _credentialHash) external view returns (address issuer, uint256 anchoredAt, bool revoked, string memory revocationReason, uint256 revokedAt)",
    "function getStats() external view returns (uint256 anchored, uint256 revoked)",
    "event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer, uint256 timestamp)",
    "event CredentialRevoked(bytes32 indexed credentialHash, address indexed revoker, string reason, uint256 timestamp)"
];

const DEFAULT_RPC = 'https://eth-sepolia.g.alchemy.com/v2/demo';
const DEFAULT_CONTRACT = process.env.REGISTRY_CONTRACT_ADDRESS || '';

export interface VerifyResult {
    exists: boolean;
    isValid: boolean;
    issuer?: string;
    anchoredAt?: number;
    isRevoked?: boolean;
    revocationReason?: string;
}

/**
 * Blockchain Service for credential verification
 */
export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;
    private isConfigured: boolean = false;

    constructor() {
        const rpcUrl = 'http://127.0.0.1:8545';
        const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        if (contractAddress && contractAddress.startsWith('0x')) {
            this.contract = new ethers.Contract(contractAddress, REGISTRY_ABI, this.provider);
            this.isConfigured = true;
            console.log(`[Blockchain] Configured with ${contractAddress} on ${rpcUrl}`);
        } else {
            this.contract = new ethers.Contract(ethers.ZeroAddress, REGISTRY_ABI, this.provider);
        }
    }

    /**
     * Hash credential data
     */
    hashCredential(data: any): string {
        const canonical = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
        return ethers.keccak256(ethers.toUtf8Bytes(canonical));
    }

    /**
     * Verify a credential on-chain
     */
    async verifyCredential(credentialHash: string): Promise<VerifyResult> {
        if (!this.isConfigured) {
            // Simulate for development
            return {
                exists: true,
                isValid: true,
                issuer: '0x' + crypto.randomBytes(20).toString('hex'),
                anchoredAt: Math.floor(Date.now() / 1000) - 86400,
                isRevoked: false,
            };
        }

        try {
            const [isValid, issuer, anchoredAt] = await this.contract.verifyCredential(credentialHash);

            if (anchoredAt === 0n) {
                return { exists: false, isValid: false };
            }

            const isRevoked = await this.contract.isRevoked(credentialHash);

            return {
                exists: true,
                isValid: !isRevoked,
                issuer,
                anchoredAt: Number(anchoredAt),
                isRevoked,
            };
        } catch (error: any) {
            console.error('[Blockchain] Verify error:', error.message);
            return { exists: false, isValid: false };
        }
    }

    /**
     * Check revocation status
     */
    async isRevoked(credentialHash: string): Promise<boolean> {
        if (!this.isConfigured) {
            return false; // Simulate not revoked in dev
        }

        try {
            return await this.contract.isRevoked(credentialHash);
        } catch {
            return false;
        }
    }

    /**
     * Get registry statistics
     */
    async getStats(): Promise<{ anchored: number; revoked: number }> {
        if (!this.isConfigured) {
            return { anchored: 0, revoked: 0 };
        }

        try {
            const [anchored, revoked] = await this.contract.getStats();
            return {
                anchored: Number(anchored),
                revoked: Number(revoked),
            };
        } catch {
            return { anchored: 0, revoked: 0 };
        }
    }

    isBlockchainConfigured(): boolean {
        return this.isConfigured;
    }
}

export const blockchainService = new BlockchainService();
