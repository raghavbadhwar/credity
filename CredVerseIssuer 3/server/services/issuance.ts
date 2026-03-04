// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type InsertCredential, type Credential } from "@shared/schema";
import { storage } from "../storage";
import { blockchainService } from "./blockchain-service";
import { signVcJwt } from "./vc-signer";
import { randomUUID } from "crypto";
import { signWebhook } from "@credverse/shared-auth";
import { registerCredentialStatus } from "./status-list-service";


export class IssuanceService {
    // In-memory offer storage (token -> credentialId)
    private offers = new Map<string, string>();

    async issueCredential(
        tenantId: string,
        templateId: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        issuerId: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recipient: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        credentialData: any
    ): Promise<Credential> {
        const template = await storage.getTemplate(templateId);
        if (!template) throw new Error("Template not found");

        const issuer = await storage.getIssuer(issuerId);
        if (!issuer) throw new Error("Issuer not found");

        // Construct VC Payload following W3C VC Data Model
        const subjectDid = recipient.did || recipient.studentId;
        const issuerDid = issuer.did || `did:web:${issuer.domain}`;
        const vcPayload = {
            sub: subjectDid,
            iss: issuerDid,
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
            vc: {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://credverse.io/context/v1"
                ],
                type: ["VerifiableCredential", template.name],
                issuer: {
                    id: issuerDid,
                    name: issuer.name,
                },
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                    id: subjectDid,
                    ...credentialData,
                },
            },
        };

        const vcJwt = await signVcJwt(vcPayload, vcPayload.iss);

        // Create credential in database
        const credential = await storage.createCredential({
            tenantId,
            templateId,
            issuerId,
            format: 'vc+jwt',
            issuerDid,
            subjectDid,
            issuanceFlow: 'legacy',
            recipient,
            credentialData,
            vcJwt,
            revoked: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        });

