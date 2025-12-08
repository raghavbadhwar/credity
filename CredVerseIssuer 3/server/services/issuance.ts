import { type InsertCredential, type Credential } from "@shared/schema";
import { storage } from "../storage";
import { blockchainService } from "./blockchain-service";
import { randomUUID } from "crypto";

// Mock signer for MVP
// In production, use Veramo or similar DID library
async function signJwt(payload: any, issuerDid: string): Promise<string> {
    const header = { alg: "ES256", typ: "JWT" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = "sig_" + randomUUID().replace(/-/g, '');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export class IssuanceService {
    // In-memory offer storage (token -> credentialId)
    private offers = new Map<string, string>();

    async issueCredential(
        tenantId: string,
        templateId: string,
        issuerId: string,
        recipient: any,
        credentialData: any
    ): Promise<Credential> {
        const template = await storage.getTemplate(templateId);
        if (!template) throw new Error("Template not found");

        const issuer = await storage.getIssuer(issuerId);
        if (!issuer) throw new Error("Issuer not found");

        // Construct VC Payload following W3C VC Data Model
        const vcPayload = {
            sub: recipient.did || recipient.studentId,
            iss: issuer.did || `did:web:${issuer.domain}`,
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
                    id: issuer.did || `did:web:${issuer.domain}`,
                    name: issuer.name,
                },
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                    id: recipient.did || recipient.studentId,
                    ...credentialData,
                },
            },
        };

        const vcJwt = await signJwt(vcPayload, vcPayload.iss);

        // Create credential in database
        const credential = await storage.createCredential({
            tenantId,
            templateId,
            issuerId,
            recipient,
            credentialData,
            vcJwt,
            revoked: false,
        });

        // Anchor credential hash on blockchain
        console.log(`[Issuance] Anchoring credential ${credential.id} on blockchain...`);
        const anchorResult = await blockchainService.anchorCredential({
            id: credential.id,
            issuer: vcPayload.iss,
            subject: recipient.did || recipient.studentId,
            data: credentialData,
            issuedAt: new Date().toISOString(),
        });

        if (anchorResult.success) {
            console.log(`[Issuance] Credential ${credential.id} anchored: ${anchorResult.txHash}`);
            // Update credential with blockchain info
            await storage.updateCredentialBlockchain(credential.id, {
                txHash: anchorResult.txHash,
                blockNumber: anchorResult.blockNumber,
                credentialHash: anchorResult.hash,
            });
        } else {
            console.warn(`[Issuance] Blockchain anchor failed for ${credential.id}: ${anchorResult.error}`);
        }

        // Webhook Notification
        if (recipient.webhookUrl) {
            console.log(`[Issuance] Sending webhook to ${recipient.webhookUrl}`);
            fetch(recipient.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'credential_issued',
                    credentialId: credential.id,
                    vcJwt,
                    recipient: recipient.did || recipient.email
                })
            }).catch(e => console.error("[Issuance] Webhook failed:", e));
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
                txHash: anchorResult.txHash,
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
        return this.offers.get(token);
    }

    async bulkIssue(
        tenantId: string,
        templateId: string,
        issuerId: string,
        recipientsData: any[]
    ): Promise<{ jobId: string; total: number }> {
        const jobId = randomUUID();
        const total = recipientsData.length;

        console.log(`[Issuance] Starting bulk issuance job ${jobId} for ${total} credentials`);

        // Process in background
        setTimeout(async () => {
            let success = 0;
            let failed = 0;

            for (const item of recipientsData) {
                try {
                    await this.issueCredential(
                        tenantId,
                        templateId,
                        issuerId,
                        item.recipient,
                        item.data
                    );
                    success++;
                } catch (e) {
                    console.error(`[Issuance] Bulk job ${jobId} failed for recipient:`, e);
                    failed++;
                }
            }

            console.log(`[Issuance] Bulk job ${jobId} completed: ${success} success, ${failed} failed`);

            await storage.createActivityLog({
                tenantId,
                type: 'bulk_issuance_completed',
                title: 'Bulk Issuance Completed',
                description: `Issued ${success}/${total} credentials successfully`,
                metadata: { jobId, success, failed, total },
            });
        }, 100);

        return { jobId, total };
    }

    async revokeCredential(credentialId: string, reason: string): Promise<void> {
        const credential = await storage.getCredential(credentialId);
        if (!credential) throw new Error("Credential not found");

        // Revoke on blockchain
        if ((credential as any).credentialHash) {
            console.log(`[Issuance] Revoking credential ${credentialId} on blockchain...`);
            const result = await blockchainService.revokeCredential(
                (credential as any).credentialHash,
                reason
            );
            if (result.success) {
                console.log(`[Issuance] Credential revoked on-chain: ${result.txHash}`);
            }
        }

        // Revoke in database
        await storage.revokeCredential(credentialId);

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
