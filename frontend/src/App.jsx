import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarEngine } from "./components/SidebarEngine";
import { TopNavbar } from "./components/TopNavbar";
import { DashboardEngine } from "./components/DashboardEngine";
import { RootDashboard } from "./components/RootDashboard";
import { SuperAdminDashboard } from "./components/SuperAdminDashboard";
import { CheckCircle } from "lucide-react";
import { FormEngine } from "./components/FormEngine";
import { InventoryDashboard } from "./components/InventoryDashboard";
import { CustomersDashboard } from "./components/CustomersDashboard";
import { AttendanceDashboard } from "./components/AttendanceDashboard";
import { SecurityDashboard } from "./components/SecurityDashboard";
import { BarcodeCatalogDashboard } from "./components/BarcodeCatalogDashboard";
import { BookingDashboard } from "./components/BookingDashboard";
import { PermissionsDashboard } from "./components/PermissionsDashboard";
import { NotificationsDashboard } from "./components/NotificationsDashboard";
import { TableOrderDashboard } from "./components/TableOrderDashboard";
import { KitchenKOTDashboard } from "./components/KitchenKOTDashboard";
import { EmployeeHRDashboard } from "./components/EmployeeHRDashboard";
import { ProjectsDashboard } from "./components/ProjectsDashboard";
import { PurchaseSupplierDashboard } from "./components/PurchaseSupplierDashboard";
import { SalesOrdersDashboard } from "./components/SalesOrdersDashboard";
import { InvoicingFinanceDashboard } from "./components/InvoicingFinanceDashboard";
import { ServicePackagesDashboard } from "./components/ServicePackagesDashboard";
import { CustomerCareDashboard } from "./components/CustomerCareDashboard";
import { useModuleManifests } from "./hooks/useModuleManifests";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { HeroPage } from "./components/HeroPage";
import { Login } from "./components/Login";
import { AIBusinessSetup } from "./components/AIBusinessSetup";

const queryClient = new QueryClient();

import { useCurrentUser } from "./hooks/useCurrentUser";

