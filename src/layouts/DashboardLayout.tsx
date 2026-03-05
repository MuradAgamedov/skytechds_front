import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { Outlet } from "react-router-dom"
import { useState } from "react"

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div style={{ flex: 1, overflow: "auto" }}>
          <Outlet />
        </div>

      </div>
    </div>
  )
}

export default DashboardLayout
