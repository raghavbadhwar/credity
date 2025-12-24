import { User, Key, LogOut, Fingerprint, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../components/ui';
import { useSession } from '../state/session';
import { api } from '../lib/api';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, accessToken, signOut } = useSession();

  const handleSignOut = () => {
    api.auth.signOut();
    signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name || 'User'}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{user?.name || 'Anonymous User'}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {user?.phone && (
                <p className="text-sm text-gray-500">{user.phone}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Session Information</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Session Status</span>
            <span className={`font-medium ${accessToken ? 'text-green-600' : 'text-red-600'}`}>
              {accessToken ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-gray-600">User ID</span>
            <span className="font-mono text-sm text-gray-500">
              {user?.id || 'N/A'}
            </span>
          </div>
          {user?.trustScore !== undefined && (
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-gray-600">Trust Score</span>
              <span className="font-medium text-gray-900">{user.trustScore}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Key className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">PIN Setup</h3>
                <p className="text-sm text-gray-500">Set up a 6-digit PIN for quick access</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Set Up
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Fingerprint className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Biometric Authentication</h3>
                <p className="text-sm text-gray-500">Use fingerprint or face ID</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-500">End your current session</p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
