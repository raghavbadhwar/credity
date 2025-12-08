import crypto from 'crypto';

/**
 * Wallet Service - Complete credential wallet management
 * Handles credential storage, encryption, sharing, and synchronization
 */

export interface WalletState {
    userId: number;
    did: string;
    credentials: StoredCredential[];
    shares: ShareRecord[];
    consentLogs: ConsentLog[];
    notifications: WalletNotification[];
    backupKey?: string;
    lastSync: Date;
}

export interface StoredCredential {
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: Date;
    expirationDate?: Date;
    data: any;
    jwt?: string;
    encryptedData: string;
    hash: string;
    anchorStatus: 'pending' | 'anchored' | 'revoked';
    anchorTxHash?: string;
    blockNumber?: number;
    category: 'academic' | 'employment' | 'government' | 'medical' | 'kyc' | 'skill' | 'other';
    mediaFiles?: MediaFile[];
    lastVerified?: Date;
    verificationCount: number;
}

export interface MediaFile {
    id: string;
    name: string;
    type: string;
    ipfsHash?: string;
    encryptedUrl: string;
    size: number;
}

export interface ShareRecord {
    id: string;
    credentialId: string;
    shareType: 'qr' | 'link' | 'email' | 'whatsapp' | 'ats' | 'recruiter';
    recipientInfo?: string;
    disclosedFields: string[];
    token: string;
    expiry: Date;
    createdAt: Date;
    accessLog: AccessLog[];
    revoked: boolean;
}

export interface AccessLog {
    timestamp: Date;
    ip: string;
    userAgent: string;
    location?: string;
    organization?: string;
    verified: boolean;
}

export interface ConsentLog {
    id: string;
    credentialId: string;
    action: 'share' | 'verify' | 'revoke';
    disclosedFields: string[];
    recipientDid?: string;
    recipientName?: string;
    purpose: string;
    timestamp: Date;
    ipAddress?: string;
}

export interface WalletNotification {
    id: string;
    type: 'verification' | 'share_access' | 'credential_received' | 'credential_revoked' | 'sync' | 'security';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    data?: any;
}

// In-memory wallet storage (production would use encrypted database)
const wallets = new Map<number, WalletState>();

/**
 * Complete Wallet Service
 */
export class WalletService {
    private encryptionKey: string;

    constructor() {
        this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    }

    /**
     * Initialize or get wallet for user
     */
    async getOrCreateWallet(userId: number, did?: string): Promise<WalletState> {
        let wallet = wallets.get(userId);

        if (!wallet) {
            wallet = {
                userId,
                did: did || '',
                credentials: [],
                shares: [],
                consentLogs: [],
                notifications: [],
                lastSync: new Date(),
            };
            wallets.set(userId, wallet);
        }

        return wallet;
    }

