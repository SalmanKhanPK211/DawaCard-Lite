import React from 'react';
import { Sun, CloudSun, Moon, BedDouble, Zap, Pill } from 'lucide-react';
import { Medication, TimeOfDay } from '../../types/medication';

export interface DailyScheduleGridProps {
  medications: Medication[];
  title?: string;
  className?: string;
}

export const DailyScheduleGrid: React.FC<DailyScheduleGridProps> = ({
  medications,
  title = 'Daily Pill Schedule (4-Box Organizer View)',
  className = '',
}) => {
  const currentMeds = medications.filter((m) => m.status === 'current');

  const getMedsForTime = (time: TimeOfDay) => {
    return currentMeds.filter((m) => m.timesOfDay?.includes(time));
  };

  // Check if any medication has no timeOfDay set at all
  const unassignedMeds = currentMeds.filter(
    (m) => !m.timesOfDay || m.timesOfDay.length === 0
  );

  const morningMeds = getMedsForTime('morning');
  const afternoonMeds = getMedsForTime('afternoon');
  const eveningMeds = getMedsForTime('evening');
  const bedtimeMeds = getMedsForTime('bedtime');
  const asNeededMeds = getMedsForTime('as_needed');

  const timeSlots = [
    {
      id: 'morning' as TimeOfDay,
      label: 'Morning',
      timeRange: '6:00 AM – 11:00 AM',
      icon: Sun,
      headerBg: 'bg-amber-100 text-amber-900 border-amber-300',
      iconColor: 'text-amber-600',
      boxBg: 'bg-amber-50/30',
      meds: morningMeds,
    },
    {
      id: 'afternoon' as TimeOfDay,
      label: 'Afternoon',
      timeRange: '11:00 AM – 4:00 PM',
      icon: CloudSun,
      headerBg: 'bg-sky-100 text-sky-900 border-sky-300',
      iconColor: 'text-sky-600',
      boxBg: 'bg-sky-50/30',
      meds: afternoonMeds,
    },
    {
      id: 'evening' as TimeOfDay,
      label: 'Evening',
      timeRange: '4:00 PM – 9:00 PM',
      icon: Moon,
      headerBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      iconColor: 'text-indigo-600',
      boxBg: 'bg-indigo-50/30',
      meds: eveningMeds,
    },
    {
      id: 'bedtime' as TimeOfDay,
      label: 'Bedtime',
      timeRange: '9:00 PM – Sleep',
      icon: BedDouble,
      headerBg: 'bg-purple-100 text-purple-900 border-purple-300',
      iconColor: 'text-purple-600',
      boxBg: 'bg-purple-50/30',
      meds: bedtimeMeds,
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#0F766E] flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500">
                Organized to match 4-slot physical pillbox organizers
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium no-print">
            {currentMeds.length} Active Med{currentMeds.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* 4-Column Organizer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {timeSlots.map((slot) => {
          const Icon = slot.icon;
          return (
            <div
              key={slot.id}
              className={`border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between ${slot.boxBg} shadow-xs`}
            >
              {/* Slot Header */}
              <div
                className={`p-3 border-b flex items-center justify-between font-bold text-xs ${slot.headerBg}`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${slot.iconColor}`} />
                  <span className="uppercase tracking-wider">{slot.label}</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">
                  {slot.meds.length} pill{slot.meds.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Slot Medications Body */}
              <div className="p-3 flex-1 space-y-2">
                {slot.meds.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    None scheduled
                  </p>
                ) : (
                  slot.meds.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1 text-xs"
                    >
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{m.name}</span>
                        {m.strength && (
                          <span className="text-slate-500 font-medium text-[11px]">
                            {m.strength}
                          </span>
                        )}
                      </div>

                      {m.dosageForm && (
                        <span className="text-[11px] text-slate-500 block">
                          Form: {m.dosageForm}
                        </span>
                      )}

                      {m.prescribedInstructions && (
                        <p className="text-[11px] text-slate-700 bg-slate-50 p-1.5 rounded font-medium border border-slate-100">
                          {m.prescribedInstructions}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* As-Needed / PRN Bar */}
      {asNeededMeds.length > 0 && (
        <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Take As Needed (PRN / Rescue / Pain)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {asNeededMeds.map((m) => (
              <div
                key={m.id}
                className="bg-white p-2.5 rounded-lg border border-amber-100 text-xs space-y-0.5"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{m.name}</span>
                  {m.strength && <span className="text-slate-500 text-[11px]">{m.strength}</span>}
                </div>
                {m.prescribedInstructions && (
                  <p className="text-[11px] text-slate-600 italic">
                    "{m.prescribedInstructions}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unassigned note if any meds don't have timesOfDay */}
      {unassignedMeds.length > 0 && (
        <p className="text-[11px] text-slate-500 italic no-print">
          Note: {unassignedMeds.length} medication(s) do not have a designated pillbox time of day. Edit them to assign Morning, Afternoon, Evening, Bedtime, or As-Needed.
        </p>
      )}
    </div>
  );
};
