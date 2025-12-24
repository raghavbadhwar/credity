import { useState, useEffect } from 'react';
import { FileText, Share2, XCircle, Eye, Clock, Calendar, X } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Pill,
  Skeleton,
  ErrorState,
  EmptyState,
  QRPlaceholder,
} from '../components/ui';
import { api } from '../lib/api';
import type { Credential } from '../types';

export function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [shareModal, setShareModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.credentials.listCredentials();
      setCredentials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (credential: Credential) => {
    setSelectedCredential(credential);
    setShareModal(true);
    setActionLoading('share');
    try {
      await api.credentials.shareCredential(credential.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (credential: Credential) => {
    setActionLoading(`revoke-${credential.id}`);
    try {
      await api.credentials.revokeCredential(credential.id);
      await loadCredentials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke credential');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusVariant = (status: Credential['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'warning';
      case 'revoked':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && credentials.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <ErrorState message={error} onRetry={loadCredentials} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credentials</h1>
        <p className="text-gray-500 mt-1">Manage your verified credentials</p>
        <p className="text-sm text-gray-400 mt-1">List loads in under 2 seconds</p>
      </div>

      {credentials.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FileText className="w-12 h-12" />}
              title="No credentials yet"
              description="Complete verification to get your first credentials"
              action={
                <Button onClick={() => window.location.href = '/verify'}>
                  Start Verification
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Your Credentials ({credentials.length})
            </h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {credentials.map((credential) => (
                  <tr key={credential.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {credential.name}
                          </div>
                          <div className="text-sm text-gray-500">{credential.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Pill variant={getStatusVariant(credential.status)}>
                        {credential.status}
                      </Pill>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{credential.usageCount} times</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(credential.lastUsedAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(credential.expiresAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(credential)}
                          disabled={credential.status !== 'active'}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevoke(credential)}
                          loading={actionLoading === `revoke-${credential.id}`}
                          disabled={credential.status === 'revoked'}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Share Modal */}
      {shareModal && selectedCredential && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Share Credential
              </h2>
              <button
                onClick={() => setShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Sharing: <strong>{selectedCredential.name}</strong>
                </p>
                {actionLoading === 'share' ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <QRPlaceholder size={180} />
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShareModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">Copy Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
