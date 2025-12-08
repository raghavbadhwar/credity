import { createWalletClient, http, publicActions, type WalletClient, type PublicClient, type Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// ABI for CredentialRegistry (simplified for MVP)
const REGISTRY_ABI = [
    {
        inputs: [{ name: "_rootHash", type: "bytes32" }],
        name: "anchorCredential",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_credentialHash", type: "bytes32" }],
        name: "revokeCredential",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_credentialHash", type: "bytes32" }],
        name: "isRevoked",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

export class RelayerService {
    private client: WalletClient & PublicClient;
    private account: Account;
    private contractAddress: `0x${string}`;

    constructor() {
        // In production, load from env vars
        const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}` || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Default Anvil key
        this.account = privateKeyToAccount(privateKey);

        this.contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS as `0x${string}` || "0x0000000000000000000000000000000000000000";

        this.client = createWalletClient({
            account: this.account,
            chain: sepolia,
            transport: http(process.env.RPC_URL),
        }).extend(publicActions) as any;
    }

    async anchorCredential(credentialHash: string): Promise<string> {
        try {
            if (this.contractAddress === "0x0000000000000000000000000000000000000000") {
                console.warn("Contract address not set, skipping on-chain anchor");
                return "0x_mock_tx_hash_contract_not_set";
            }

            const hash = await this.client.writeContract({
                address: this.contractAddress,
                abi: REGISTRY_ABI,
                functionName: "anchorCredential",
                args: [credentialHash as `0x${string}`],
                account: this.account,
                chain: sepolia,
            });

            console.log(`Anchored credential ${credentialHash} in tx ${hash}`);
            return hash;
        } catch (error) {
            console.error("Failed to anchor credential:", error);
            throw new Error("Blockchain anchoring failed");
        }
    }

    async revokeCredential(credentialHash: string): Promise<string> {
        try {
            if (this.contractAddress === "0x0000000000000000000000000000000000000000") {
                console.warn("Contract address not set, skipping on-chain revocation");
                return "0x_mock_tx_hash_contract_not_set";
            }

            const hash = await this.client.writeContract({
                address: this.contractAddress,
                abi: REGISTRY_ABI,
                functionName: "revokeCredential",
                args: [credentialHash as `0x${string}`],
                account: this.account,
                chain: sepolia,
            });

            console.log(`Revoked credential ${credentialHash} in tx ${hash}`);
            return hash;
        } catch (error) {
            console.error("Failed to revoke credential:", error);
            throw new Error("Blockchain revocation failed");
        }
    }

    async isRevoked(credentialHash: string): Promise<boolean> {
        try {
            if (this.contractAddress === "0x0000000000000000000000000000000000000000") {
                console.warn("Contract address not set, assuming not revoked");
                return false;
            }

            const isRevoked = await this.client.readContract({
                address: this.contractAddress,
                abi: REGISTRY_ABI,
                functionName: "isRevoked",
                args: [credentialHash as `0x${string}`],
            });

            return isRevoked;
        } catch (error) {
            console.error("Failed to check revocation status:", error);
            // Default to false (not revoked) if check fails, or throw? 
            // For safety, maybe better to return false but log error.
            return false;
        }
    }
}

export const relayerService = new RelayerService();
