'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, createWebSocket } from '@/lib/api';

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { path: '/products', label: 'Produits', icon: '📦' },
  { path: '/orders', label: 'Commandes', icon: '📋' },
  { path: '/customers', label: 'Clients', icon: '👥' },
  { path: '/delivery', label: 'Livraisons', icon: '🚚' },
  { path: '/settings', label: 'Paramètres', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    api.getProfile().then((res) => {
      const user = res.data as { name: string };
      setUserName(user.name);
    }).catch(() => {
      api.setToken(null);
      router.push('/login');
    });

    api.getNotifications({ unreadOnly: 'true', limit: 1 }).then((res) => {
      setUnreadNotifications(res.meta.unreadCount);
    });

    const ws = createWebSocket(token);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_ORDER' || data.type === 'NOTIFICATION') {
        setUnreadNotifications((prev) => prev + 1);
      }
    };
    return () => ws.close();
  }, [router]);

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  const initials = userName ? userName.charAt(0).toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-ice flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-forest/20 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-forest to-forest-light
        transform transition-all duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isSidebarOpen ? 'translate-x-0 shadow-sidebar' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center shadow-lg shadow-black/20">
              <svg className="w-4 h-4 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight">Plateforme</p>
              <p className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Vente Intelligente</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-3 space-y-0.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.path);
                  setIsSidebarOpen(false);
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.path === '/orders' && unreadNotifications > 0 && (
                  <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-gold text-[10px] font-bold text-forest">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3.5 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold/70 flex items-center justify-center text-sm font-bold text-forest shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName || 'Vendeur'}</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-gold transition-colors p-1" title="Déconnexion">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:pl-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-sage/20 h-16 flex items-center px-4 lg:px-6">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-forest/40 hover:text-forest mr-3 p-2 -ml-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <button
            onClick={async () => {
              await api.markAllNotificationsRead();
              setUnreadNotifications(0);
            }}
            className="relative p-2 text-forest/40 hover:text-forest hover:bg-forest/5 rounded-xl transition-all duration-200"
            title="Notifications"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-gold text-[10px] font-bold text-forest flex items-center justify-center shadow-sm">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}