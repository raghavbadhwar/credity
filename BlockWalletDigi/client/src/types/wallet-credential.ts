export interface WalletCredential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  category: string;
  anchorStatus: string;
  hash: string;
  verificationCount: number;
}
