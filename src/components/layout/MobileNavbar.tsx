import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Pill, ShieldAlert, FileText, LayoutDashboard, Menu, X, ScanLine, Plus } from 'lucide-react';

export interface MobileNavbarProps {
  onScanClick: () => void;
  onAddMedicationClick: () => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ onScanClick, onAddMedicationClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/medications', label: 'Medications', icon: Pill },
    { to: '/allergies', label: 'Allergies', icon: ShieldAlert },
    { to: '/health-card', label: 'Health Card', icon: FileText },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 md:hidden no-print">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white">
            <Pill className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-base">DawaCard Lite</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddMedicationClick}
            className="bg-[#0F766E] text-white p-2 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            aria-label="Add Medication"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 bg-white p-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddMedicationClick();
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-[#0F766E] text-white px-3 py-2 rounded-lg text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Med</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onScanClick();
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-teal-50 text-[#0F766E] border border-teal-200 px-3 py-2 rounded-lg text-xs font-semibold"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Prescription</span>
            </button>
          </div>

          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-[#0F766E] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