function Layout() {
  const { token, businessId, themeColor, themeMode, role, businessName } =
    useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    data: manifests,
    isLoading,
    isFetching,
    error,
  } = useModuleManifests(businessId, token);
  const { data: currentUser } = useCurrentUser(token);

  if (isLoading || isFetching)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading OS...
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading modules
      </div>
    );
  if (!manifests) return null;
  if (manifests.length === 0 && role === "Admin" && businessName !== "Nexus AI Admin") {
    // If Admin user has 0 enabled modules, force them to the AI Setup screen
    return <Navigate to="/setup" replace />;
  }

  // Filter modules based on role
  // As requested, all modules are synced between owner and staff
  let visibleManifests = manifests;

  const functionalManifests = visibleManifests.filter(
    (m) =>
      !["auth", "business_setup", "module_registry", "permissions"].includes(
        m.module_id,
      ),
  );

  // Determine if employee uses top navbar or sidebar for modules
  const isEmployee = role !== "Admin";
  const showSidebar = !isEmployee || functionalManifests.length > 3;

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-background">
      {/* Background Ambient Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] ${themeMode === "light" ? "opacity-10" : "opacity-20"}`}
          style={{ backgroundColor: themeColor }}
        />

        <div
          className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] ${themeMode === "light" ? "opacity-10" : "opacity-20"}`}
          style={{
            backgroundColor: themeColor,
            filter: "hue-rotate(30deg) blur(120px)",
          }}
        />
      </div>

      <TopNavbar
        toggleSidebar={
          showSidebar ? () => setIsSidebarOpen(!isSidebarOpen) : undefined
        }
        manifests={functionalManifests}
        showSidebar={showSidebar}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {showSidebar && (
          <SidebarEngine manifests={visibleManifests} isOpen={isSidebarOpen} />
        )}
        <main className="flex-1 overflow-y-auto flex flex-col relative">
          <div className="flex-1 shrink-0">
            <Routes>
              <Route
                path="/"
                element={
                  businessName === "Nexus AI Admin" ? (
                    <SuperAdminDashboard />
                  ) : role === "Staff" ? (
                    <Navigate to="/module/attendance" replace />
                  ) : (
                    <RootDashboard />
                  )
                }
              />
              <Route
                path="/module/:moduleId"
                element={
                  <ModuleView manifests={visibleManifests} token={token} />
                }
              />
            </Routes>
          </div>
          <footer className="w-full p-4 mt-auto border-t border-border/20 text-center text-xs font-semibold text-muted-foreground/60 shrink-0">
            {businessName === "Nexus AI Admin"
              ? "© 2026 NexusERP AI. All rights reserved."
              : "Powered by NexusERP AI"}
          </footer>
        </main>
      </div>
    </div>
  );
}

function ModuleView({ manifests, token }) {
  const { moduleId } = useParams();
  const manifest = manifests.find((m) => m.module_id === moduleId);

  if (
    !manifest &&
    !["auth", "attendance", "notifications", "customer_care"].includes(moduleId)
  ) {
    return (
      <div className="p-8 text-destructive border rounded m-8 bg-destructive/10">
        Module not found or not enabled.
      </div>
    );
  }

  if (moduleId === "business_setup") {
    return <Navigate to="/module/auth" replace />;
  }

  if (moduleId === "inventory") {
    return <InventoryDashboard />;
  }

  if (moduleId === "customers") {
    return <CustomersDashboard />;
  }

  if (moduleId === "auth") {
    return <SecurityDashboard />;
  }

  if (moduleId === "barcode_catalog") {
    return <BarcodeCatalogDashboard />;
  }

  if (moduleId === "booking_scheduler") {
    return <BookingDashboard />;
  }

  if (moduleId === "permissions") {
    return <PermissionsDashboard />;
  }

  if (moduleId === "notifications") {
    return <NotificationsDashboard />;
  }

  if (moduleId === "table_order_mgmt") {
    return <TableOrderDashboard />;
  }

  if (moduleId === "kitchen_kot") {
    return <KitchenKOTDashboard />;
  }

  if (moduleId === "employee_hr") {
    return <EmployeeHRDashboard />;
  }

  if (moduleId === "projects") {
    return <ProjectsDashboard />;
  }

  if (moduleId === "purchase_supplier") {
    return <PurchaseSupplierDashboard />;
  }

  if (moduleId === "sales_orders") {
    return <SalesOrdersDashboard />;
  }

  if (moduleId === "invoicing_finance") {
    return <InvoicingFinanceDashboard />;
  }

  if (moduleId === "service_packages") {
    return <ServicePackagesDashboard />;
  }

  if (moduleId === "attendance") {
    return <AttendanceDashboard />;
  }

  if (moduleId === "customer_care") {
    return <CustomerCareDashboard />;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {(manifest?.module_id || moduleId)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
          Dashboard
        </h1>
        {manifest && (
          <p className="text-muted-foreground">Version {manifest.version}</p>
        )}
      </div>

      {manifest && <DashboardEngine manifest={manifest} />}

      {manifest && manifest.forms && manifest.forms.length > 0 && (
        <div className="flex flex-col gap-8 pt-4 max-w-5xl mx-auto">
          {manifest.forms.map((f) => (
            <FormEngine
              key={f.form_id}
              manifest={manifest}
              formId={f.form_id}
              token={token}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GlobalStatusModal() {
  const { statusMessage, setStatusMessage } = useAuth();
  if (!statusMessage) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border/50 overflow-hidden text-center p-8">
        {statusMessage.type === "success" ? (
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#22c55e" }} />
        ) : (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-4 border-red-500 text-red-500">
            <span className="font-bold text-2xl">!</span>
          </div>
        )}
        <h2 className="text-xl font-bold mb-2">{statusMessage.title}</h2>
        <p className="text-muted-foreground mb-6">{statusMessage.message}</p>
        <button
          onClick={() => setStatusMessage(null)}
          className="w-full py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: statusMessage.type === "success" ? "#22c55e" : "#ef4444" }}
        >
          Okay
        </button>
      </div>
    </div>
  );
}

function AuthWrapper() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/" element={<HeroPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalStatusModal />
      </>
    );
  }
  return (
    <>
      <Routes>
        <Route path="/setup" element={<AIBusinessSetup />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
      <GlobalStatusModal />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuthWrapper />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
