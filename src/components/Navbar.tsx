import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Home, Trophy, MessageCircle, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Las HueQuitas</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-orange-100 text-orange-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              to="/ranking"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/ranking')
                  ? 'bg-orange-100 text-orange-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="hidden sm:inline">Top Rated</span>
            </Link>

            <Link
              to="/chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive('/chat')
                  ? 'bg-orange-100 text-orange-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Chat</span>
            </Link>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/profile')
                    ? 'bg-orange-100 text-orange-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Mi Perfil"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
