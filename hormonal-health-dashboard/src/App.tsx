import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { DigitalTwin } from './pages/DigitalTwin';
import { Recommendations } from './pages/Recommendations';
import { Sensors } from './pages/Sensors';
import { DoctorPanel } from './pages/DoctorPanel';
import { LoginPage } from './pages/LoginPage';
import { PatientList } from './pages/PatientList';
import { OnboardingPage } from './pages/OnboardingPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const AuthGuard = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { userRole, hasCompletedOnboarding } = useAuth();
  const location = useLocation();
  
  if (!userRole) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  
  // Redirect patients to onboarding if not completed
  if (userRole === 'patient' && !hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/onboarding" 
            element={
              <AuthGuard>
                <OnboardingPage />
              </AuthGuard>
            } 
          />
          
          <Route path="/" element={<AuthGuard><Navigation /></AuthGuard>}>
            <Route index element={<Dashboard />} />
            <Route path="digital-twin" element={<DigitalTwin />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="sensors" element={<Sensors />} />
            
            {/* Doctor Specific Directory */}
            <Route path="patients" element={<AuthGuard allowedRoles={['doctor']}><PatientList /></AuthGuard>} />
            
            <Route path="doctor" element={<DoctorPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
