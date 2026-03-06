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
import DictionariesIndex from "./pages/dictionaries/Index"
import DictionaryCreate from "./pages/dictionaries/Create"
import DictionaryUpdate from "./pages/dictionaries/Update"
import TranslationsIndex from "./pages/translations/Index"
import TranslationCreate from "./pages/translations/Create"
import TranslationUpdate from "./pages/translations/Update"
import AboutUpdate from "./pages/about/Update"
import BlogCategoriesIndex from "./pages/blog-categories/Index"
import BlogCategoryCreate from "./pages/blog-categories/Create"
import BlogCategoryUpdate from "./pages/blog-categories/Update"
import BlogsIndex from "./pages/blogs/Index"
import BlogCreate from "./pages/blogs/Create"
import BlogUpdate from "./pages/blogs/Update"
import TagsIndex from "./pages/tags/Index"
import TagCreate from "./pages/tags/Create"
import TagUpdate from "./pages/tags/Update"
import ServicesIndex from "./pages/services/Index"
import ServiceCreate from "./pages/services/Create"
import ServiceUpdate from "./pages/services/Update"
import PortfolioIndex from "./pages/portfolios/Index"
import PortfolioCreate from "./pages/portfolios/Create"
import PortfolioUpdate from "./pages/portfolios/Update"
import FaqIndex from "./pages/faqs/Index"
import FaqCreate from "./pages/faqs/Create"
import FaqUpdate from "./pages/faqs/Update"
import StatisticIndex from "./pages/statistics/Index"
import StatisticCreate from "./pages/statistics/Create"
import StatisticUpdate from "./pages/statistics/Update"
// Testimonials
import TestimonialsIndex from "./pages/testimonials/Index"
import TestimonialCreate from "./pages/testimonials/Create"
import TestimonialUpdate from "./pages/testimonials/Update"

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
          <Route path="dictionaries" element={<DictionariesIndex />} />
          <Route path="dictionaries/create" element={<DictionaryCreate />} />
          <Route path="dictionaries/update/:id" element={<DictionaryUpdate />} />
          <Route path="translations" element={<TranslationsIndex />} />
          <Route path="translations/create" element={<TranslationCreate />} />
          <Route path="translations/update/:id" element={<TranslationUpdate />} />
          <Route path="about" element={<AboutUpdate />} />
          <Route path="blog-categories" element={<BlogCategoriesIndex />} />
          <Route path="blog-categories/create" element={<BlogCategoryCreate />} />
          <Route path="blog-categories/update/:id" element={<BlogCategoryUpdate />} />
          <Route path="blogs" element={<BlogsIndex />} />
          <Route path="blogs/create" element={<BlogCreate />} />
          <Route path="blogs/update/:id" element={<BlogUpdate />} />
          <Route path="tags" element={<TagsIndex />} />
          <Route path="tags/create" element={<TagCreate />} />
          <Route path="tags/update/:id" element={<TagUpdate />} />
          <Route path="services" element={<ServicesIndex />} />
          <Route path="services/create" element={<ServiceCreate />} />
          <Route path="services/update/:id" element={<ServiceUpdate />} />
          <Route path="portfolios" element={<PortfolioIndex />} />
          <Route path="portfolios/create" element={<PortfolioCreate />} />
          <Route path="portfolios/:id/edit" element={<PortfolioUpdate />} />
          <Route path="testimonials" element={<TestimonialsIndex />} />
          <Route path="testimonials/create" element={<TestimonialCreate />} />
          <Route path="testimonials/:id/edit" element={<TestimonialUpdate />} />
          <Route path="faqs" element={<FaqIndex />} />
          <Route path="faqs/create" element={<FaqCreate />} />
          <Route path="faqs/:id/edit" element={<FaqUpdate />} />
          <Route path="statistics" element={<StatisticIndex />} />
          <Route path="statistics/create" element={<StatisticCreate />} />
          <Route path="statistics/:id/edit" element={<StatisticUpdate />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App