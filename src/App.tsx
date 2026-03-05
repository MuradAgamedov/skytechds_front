import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import DashboardLayout from "./layouts/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import LanguagesIndex from "./pages/languages/Index"
import LanguageCreate from "./pages/languages/Create"
import LanguageUpdate from "./pages/languages/Update"
import PhonesIndex from "./pages/phones/Index"
import PhoneCreate from "./pages/phones/Create"
import PhoneUpdate from "./pages/phones/Update"
import EmailsIndex from "./pages/emails/Index"
import EmailCreate from "./pages/emails/Create"
import EmailUpdate from "./pages/emails/Update"
import MapsIndex from "./pages/maps/Index"
import MapCreate from "./pages/maps/Create"
import MapUpdate from "./pages/maps/Update"
import AddressesIndex from "./pages/addresses/Index"
import AddressCreate from "./pages/addresses/Create"
import AddressUpdate from "./pages/addresses/Update"
import SocialNetworksIndex from "./pages/social-networks/Index"
import SocialNetworkCreate from "./pages/social-networks/Create"
import SocialNetworkUpdate from "./pages/social-networks/Update"
import ContactMessagesIndex from "./pages/contact-messages/Index"
import Login from "./pages/Login"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="languages" element={<LanguagesIndex />} />
          <Route path="languages/create" element={<LanguageCreate />} />
          <Route path="languages/update/:id" element={<LanguageUpdate />} />
          <Route path="phones" element={<PhonesIndex />} />
          <Route path="phones/create" element={<PhoneCreate />} />
          <Route path="phones/update/:id" element={<PhoneUpdate />} />
          <Route path="emails" element={<EmailsIndex />} />
          <Route path="emails/create" element={<EmailCreate />} />
          <Route path="emails/update/:id" element={<EmailUpdate />} />
          <Route path="maps" element={<MapsIndex />} />
          <Route path="maps/create" element={<MapCreate />} />
          <Route path="maps/update/:id" element={<MapUpdate />} />
          <Route path="addresses" element={<AddressesIndex />} />
          <Route path="addresses/create" element={<AddressCreate />} />
          <Route path="addresses/update/:id" element={<AddressUpdate />} />
          <Route path="social-networks" element={<SocialNetworksIndex />} />
          <Route path="social-networks/create" element={<SocialNetworkCreate />} />
          <Route path="social-networks/update/:id" element={<SocialNetworkUpdate />} />
          <Route path="contact-messages" element={<ContactMessagesIndex />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App