// eslint-disable-next-line @typescript-eslint/no-explicit-any

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusRegistration = await registerCredentialStatus(credential.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (credential as any).statusListId = statusRegistration.listId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (credential as any).statusListIndex = statusRegistration.index;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (credential as any).format = 'vc+jwt';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (credential as any).issuanceFlow = 'legacy';

        const anchorInput = {
            id: credential.id,
            issuer: vcPayload.iss,
            subject: recipient.did || recipient.studentId,
            data: credentialData,
            issuedAt: new Date().toISOString(),
        };
        const anchorMode = (process.env.BLOCKCHAIN_ANCHOR_MODE || 'async').toLowerCase();
        if (anchorMode !== 'off') {
            const anchorTask = async () => {
                console.log(`[Issuance] Anchoring credential ${credential.id} on blockchain...`);
                const anchorResult = await blockchainService.anchorCredential(anchorInput);
                if (anchorResult.success) {
                    console.log(`[Issuance] Credential ${credential.id} anchored: ${anchorResult.txHash}`);
                    await storage.updateCredentialBlockchain(credential.id, {
                        txHash: anchorResult.txHash,
                        blockNumber: anchorResult.blockNumber,
                        credentialHash: anchorResult.hash,
                    });
                    return anchorResult;
                }

                console.warn(`[Issuance] Blockchain anchor failed for ${credential.id}: ${anchorResult.error}`);
                return anchorResult;
            };

            if (anchorMode === 'sync') {
                await anchorTask();
            } else {
                void anchorTask().catch((e) => {
                    console.error(`[Issuance] Async anchor failed for ${credential.id}:`, e);
                });
            }
        } else {
            console.log(`[Issuance] Blockchain anchoring disabled for credential ${credential.id}`);
        }

        // Webhook Notification
        if (recipient.webhookUrl) {
            console.log(`[Issuance] Sending webhook to ${recipient.webhookUrl}`);
            const webhookBody = {
                event: 'credential_issued',
                credentialId: credential.id,
                vcJwt,
                recipient: recipient.did || recipient.email
            };
            const webhookSecret = process.env.CREDENTIAL_WEBHOOK_SECRET;
            const signed = webhookSecret
                ? signWebhook(webhookBody, webhookSecret)
                : null;
            fetch(recipient.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(signed
                        ? {
                            'X-Webhook-Timestamp': signed.timestamp,
                            'X-Webhook-Signature': `sha256=${signed.signature}`,
                        }
                        : {}),
                },
                body: signed ? signed.payload : JSON.stringify(webhookBody),
            }).catch(e => console.error("[Issuance] Webhook failed:", e));
        }

        // Email Notification
        if (recipient.email) {
            try {
                const { emailService } = await import('./email');
                await emailService.sendCredentialNotification({
                    to: recipient.email,
                    recipientName: recipient.name || 'Student',
                    credentialType: template.name,
                    issuerName: issuer.name,
                    viewLink: `${process.env.APP_URL || 'http://localhost:5002'}/credential/${credential.id}`
                });
            } catch (e) {
                console.error("[Issuance] Email notification failed:", e);
            }
        }

        // Log the issuance activity
        await storage.createActivityLog({
            tenantId,
            type: 'credential_issued',
            title: `Credential Issued: ${template.name}`,
            description: `Issued ${template.name} to ${recipient.name || recipient.email}`,
            metadata: {
                credentialId: credential.id,
                templateName: template.name,
                recipientName: recipient.name,
                webhookSent: !!recipient.webhookUrl
            },
        });

        return credential;
    }

    createOffer(credentialId: string): string {
        const token = randomUUID();
        this.offers.set(token, credentialId);
        // Expire in 1 hour
        setTimeout(() => this.offers.delete(token), 60 * 60 * 1000);
        return token;
    }

    getOfferCredentialId(token: string): string | undefined {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.offers.get(token);
    }

    async bulkIssue(
        tenantId: string,
        templateId: string,
        issuerId: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recipientsData: any[]
    ): Promise<{ jobId: string; total: number; queued: boolean }> {
        const total = recipientsData.length;

        // Try to use Redis queue if available
        try {
            const { addBulkIssuanceJob, isQueueAvailable } = await import('./queue-service');

            if (isQueueAvailable()) {
                const result = await addBulkIssuanceJob({
                    tenantId,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    templateId,
                    issuerId,
                    recipients: recipientsData,
                });

                console.log(`[Issuance] Bulk job ${result.jobId} queued for ${total} credentials`);
                return { jobId: result.jobId, total, queued: true };
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            console.log('[Issuance] Queue service not available, using fallback');
        }

// eslint-disable-next-line @typescript-eslint/no-explicit-any

        throw new Error('Bulk issuance queue is unavailable. Configure REDIS_URL or disable bulk issuance.');
    }

// eslint-disable-next-line @typescript-eslint/no-explicit-any

    async revokeCredential(credentialId: string, reason: string): Promise<void> {
        const credential = await storage.getCredential(credentialId);
        if (!credential) throw new Error("Credential not found");

        // Revoke on blockchain
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((credential as any).credentialHash) {
            console.log(`[Issuance] Revoking credential ${credentialId} on blockchain...`);
            const result = await blockchainService.revokeCredential(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (credential as any).credentialHash,
                reason
            );
            if (result.success) {
                console.log(`[Issuance] Credential revoked on-chain: ${result.txHash}`);
            }
        }

        // Revoke in database
        await storage.revokeCredential(credentialId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recipient = (credential as any).recipient;
        const webhookUrl = recipient?.webhookUrl;
        if (webhookUrl) {
            const webhookBody = {
                event: 'credential_revoked',
                credentialId,
                reason,
            };
            const webhookSecret = process.env.CREDENTIAL_WEBHOOK_SECRET;
            const signed = webhookSecret ? signWebhook(webhookBody, webhookSecret) : null;
            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(signed
                        ? {
                            'X-Webhook-Timestamp': signed.timestamp,
                            'X-Webhook-Signature': `sha256=${signed.signature}`,
                        }
                        : {}),
                },
                body: signed ? signed.payload : JSON.stringify(webhookBody),
            }).catch((error) => {
                console.error('[Issuance] Revocation webhook failed:', error);
            });
        }

        // Log activity
        await storage.createActivityLog({
            tenantId: credential.tenantId,
            type: 'credential_revoked',
            title: 'Credential Revoked',
            description: `Revoked credential ${credentialId}: ${reason}`,
            metadata: { credentialId, reason },
        });
    }
}

export const issuanceService = new IssuanceService();
