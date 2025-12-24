import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Loader2, Mail, Phone, Key } from 'lucide-react';
import { Button, Input, Card, CardContent } from '../components/ui';
import { api } from '../lib/api';
import { useSession } from '../state/session';

type AuthMode = 'select' | 'email' | 'phone' | 'pin';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading, setError, error, loading } = useSession();
  
  const [mode, setMode] = useState<AuthMode>('select');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [pin, setPin] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.googleLogin('mock-google-token');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.sendEmailOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.verifyEmailOtp(email, otp);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.sendPhoneOtp(phone);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.verifyPhoneOtp(phone, otp);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePinVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.auth.setPin(pin);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN verification failed');
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            CredVerse
          </span>
        </div>

        <Card>
          <CardContent className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {mode === 'select' && (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Sign in to CredVerse
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm">
                    Secure Identity Gateway
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon />
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setMode('email')}
                      className="flex flex-col items-center py-4 h-auto"
                    >
                      <Mail className="w-5 h-5 mb-1" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setMode('phone')}
                      className="flex flex-col items-center py-4 h-auto"
                    >
                      <Phone className="w-5 h-5 mb-1" />
                      <span className="text-xs">Phone</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setMode('pin')}
                      className="flex flex-col items-center py-4 h-auto"
                    >
                      <Key className="w-5 h-5 mb-1" />
                      <span className="text-xs">PIN</span>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {mode === 'email' && (
              <>
                <button
                  onClick={() => { setMode('select'); setOtpSent(false); setOtp(''); }}
                  className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {otpSent ? 'Enter OTP' : 'Email Login'}
                </h2>
                {!otpSent ? (
                  <div className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                    <Button
                      className="w-full"
                      onClick={handleSendEmailOtp}
                      loading={loading}
                      disabled={!email}
                    >
                      Send OTP
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      OTP sent to {email}. Use <strong>123456</strong> in mock mode.
                    </p>
                    <Input
                      label="OTP Code"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <Button
                      className="w-full"
                      onClick={handleVerifyEmailOtp}
                      loading={loading}
                      disabled={otp.length !== 6}
                    >
                      Verify OTP
                    </Button>
                  </div>
                )}
              </>
            )}

            {mode === 'phone' && (
              <>
                <button
                  onClick={() => { setMode('select'); setOtpSent(false); setOtp(''); }}
                  className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {otpSent ? 'Enter OTP' : 'Phone Login'}
                </h2>
                {!otpSent ? (
                  <div className="space-y-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1234567890"
                    />
                    <Button
                      className="w-full"
                      onClick={handleSendPhoneOtp}
                      loading={loading}
                      disabled={!phone}
                    >
                      Send OTP
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      OTP sent to {phone}. Use <strong>123456</strong> in mock mode.
                    </p>
                    <Input
                      label="OTP Code"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    <Button
                      className="w-full"
                      onClick={handleVerifyPhoneOtp}
                      loading={loading}
                      disabled={otp.length !== 6}
                    >
                      Verify OTP
                    </Button>
                  </div>
                )}
              </>
            )}

            {mode === 'pin' && (
              <>
                <button
                  onClick={() => { setMode('select'); setPin(''); }}
                  className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  PIN Verification
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Enter your 6-digit PIN to continue. This is a placeholder for PIN/biometric setup.
                </p>
                <div className="space-y-4">
                  <Input
                    label="PIN"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    maxLength={6}
                  />
                  <Button
                    className="w-full"
                    onClick={handlePinVerify}
                    loading={loading}
                    disabled={pin.length !== 6}
                  >
                    Verify PIN
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sign-in should take less than 2 minutes
        </p>
      </div>
    </div>
  );
}