    /**
     * Store a new credential with encryption
     */
    async storeCredential(
        userId: number,
        credential: {
            type: string[];
            issuer: string;
            issuanceDate: Date;
            expirationDate?: Date;
            data: any;
            jwt?: string;
            category?: string;
        }
    ): Promise<StoredCredential> {
        const wallet = await this.getOrCreateWallet(userId);

        // Encrypt sensitive data
        const encryptedData = this.encrypt(JSON.stringify(credential.data));
        const hash = this.hashCredential(credential.data);

        const storedCredential: StoredCredential = {
            id: `cred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: credential.type,
            issuer: credential.issuer,
            issuanceDate: credential.issuanceDate,
            expirationDate: credential.expirationDate,
            data: credential.data, // Keep decrypted for display
            jwt: credential.jwt,
            encryptedData,
            hash,
            anchorStatus: 'pending',
            category: (credential.category as any) || 'other',
            verificationCount: 0,
        };

        wallet.credentials.push(storedCredential);

        // Add notification
        this.addNotification(userId, {
            type: 'credential_received',
            title: 'New Credential Received',
            message: `${credential.issuer} issued you a new ${credential.type[0] || 'credential'}`,
            data: { credentialId: storedCredential.id },
        });

        // Simulate blockchain anchoring
        setTimeout(() => this.simulateAnchor(userId, storedCredential.id), 2000);

        return storedCredential;
    }

    /**
     * Create a share link for a credential
     */
    async createShare(
        userId: number,
        credentialId: string,
        options: {
            shareType: 'qr' | 'link' | 'email' | 'whatsapp' | 'ats' | 'recruiter';
            disclosedFields: string[];
            expiryMinutes: number;
            recipientInfo?: string;
            purpose?: string;
        }
    ): Promise<ShareRecord> {
        const wallet = await this.getOrCreateWallet(userId);
        const credential = wallet.credentials.find(c => c.id === credentialId);

        if (!credential) {
            throw new Error('Credential not found');
        }

        const token = this.generateShareToken();
        const expiry = new Date(Date.now() + options.expiryMinutes * 60 * 1000);

        const share: ShareRecord = {
            id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            credentialId,
            shareType: options.shareType,
            recipientInfo: options.recipientInfo,
            disclosedFields: options.disclosedFields,
            token,
            expiry,
            createdAt: new Date(),
            accessLog: [],
            revoked: false,
        };

        wallet.shares.push(share);

        // Log consent
        wallet.consentLogs.push({
            id: `consent-${Date.now()}`,
            credentialId,
            action: 'share',
            disclosedFields: options.disclosedFields,
            recipientName: options.recipientInfo,
            purpose: options.purpose || 'general',
            timestamp: new Date(),
        });

        return share;
    }

    /**
     * Verify access to a shared credential
     */
    async accessShare(
        shareId: string,
        accessInfo: { ip: string; userAgent: string; location?: string; organization?: string }
    ): Promise<{ valid: boolean; credential?: Partial<StoredCredential>; error?: string }> {
        // Find share across all wallets
        for (const [userId, wallet] of wallets) {
            const share = wallet.shares.find(s => s.id === shareId || s.token === shareId);

            if (share) {
                if (share.revoked) {
                    return { valid: false, error: 'Share has been revoked' };
                }

                if (new Date() > share.expiry) {
                    return { valid: false, error: 'Share has expired' };
                }

                // Log access
                share.accessLog.push({
                    timestamp: new Date(),
                    ip: accessInfo.ip,
                    userAgent: accessInfo.userAgent,
                    location: accessInfo.location,
                    organization: accessInfo.organization,
                    verified: true,
                });

                // Get credential with selective disclosure
                const credential = wallet.credentials.find(c => c.id === share.credentialId);
                if (!credential) {
                    return { valid: false, error: 'Credential not found' };
                }

                // Apply selective disclosure
                const disclosedData = this.applySelectiveDisclosure(credential.data, share.disclosedFields);

                // Notify wallet owner
                this.addNotification(userId, {
                    type: 'share_access',
                    title: 'Credential Accessed',
                    message: `Your ${credential.type[0]} was verified${accessInfo.organization ? ` by ${accessInfo.organization}` : ''}`,
                    data: { shareId, accessInfo },
                });

                return {
                    valid: true,
                    credential: {
                        id: credential.id,
                        type: credential.type,
                        issuer: credential.issuer,
                        issuanceDate: credential.issuanceDate,
                        data: disclosedData,
                        anchorStatus: credential.anchorStatus,
                        hash: credential.hash,
                    },
                };
            }
        }

        return { valid: false, error: 'Share not found' };
    }

    /**
     * Revoke a share
     */
    async revokeShare(userId: number, shareId: string): Promise<boolean> {
        const wallet = await this.getOrCreateWallet(userId);
        const share = wallet.shares.find(s => s.id === shareId);

        if (share) {
            share.revoked = true;

            wallet.consentLogs.push({
                id: `consent-${Date.now()}`,
                credentialId: share.credentialId,
                action: 'revoke',
                disclosedFields: share.disclosedFields,
                purpose: 'share_revoked',
                timestamp: new Date(),
            });

            return true;
        }

        return false;
    }

    /**
     * Get all credentials for a user
     */
    async getCredentials(userId: number): Promise<StoredCredential[]> {
        const wallet = await this.getOrCreateWallet(userId);
        return wallet.credentials;
    }

    /**
     * Get credentials by category
     */
    async getCredentialsByCategory(userId: number, category: string): Promise<StoredCredential[]> {
        const wallet = await this.getOrCreateWallet(userId);
        return wallet.credentials.filter(c => c.category === category);
    }

    /**
     * Get share history for a credential
     */
    async getShareHistory(userId: number, credentialId?: string): Promise<ShareRecord[]> {
        const wallet = await this.getOrCreateWallet(userId);
        if (credentialId) {
            return wallet.shares.filter(s => s.credentialId === credentialId);
        }
        return wallet.shares;
    }

    /**
     * Get consent logs
     */
    async getConsentLogs(userId: number, credentialId?: string): Promise<ConsentLog[]> {
        const wallet = await this.getOrCreateWallet(userId);
        if (credentialId) {
            return wallet.consentLogs.filter(c => c.credentialId === credentialId);
        }
        return wallet.consentLogs;
    }

    /**
     * Get notifications
     */
    async getNotifications(userId: number): Promise<WalletNotification[]> {
        const wallet = await this.getOrCreateWallet(userId);
        return wallet.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(userId: number, notificationId: string): Promise<void> {
        const wallet = await this.getOrCreateWallet(userId);
        const notification = wallet.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }

    /**
     * Create wallet backup
     */
    async createBackup(userId: number): Promise<{ backupData: string; backupKey: string }> {
        const wallet = await this.getOrCreateWallet(userId);
        const backupKey = crypto.randomBytes(32).toString('hex');

        const backupData = this.encrypt(JSON.stringify({
            userId: wallet.userId,
            did: wallet.did,
            credentials: wallet.credentials.map(c => ({
                ...c,
                data: undefined, // Use encrypted data only
            })),
            exportedAt: new Date().toISOString(),
        }), backupKey);

        wallet.backupKey = this.hashCredential(backupKey); // Store hash only

        return { backupData, backupKey };
    }

    /**
     * Restore from backup
     */
    async restoreFromBackup(backupData: string, backupKey: string): Promise<WalletState> {
        const decrypted = this.decrypt(backupData, backupKey);
        const data = JSON.parse(decrypted);

        const wallet = await this.getOrCreateWallet(data.userId, data.did);
        // Merge credentials (avoid duplicates by hash)
        for (const cred of data.credentials) {
            if (!wallet.credentials.some(c => c.hash === cred.hash)) {
                wallet.credentials.push(cred);
            }
        }

        return wallet;
    }

    /**
     * Get wallet statistics
     */
    async getWalletStats(userId: number): Promise<{
        totalCredentials: number;
        byCategory: Record<string, number>;
        totalShares: number;
        activeShares: number;
        totalVerifications: number;
        lastActivity: Date;
    }> {
        const wallet = await this.getOrCreateWallet(userId);

        const byCategory: Record<string, number> = {};
        for (const cred of wallet.credentials) {
            byCategory[cred.category] = (byCategory[cred.category] || 0) + 1;
        }

        const activeShares = wallet.shares.filter(s => !s.revoked && new Date() < s.expiry).length;
        const totalVerifications = wallet.shares.reduce((sum, s) => sum + s.accessLog.length, 0);

        return {
            totalCredentials: wallet.credentials.length,
            byCategory,
            totalShares: wallet.shares.length,
            activeShares,
            totalVerifications,
            lastActivity: wallet.lastSync,
        };
    }

    // ============== Private Helpers ==============

    private encrypt(plaintext: string, key?: string): string {
        const useKey = key || this.encryptionKey;
        const keyBuffer = Buffer.from(useKey.slice(0, 64), 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    private decrypt(encrypted: string, key?: string): string {
        const useKey = key || this.encryptionKey;
        const [ivHex, authTagHex, ciphertext] = encrypted.split(':');
        const keyBuffer = Buffer.from(useKey.slice(0, 64), 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    private hashCredential(data: any): string {
        const canonical = JSON.stringify(data, Object.keys(data).sort());
        return crypto.createHash('sha256').update(canonical).digest('hex');
    }

    private generateShareToken(): string {
        return crypto.randomBytes(32).toString('base64url');
    }

    private applySelectiveDisclosure(data: any, disclosedFields: string[]): any {
        if (disclosedFields.length === 0) return data;

        const result: any = {};
        for (const field of disclosedFields) {
            const parts = field.split('.');
            let source = data;
            let target = result;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    if (source && source[part] !== undefined) {
                        target[part] = source[part];
                    }
                } else {
                    if (source) source = source[part];
                    if (!target[part]) target[part] = {};
                    target = target[part];
                }
            }
        }

        return result;
    }

    private addNotification(userId: number, notification: Omit<WalletNotification, 'id' | 'timestamp' | 'read'>) {
        const wallet = wallets.get(userId);
        if (wallet) {
            wallet.notifications.push({
                ...notification,
                id: `notif-${Date.now()}`,
                timestamp: new Date(),
                read: false,
            });
        }
    }

    private async simulateAnchor(userId: number, credentialId: string) {
        const wallet = wallets.get(userId);
        if (wallet) {
            const credential = wallet.credentials.find(c => c.id === credentialId);
            if (credential) {
                credential.anchorStatus = 'anchored';
                credential.anchorTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;
                credential.blockNumber = Math.floor(Math.random() * 1000000) + 50000000;

                this.addNotification(userId, {
                    type: 'credential_received',
                    title: 'Credential Anchored',
                    message: `Your credential has been anchored to the blockchain`,
                    data: { credentialId, txHash: credential.anchorTxHash },
                });
            }
        }
    }
}

export const walletService = new WalletService();
