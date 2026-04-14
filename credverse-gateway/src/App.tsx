
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, ShieldCheck, Wallet, UserCheck, LayoutGrid } from 'lucide-react';

// Portal URLs - configurable via environment variables
const PORTAL_URLS = {
  issuer: import.meta.env.VITE_ISSUER_URL || 'http://localhost:5001',
  wallet: import.meta.env.VITE_WALLET_URL || 'http://localhost:5002',
  recruiter: import.meta.env.VITE_RECRUITER_URL || 'http://localhost:5003',
};

function App() {
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate API call to Google Auth provider
    setTimeout(() => {
      setLoading(false);
      setAuthenticated(true);
    }, 1500);
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">CredVerse</span>
        </div>
        <nav className="text-sm font-medium text-gray-500 hidden md:block">
          Secure Identity Gateway v1.0
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!authenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Sign in to CredVerse</h1>
                  <p className="text-gray-500 mt-2 text-sm">
                    Access your issuer dashboard, wallet, or recruiter portal
                  </p>
                </div>

                <div className="space-y-6">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center h-12 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    ) : (
                      <>
                        <GoogleIcon />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-400">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <input type="email" placeholder="Email address" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" disabled />
                    <button disabled className="w-full h-10 bg-gray-900 text-white rounded-lg font-medium text-sm opacity-50 cursor-not-allowed">
                      Sign In
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="roles"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-200 p-8 rounded-xl shadow-xl ring-1 ring-gray-900/5"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Welcome back, Raghav</h2>
                  <p className="text-gray-500 text-sm">Select a portal to continue</p>
                </div>

                <div className="space-y-3">
                  <RoleButton
                    title="Issuer Dashboard"
                    description="Issue & Manage Credentials"
                    icon={LayoutGrid}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    hover="hover:border-blue-200 hover:bg-blue-50/50"
                    onClick={() => window.location.href = PORTAL_URLS.issuer}
                  />
                  <RoleButton
                    title="BlockWallet"
                    description="Personal Storage & Identity"
                    icon={Wallet}
                    color="text-purple-600"
                    bg="bg-purple-50"
                    hover="hover:border-purple-200 hover:bg-purple-50/50"
                    onClick={() => window.location.href = PORTAL_URLS.wallet}
                  />
                  <RoleButton
                    title="Recruiter Portal"
                    description="Verify Candidates"
                    icon={UserCheck}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    hover="hover:border-emerald-200 hover:bg-emerald-50/50"
                    onClick={() => window.location.href = PORTAL_URLS.recruiter}
                  />
                </div>

                <button
                  onClick={() => setAuthenticated(false)}
                  className="w-full mt-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-400">
        &copy; 2024 CredVerse Inc. All rights reserved.
      </footer>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RoleButton({ title, description, icon: Icon, color, bg, hover, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md ${hover} text-left group`}
    >
      <div className={`p-3 rounded-lg ${bg} ${color} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
    </button>
  );
}

export default App;
