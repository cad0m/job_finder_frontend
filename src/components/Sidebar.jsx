import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Search', icon: 'search', path: '/search' },
    { name: 'Upload', icon: 'upload_file', path: '/upload' },
    { name: 'Saved', icon: 'bookmark', path: '/saved' },
    { name: 'Applied', icon: 'send', path: '/applied' },
    { name: 'Profile', icon: 'account_circle', path: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-60 z-40 bg-[#04151e] border-r border-white/5 flex flex-col py-8 px-0">
      <Link to="/dashboard" className="mb-10 px-6 text-white block group">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="JobMatcher AI" className="w-6 h-6 object-contain group-hover:scale-105 transition-transform duration-300" />
          <h1 className="text-xl font-bold font-space tracking-tight leading-none group-hover:text-primary transition-colors">JobMatcher AI</h1>
        </div>
        <p className="text-[9px] text-[#1D8EFF] tracking-[0.2em] uppercase mt-1 font-bold font-space">Intelligence Engine</p>
      </Link>

      <nav className="flex-1 px-0 space-y-0.5">
        {menuItems.map((item) => {
          const isActivePath = location.pathname === item.path;
          const isRelatedActive = (item.name === 'Dashboard' && (location.pathname.startsWith('/job-details') || location.pathname.startsWith('/apply')));

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={() =>
                `flex items-center gap-4 px-6 py-3.5 transition-all text-sm font-medium font-space ${isActivePath || isRelatedActive
                  ? 'bg-gradient-to-r from-[#1D8EFF]/10 to-transparent border-l-2 border-[#1D8EFF] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {() => (
                <>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: (isActivePath || isRelatedActive) ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-6 space-y-6">
        <button className="w-full bg-gradient-to-r from-[#89b4ff] to-[#1D8EFF] text-[#002a54] py-3 rounded-lg font-bold text-sm tracking-tight shadow-[0_4px_12px_rgba(29,142,255,0.25)] hover:brightness-110 active:scale-[0.98] transition-all">
          Open to Work
        </button>

        <div className="space-y-1 pb-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-2 text-slate-400 hover:text-white transition-colors text-xs font-medium font-space text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span> Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
