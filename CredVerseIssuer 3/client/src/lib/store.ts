import { create } from 'zustand';

export interface Record {
  id: string;
  name: string;
  credential: string;
  date: string;
  status: 'Issued' | 'Revoked' | 'Pending';
  issuer: string;
  department?: string;
  txHash?: string;
}

interface AppState {
  records: Record[];
  addRecord: (record: Record) => void;
  revokeRecord: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  records: [
    { id: "UNI-2025-001", name: "Aditi Sharma", credential: "B.Tech Computer Science", date: "May 15, 2025", status: "Issued", issuer: "System", department: "Engineering", txHash: "0x7d...2f9a" },
    { id: "UNI-2025-002", name: "Rahul Verma", credential: "MBA Finance", date: "May 15, 2025", status: "Issued", issuer: "System", department: "Business", txHash: "0x3a...8b1c" },
    { id: "UNI-2025-003", name: "Priya Singh", credential: "B.Sc Physics", date: "May 14, 2025", status: "Revoked", issuer: "Registrar", department: "Science", txHash: "0x9c...4d2e" },
    { id: "UNI-2025-004", name: "Amit Patel", credential: "M.Tech Data Science", date: "May 14, 2025", status: "Issued", issuer: "System", department: "Engineering", txHash: "0x1f...5e3d" },
    { id: "UNI-2025-005", name: "Sneha Gupta", credential: "B.A. Economics", date: "May 13, 2025", status: "Pending", issuer: "Dept Admin", department: "Arts" },
    { id: "UNI-2025-006", name: "Vikram Malhotra", credential: "B.Tech Mechanical", date: "May 13, 2025", status: "Issued", issuer: "System", department: "Engineering", txHash: "0x6b...1a4f" },
    { id: "UNI-2025-007", name: "Ananya Roy", credential: "B.Des Interaction Design", date: "May 12, 2025", status: "Issued", issuer: "System", department: "Design", txHash: "0x2e...9c5b" },
  ],
  addRecord: (record: Record) => set((state: AppState) => ({ records: [record, ...state.records] })),
  revokeRecord: (id: string) => set((state: AppState) => ({
    records: state.records.map((r: Record) => r.id === id ? { ...r, status: 'Revoked' } : r)
  })),
}));
