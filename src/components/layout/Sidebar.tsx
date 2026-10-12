import React from 'react';
import { NavLink } from 'react-router-dom';
import { Pill, ShieldAlert, FileText, LayoutDashboard, ScanLine, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export interface SidebarProps {
  onScanClick: () => void;
  onAddMedicationClick: () => void;
  onAuthClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onScanClick,
  onAddMedicationClick,
  onAuthClick,
}) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/medications', label: 'Medications', icon: Pill },
    { to: '/allergies', label: 'Allergies', icon: ShieldAlert },
    { to: '/health-card', label: 'Health Card', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 no-print hidden md:flex">
      <div>
        {/* App Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">DawaCard Lite</h1>
            <span className="text-[11px] font-medium px-1.5 py-0.2 rounded-md bg-emerald-50 text-[#0F766E] border border-emerald-200">
              v1.0 MVP
            </span>
          </div>
        </div>

        {/* Action Quick Launchers */}
        <div className="p-4 space-y-2">
          <button
            onClick={onAddMedicationClick}
            className="w-full flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Pill className="w-4 h-4" />
            <span>Add Medication</span>
          </button>

          <button
            onClick={onScanClick}
            className="w-full flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan Prescription (AI)</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-[#0F766E] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with User Profile / Login */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {user ? (
          <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <span className="font-semibold text-slate-800 text-xs block truncate">
                  {user.user_metadata?.display_name || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={signOut}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAuthClick}
            className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Sign In / Sign Up</span>
          </button>
        )}

        <div className="text-[11px] text-slate-400 leading-tight">
          DawaCard Lite • Cloud Database with Supabase
        </div>
      </div>
    </aside>
  );
};
