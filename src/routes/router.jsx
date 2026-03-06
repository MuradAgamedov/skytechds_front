import { Routes, Route } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"
import Dashboard from "../pages/Dashboard"

// Testimonials
import TestimonialsIndex from "../pages/testimonials/Index"
import TestimonialCreate from "../pages/testimonials/Create"
import TestimonialUpdate from "../pages/testimonials/Update"


function Router() {
  return (
    <Routes>

      <Route element={<DashboardLayout />}>

        <Route path="/" element={<Dashboard />} />
        
        {/* Testimonials Routes */}
        <Route path="/testimonials" element={<TestimonialsIndex />} />
        <Route path="/testimonials/create" element={<TestimonialCreate />} />
        <Route path="/testimonials/:id/edit" element={<TestimonialUpdate />} />


      </Route>

    </Routes>
  )
}

export default Router