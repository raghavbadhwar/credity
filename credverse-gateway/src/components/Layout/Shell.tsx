import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';
import { NotificationBell } from '../ui/NotificationBell';
import { useSession } from '../../state/session';

export function Shell() {
  const { user, signOut } = useSession();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            CredVerse
          </span>
        </Link>

        <nav className="text-sm font-medium text-gray-500 hidden md:block">
          Secure Identity Gateway
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell count={2} />
          
          {/* User avatar placeholder */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user.name || user.email}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-200">
        &copy; {new Date().getFullYear()} CredVerse Inc. All rights reserved.
      </footer>
    </div>
  );
}
