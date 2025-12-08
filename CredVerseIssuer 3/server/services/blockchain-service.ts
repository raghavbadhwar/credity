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

// Default to Sepolia testnet
const DEFAULT_RPC = 'https://eth-sepolia.g.alchemy.com/v2/demo';
const DEFAULT_CONTRACT = process.env.REGISTRY_CONTRACT_ADDRESS || '';

export interface BlockchainConfig {
    rpcUrl: string;
    contractAddress: string;
    privateKey?: string;
}

export interface AnchorResult {
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    hash: string;
    error?: string;
}

export interface VerifyResult {
    exists: boolean;
    isValid: boolean;
    issuer?: string;
    anchoredAt?: number;
    isRevoked?: boolean;
    revocationReason?: string;
}

/**
 * Blockchain Service for credential anchoring and verification
 */
export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;
    private signer?: ethers.Wallet;
    private isConfigured: boolean = false;

    constructor(config?: Partial<BlockchainConfig>) {
        // Use Local Hardhat Node
        const rpcUrl = config?.rpcUrl || 'http://127.0.0.1:8545';
        const contractAddress = config?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
        // Account #0 from Hardhat node
        const privateKey = config?.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        if (contractAddress && contractAddress.startsWith('0x')) {
            if (privateKey) {
                this.signer = new ethers.Wallet(privateKey, this.provider);
                this.contract = new ethers.Contract(contractAddress, REGISTRY_ABI, this.signer);
            } else {
                this.contract = new ethers.Contract(contractAddress, REGISTRY_ABI, this.provider);
            }
            this.isConfigured = true;
            console.log(`[Blockchain] Configured with ${contractAddress} on ${rpcUrl}`);
        } else {
            // Create a dummy contract for development
            this.contract = new ethers.Contract(ethers.ZeroAddress, REGISTRY_ABI, this.provider);
        }
    }

    /**
     * Hash credential data for on-chain storage
     */
    hashCredential(data: any): string {
        const canonical = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
        return ethers.keccak256(ethers.toUtf8Bytes(canonical));
    }

    /**
     * Anchor a credential hash on-chain
     */
    async anchorCredential(credentialData: any): Promise<AnchorResult> {
        const hash = this.hashCredential(credentialData);

        if (!this.isConfigured || !this.signer) {
            // Simulate for development
            console.log(`[Blockchain] Simulated anchor: ${hash}`);
            return {
                success: true,
                txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
                blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
                hash,
            };
        }

        try {
            const tx = await this.contract.anchorCredential(hash);
            const receipt = await tx.wait();

            console.log(`[Blockchain] Anchored credential: ${hash} in tx ${receipt.hash}`);

            return {
                success: true,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                hash,
            };
        } catch (error: any) {
            console.error('[Blockchain] Anchor error:', error.message);
            return {
                success: false,
                hash,
                error: error.message,
            };
        }
    }

    /**
     * Revoke a credential on-chain
     */
    async revokeCredential(credentialHash: string, reason: string): Promise<AnchorResult> {
        if (!this.isConfigured || !this.signer) {
            console.log(`[Blockchain] Simulated revocation: ${credentialHash}`);
            return {
                success: true,
                txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
                hash: credentialHash,
            };
        }

        try {
            const tx = await this.contract.revokeCredential(credentialHash, reason);
            const receipt = await tx.wait();

            console.log(`[Blockchain] Revoked credential: ${credentialHash}`);

            return {
                success: true,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                hash: credentialHash,
            };
        } catch (error: any) {
            console.error('[Blockchain] Revoke error:', error.message);
            return {
                success: false,
                hash: credentialHash,
                error: error.message,
            };
        }
    }

    /**
     * Verify a credential on-chain
     */
    async verifyCredential(credentialHash: string): Promise<VerifyResult> {
        if (!this.isConfigured) {
            // Simulate for development - assume valid
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

            if (anchoredAt === BigInt(0)) {
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
     * Get full credential details from chain
     */
    async getCredentialDetails(credentialHash: string): Promise<any> {
        if (!this.isConfigured) {
            return {
                exists: true,
                issuer: '0x' + crypto.randomBytes(20).toString('hex'),
                anchoredAt: new Date(Date.now() - 86400000),
                isRevoked: false,
                revocationReason: '',
            };
        }

        try {
            const [issuer, anchoredAt, revoked, revocationReason, revokedAt] =
                await this.contract.getCredential(credentialHash);

            if (anchoredAt === BigInt(0)) {
                return { exists: false };
            }

            return {
                exists: true,
                issuer,
                anchoredAt: new Date(Number(anchoredAt) * 1000),
                isRevoked: revoked,
                revocationReason,
                revokedAt: revokedAt > BigInt(0) ? new Date(Number(revokedAt) * 1000) : null,
            };
        } catch (error) {
            return { exists: false };
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
        } catch (error) {
            return { anchored: 0, revoked: 0 };
        }
    }

    /**
     * Check if blockchain is properly configured
     */
    isBlockchainConfigured(): boolean {
        return this.isConfigured;
    }

    /**
     * Get current network info
     */
    async getNetworkInfo(): Promise<{ chainId: number; name: string }> {
        try {
            const network = await this.provider.getNetwork();
            return {
                chainId: Number(network.chainId),
                name: network.name,
            };
        } catch {
            return { chainId: 0, name: 'unknown' };
        }
    }
}

// Singleton instance
export const blockchainService = new BlockchainService();
