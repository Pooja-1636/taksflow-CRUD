import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, Menu, X, CheckSquare } from 'lucide-react';
import { Button } from './Common';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <CheckSquare className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  <item.icon className={`${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'} mr-3 flex-shrink-0 h-6 w-6`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="inline-block h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                 {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center mt-1"
                >
                  <LogOut className="h-3 w-3 mr-1" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="pt-5 pb-4 px-4">
              <div className="flex-shrink-0 flex items-center mb-6">
                <CheckSquare className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <item.icon className="mr-4 h-6 w-6 text-gray-400" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3">
                  <Button variant="secondary" onClick={handleLogout} className="w-full justify-center">
                     <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0 w-full transition-all duration-300">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};