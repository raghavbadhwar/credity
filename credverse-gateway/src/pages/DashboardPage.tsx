import { useState, useEffect } from 'react';
import { TrendingUp, Target, Shield, Users, Star, ArrowRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  TrustRing,
  Skeleton,
  ErrorState,
} from '../components/ui';
import { api } from '../lib/api';
import type { TrustScore } from '../types';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrustScore();
  }, []);

  const loadTrustScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const score = await api.trustScore.getTrustScore();
      setTrustScore(score);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trust score');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <ErrorState message={error} onRetry={loadTrustScore} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your trust score overview</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Trust Score Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Trust Score</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <TrustRing score={trustScore?.score || 0} size={160} strokeWidth={12} />
            <p className="text-sm text-gray-500 mt-4">
              Updated {trustScore?.updatedAt ? new Date(trustScore.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Score Breakdown</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreItem
              icon={<Shield className="w-5 h-5" />}
              label="Identity"
              value={trustScore?.breakdown.identity || 0}
              color="blue"
              weight="40%"
            />
            <ScoreItem
              icon={<TrendingUp className="w-5 h-5" />}
              label="Activity"
              value={trustScore?.breakdown.activity || 0}
              color="green"
              weight="30%"
            />
            <ScoreItem
              icon={<Star className="w-5 h-5" />}
              label="Reputation"
              value={trustScore?.breakdown.reputation || 0}
              color="purple"
              weight="30%"
            />
          </CardContent>
        </Card>
      </div>

      {/* Trend Placeholder */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Score Trend</h2>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Trend chart placeholder</p>
              <p className="text-sm text-gray-400">Historical score data will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improve Score Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Improve Your Score</h2>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {trustScore?.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-gray-700">{suggestion}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/verify">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Verify Identity</h3>
                <p className="text-sm text-gray-500">Complete verification</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/credentials">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Credentials</h3>
                <p className="text-sm text-gray-500">View & share</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/connections">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Connections</h3>
                <p className="text-sm text-gray-500">Manage access</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

interface ScoreItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple';
  weight: string;
}

function ScoreItem({ icon, label, value, color, weight }: ScoreItemProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const barColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
          <div>
            <span className="font-medium text-gray-900">{label}</span>
            <span className="text-sm text-gray-400 ml-2">({weight})</span>
          </div>
        </div>
        <span className="font-semibold text-gray-900">{value}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${barColors[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
