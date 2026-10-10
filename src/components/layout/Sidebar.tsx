import React from 'react';
import { NavLink } from 'react-router-dom';
import { Pill, ShieldAlert, FileText, LayoutDashboard, User, ScanLine } from 'lucide-react';

export interface SidebarProps {
  onScanClick: () => void;
  onAddMedicationClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onScanClick, onAddMedicationClick }) => {
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

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">Privacy & Local First</p>
        <p className="text-[11px] leading-normal text-slate-500">
          No cloud DB. Information stays in your browser IndexedDB.
        </p>
      </div>
    </aside>
  );
};
