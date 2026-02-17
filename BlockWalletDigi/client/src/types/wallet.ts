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

export interface WalletStats {
  totalCredentials: number;
  byCategory: Record<string, number>;
  totalShares: number;
  activeShares: number;
  totalVerifications: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
