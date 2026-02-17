import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WalletCredential } from "@/types/wallet";
import { memo } from "react";
import { getCategoryColor } from "@/lib/colors";

interface CredentialListItemProps {
  cred: WalletCredential;
  index: number;
}

export const CredentialListItem = memo(function CredentialListItem({ cred, index }: CredentialListItemProps) {
  return (
    <Link href={`/credential/${cred.id}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-card p-4 rounded-xl border border-border flex items-center gap-4 shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${getCategoryColor(cred.category)} text-white`}>
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{cred.data?.name || cred.type[1] || 'Credential'}</p>
          <p className="text-xs text-muted-foreground">{cred.issuer}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={cred.anchorStatus === 'anchored' ? 'default' : 'secondary'} className="text-[10px]">
            {cred.anchorStatus === 'anchored' ? '⛓ On-chain' : 'Pending'}
          </Badge>
          <span className="text-[10px] text-muted-foreground capitalize">{cred.category}</span>
        </div>
      </motion.div>
    </Link>
  );
});
