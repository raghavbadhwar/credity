import { useState, useEffect } from 'react';
import { Link2, Check, X, Clock, Building2, History } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Pill,
  Skeleton,
  ErrorState,
  EmptyState,
} from '../components/ui';
import { api } from '../lib/api';
import type { Connection } from '../types';

type TabType = 'pending' | 'active' | 'history';

export function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [activeConnections, setActiveConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, active] = await Promise.all([
        api.connections.listPending(),
        api.connections.listConnections(),
      ]);
      setPendingConnections(pending);
      setActiveConnections(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(`approve-${id}`);
    try {
      await api.connections.approveConnection(id);
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve connection');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (id: string) => {
    setActionLoading(`deny-${id}`);
    try {
      await api.connections.denyConnection(id);
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deny connection');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    { id: 'pending' as const, label: 'Pending', count: pendingConnections.length },
    { id: 'active' as const, label: 'Active', count: activeConnections.length },
    { id: 'history' as const, label: 'History', count: 0 },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && pendingConnections.length === 0 && activeConnections.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorState message={error} onRetry={loadConnections} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        <p className="text-gray-500 mt-1">Manage platform access to your credentials</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingConnections.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<Clock className="w-12 h-12" />}
                  title="No pending requests"
                  description="Connection requests from platforms will appear here"
                />
              </CardContent>
            </Card>
          ) : (
            pendingConnections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {connection.platform}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Requesting access to:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {connection.sharedCredentials.map((cred, i) => (
                            <Pill key={i} variant="info">
                              {cred}
                            </Pill>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested {formatDate(connection.lastAccessedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleDeny(connection.id)}
                        loading={actionLoading === `deny-${connection.id}`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Deny
                      </Button>
                      <Button
                        onClick={() => handleApprove(connection.id)}
                        loading={actionLoading === `approve-${connection.id}`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Active Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeConnections.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={<Link2 className="w-12 h-12" />}
                  title="No active connections"
                  description="Platforms you've granted access to will appear here"
                />
              </CardContent>
            </Card>
          ) : (
            activeConnections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {connection.platform}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Shared credentials:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {connection.sharedCredentials.map((cred, i) => (
                            <Pill key={i} variant="success">
                              {cred}
                            </Pill>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Last accessed {formatDate(connection.lastAccessedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeny(connection.id)}
                      loading={actionLoading === `deny-${connection.id}`}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Revoke
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Connection History</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-12">
              <History className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Timeline Placeholder
              </h3>
              <p className="text-sm text-gray-500">
                Historical connection events will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
