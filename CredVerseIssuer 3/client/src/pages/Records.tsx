import { Layout } from "@/components/layout/Layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, MoreHorizontal, ShieldCheck, AlertCircle, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, type Record } from "@/lib/store";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Records() {
  const { records, revokeRecord } = useStore();
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filteredRecords = records.filter((record: Record) => 
    record.name.toLowerCase().includes(search.toLowerCase()) ||
    record.id.toLowerCase().includes(search.toLowerCase()) ||
    record.credential.toLowerCase().includes(search.toLowerCase())
  );

  const handleRevoke = (id: string) => {
    // Use a simple prompt for demonstration - normally a dialog
    const reason = window.prompt("Please enter a reason for revocation (e.g. 'Administrative Error', 'Expired'):");
    if (reason) {
      revokeRecord(id);
      toast({
        title: "Credential Revoked",
        description: `Credential ${id} revoked. Reason: ${reason}. Anchoring update...`,
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Student Records</h2>
            <p className="text-muted-foreground mt-1">Search, filter, and manage issued credentials.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Name, ID, or Credential..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="border rounded-md bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Credential Type</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Tx Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No records found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium font-mono text-xs text-muted-foreground">{record.id}</TableCell>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.credential}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                       {record.txHash ? (
                         <a href="#" className="flex items-center gap-1 font-mono text-xs text-blue-600 hover:underline">
                           {record.txHash} <ExternalLink className="h-3 w-3" />
                         </a>
                       ) : (
                         <span className="text-muted-foreground text-xs">-</span>
                       )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          record.status === 'Issued' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900' :
                          record.status === 'Revoked' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900' :
                          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900'
                        }
                      >
                        {record.status === 'Issued' && <ShieldCheck className="mr-1 h-3 w-3" />}
                        {record.status === 'Revoked' && <AlertCircle className="mr-1 h-3 w-3" />}
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{record.issuer}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          <DropdownMenuItem>View on Blockchain</DropdownMenuItem>
                          {record.status !== 'Revoked' && (
                             <DropdownMenuItem className="text-red-600" onClick={() => handleRevoke(record.id)}>
                               Revoke Credential
                             </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
