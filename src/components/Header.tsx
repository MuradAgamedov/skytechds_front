'use client';

import { Menu, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowDropdown(false);
  };

  return (
    <header className="border-b border-border bg-card h-16 flex items-center justify-between px-6">
      <div style={{ marginLeft: '20px' }} className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
       
      </div>

      {/* Right side - User Dropdown */}
      <div className="flex items-center gap-4">
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-border">
                <p className="font-medium text-sm">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
              </div>
              
              <div className="py-2">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2 text-red-500"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
