import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNavbar } from './components/layout/MobileNavbar';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { MedicationListPage } from './features/medications/MedicationListPage';
import { AllergyPage } from './features/allergies/AllergyPage';
import { HealthCardPage } from './features/health-card/HealthCardPage';
import { MedicationModal } from './features/medications/MedicationModal';
import { PrescriptionReaderModal } from './features/prescription-reader/PrescriptionReaderModal';
import { EmergencyViewerModal } from './features/health-card/EmergencyViewerModal';
import { AuthModal } from './features/auth/AuthModal';
import { AuthProvider } from './contexts/AuthContext';
import { decodeEmergencyPayload, EmergencyDataPayload } from './utils/qrPayload';
import { Medication } from './types/medication';

export const AppContent: React.FC = () => {
  // Global modal triggers
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [emergencyPayload, setEmergencyPayload] = useState<EmergencyDataPayload | null>(null);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.includes('#emergency?data=')) {
        const encoded = hash.split('#emergency?data=')[1];
        if (encoded) {
          const payload = decodeEmergencyPayload(encoded);
          if (payload) {
            setEmergencyPayload(payload);
          }
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleOpenAddMedication = () => {
    setMedicationToEdit(null);
    setIsMedicationModalOpen(true);
  };

  const handleOpenEditMedication = (med: Medication) => {
    setMedicationToEdit(med);
    setIsMedicationModalOpen(true);
  };

  const handleOpenScan = () => {
    setIsScanModalOpen(true);
  };

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleMedicationSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Mobile Navbar */}
      <MobileNavbar
        onAddMedicationClick={handleOpenAddMedication}
        onScanClick={handleOpenScan}
        onAuthClick={handleOpenAuth}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        onAddMedicationClick={handleOpenAddMedication}
        onScanClick={handleOpenScan}
        onAuthClick={handleOpenAuth}
      />

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                key={refreshKey}
                onAddMedicationClick={handleOpenAddMedication}
                onScanClick={handleOpenScan}
              />
            }
          />
          <Route
            path="/medications"
            element={
              <MedicationListPage
                key={refreshKey}
                onAddMedicationClick={handleOpenAddMedication}
                onScanClick={handleOpenScan}
                onEditMedicationClick={handleOpenEditMedication}
              />
            }
          />
          <Route path="/allergies" element={<AllergyPage key={refreshKey} />} />
          <Route path="/health-card" element={<HealthCardPage key={refreshKey} />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <MedicationModal
        isOpen={isMedicationModalOpen}
        onClose={() => setIsMedicationModalOpen(false)}
        medicationToEdit={medicationToEdit}
        onSaved={handleMedicationSaved}
      />

      <PrescriptionReaderModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onMedicationSaved={handleMedicationSaved}
      />

      {emergencyPayload && (
        <EmergencyViewerModal
          payload={emergencyPayload}
          onClose={() => {
            setEmergencyPayload(null);
            window.location.hash = '';
          }}
        />
      )}

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
