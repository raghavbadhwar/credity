import { useState, useEffect } from 'react';
import { Camera, FileText, Fingerprint, Link2, CheckCircle } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Stepper,
  Pill,
  Skeleton,
  ErrorState,
} from '../components/ui';
import { api } from '../lib/api';
import type { VerificationSession, VerificationStep } from '../types';

export function VerifyPage() {
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get existing session or create new one
      const newSession = await api.verification.createSession();
      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleLiveness = async () => {
    if (!session) return;
    setActionLoading('liveness');
    try {
      const updated = await api.verification.submitLiveness(session.id, {});
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Liveness check failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDocument = async () => {
    if (!session) return;
    setActionLoading('document');
    try {
      const updated = await api.verification.submitDocument(session.id, {});
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Document upload failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDigiLocker = async () => {
    if (!session) return;
    setActionLoading('digilocker');
    try {
      const updated = await api.verification.connectDigiLocker(session.id);
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DigiLocker connection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    setActionLoading('submit');
    try {
      const updated = await api.verification.submitSession(session.id);
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusVariant = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStepIcon = (name: string) => {
    if (name.includes('Liveness')) return Camera;
    if (name.includes('Document') || name.includes('Face')) return FileText;
    if (name.includes('DigiLocker')) return Link2;
    return Fingerprint;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-20 w-full mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-3xl mx-auto">
        <ErrorState message={error} onRetry={loadSession} />
      </div>
    );
  }

  const completedSteps = session?.steps.filter((s) => s.status === 'completed').length || 0;
  const totalSteps = session?.steps.length || 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
        <p className="text-gray-500 mt-1">Complete all steps to verify your identity</p>
        <p className="text-sm text-gray-400 mt-1">Verification should take less than 5 minutes</p>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{completedSteps} of {totalSteps} steps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stepper */}
      {session && (
        <Card>
          <CardHeader>
            <Stepper steps={session.steps} />
          </CardHeader>
        </Card>
      )}

      {/* Steps detail */}
      <div className="space-y-4">
        {session?.steps.map((step, index) => {
          const Icon = getStepIcon(step.name);
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        step.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : step.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{step.name}</h3>
                      {step.score !== undefined && (
                        <p className="text-sm text-gray-500">
                          Confidence: {step.score}%
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Pill variant={getStatusVariant(step.status)}>
                      {step.status.replace('_', ' ')}
                    </Pill>
                    {step.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={
                          step.name.includes('Liveness')
                            ? handleLiveness
                            : step.name.includes('Document')
                            ? handleDocument
                            : step.name.includes('DigiLocker')
                            ? handleDigiLocker
                            : undefined
                        }
                        loading={actionLoading === step.name.toLowerCase().split(' ')[0]}
                        disabled={index > 0 && session.steps[index - 1].status !== 'completed'}
                      >
                        Start
                      </Button>
                    )}
                    {step.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={
                          step.name.includes('Liveness')
                            ? handleLiveness
                            : step.name.includes('Document')
                            ? handleDocument
                            : step.name.includes('DigiLocker')
                            ? handleDigiLocker
                            : undefined
                        }
                        loading={actionLoading === step.name.toLowerCase().split(' ')[0]}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* DigiLocker CTA */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Link2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Connect DigiLocker</h3>
              <p className="text-sm text-gray-600">
                Link your DigiLocker account for instant document verification
              </p>
            </div>
            <Button onClick={handleDigiLocker} loading={actionLoading === 'digilocker'}>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review & Submit */}
      {session?.status !== 'completed' && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            loading={actionLoading === 'submit'}
            disabled={completedSteps < totalSteps}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      )}

      {session?.status === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Verification Complete</h3>
            <p className="text-gray-600">Your identity has been verified successfully.</p>
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
