import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Blocks,
  ShieldCheck,
  Building2,
  Key,
  Boxes,
  Users,
  ShoppingCart,
  Truck,
  FileText,
  Banknote,
  UserSquare,
  Clock,
  Kanban,
  Bell,
  Coffee,
  ChefHat,
  LogOut,
  X,
  LayoutDashboard,
  User,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

function getContrastYIQ(hexcolor) {
  if (!hexcolor) return "white";
  hexcolor = hexcolor.replace("#", "");
  if (hexcolor.length === 3)
    hexcolor = hexcolor
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(hexcolor.substr(0, 2), 16) || 0;
  const g = parseInt(hexcolor.substr(2, 2), 16) || 0;
  const b = parseInt(hexcolor.substr(4, 2), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

const ICON_MAP = {
  module_registry: Blocks,
  auth: ShieldCheck,
  business_setup: Building2,
  permissions: Key,
  inventory: Boxes,
  customers: Users,
  sales_orders: ShoppingCart,
  suppliers: Truck,
  purchase_supplier: Truck,
  purchase_orders: FileText,
  invoicing_finance: Banknote,
  employee_hr: UserSquare,
  projects: Kanban,
  notifications: Bell,
  table_order_mgmt: Coffee,
  kitchen_kot: ChefHat,
  service_packages: Box,
  attendance: Clock,
};

export function SidebarEngine({ manifests, isOpen = true, setIsOpen }) {
  const { themeColor, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const CATEGORIES = [
    {
      title: "Hospitality & F&B",
      modules: ["table_order_mgmt", "kitchen_kot"],
    },
    {
      title: "Sales & CRM",
      modules: [
        "customers",
        "sales_orders",
        "invoicing_finance",
        "booking_scheduler",
      ],
    },
    {
      title: "Supply Chain",
      modules: ["inventory", "purchase_supplier", "barcode_catalog"],
    },
    {
      title: "Operations & HR",
      modules: ["employee_hr", "projects", "service_packages"],
    },
    {
      title: "Core Operations",
      modules: ["notifications"],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-[50] transition-opacity md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen && setIsOpen(false)}
      />
      <aside
        className={cn(
          "glass-panel border-r-0 h-full flex flex-col relative z-[60] transition-all duration-300 ease-in-out overflow-hidden shrink-0",
          "fixed md:relative top-0 left-0 bottom-0",
          isOpen ? "translate-x-0 w-[280px] md:w-64" : "-translate-x-full md:translate-x-0 md:w-20",
        )}
      >
        {/* Mobile Header in Sidebar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 shrink-0">
          <span className="font-bold text-lg tracking-tight">NexusERP</span>
          <button
            onClick={() => setIsOpen && setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {CATEGORIES.map((category) => {
          const catModules = manifests.filter((m) =>
            category.modules.includes(m.module_id),
          );
          if (catModules.length === 0) return null;

          return (
            <React.Fragment key={category.title}>
              {catModules
                .sort(
                  (a, b) =>
                    category.modules.indexOf(a.module_id) -
                    category.modules.indexOf(b.module_id),
                )
                .map((m) => {
                  const isActive = location.pathname.startsWith(
                    `/module/${m.module_id}`,
                  );
                  const Icon = ICON_MAP[m.module_id] || Box;
                  return (
                    <NavLink
                      key={m.module_id}
                      to={`/module/${m.module_id}`}
                      onClick={() => {
                        if (window.innerWidth < 768 && setIsOpen) setIsOpen(false);
                      }}
                      title={m.module_id
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      className={cn(
                        "flex items-center rounded-xl text-sm font-semibold transition-all duration-200",
                        isOpen
                          ? "px-4 py-2.5 gap-3"
                          : "justify-center py-2.5 px-0 mx-2",
                        isActive
                          ? "shadow-md shadow-black/30 scale-[1.02] translate-x-0"
                          : "text-muted-foreground hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-foreground hover:translate-x-1",
                      )}
                      style={
                        isActive
                          ? {
                              backgroundColor: themeColor,
                              color: getContrastYIQ(themeColor),
                            }
                          : {}
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {isOpen && (
                        <span className="truncate whitespace-nowrap animate-fade-in">
                          {m.module_id
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
            </React.Fragment>
          );
        })}

        {manifests.length === 0 && (
          <div className="text-sm text-muted-foreground px-3 py-2">
            No modules enabled
          </div>
        )}
      </nav>

      {/* Action Buttons at Bottom */}
      <div className="p-4 border-t border-border/40 mt-auto flex flex-col gap-2 shrink-0">
        
        {/* Mobile Admin Links */}
        <div className="md:hidden flex flex-col gap-2 mb-2 pb-2 border-b border-border/40">
           {role === "Admin" && (
             <>
               <NavLink
                 to="/"
                 onClick={() => setIsOpen && setIsOpen(false)}
                 className={cn(
                   "flex items-center text-sm font-semibold rounded-lg text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground",
                   isOpen ? "px-4 py-2.5 gap-3" : "justify-center py-2.5 px-0"
                 )}
               >
                 <LayoutDashboard className="w-5 h-5 shrink-0" />
                 {isOpen && <span>Dashboard</span>}
               </NavLink>
               <button
                 onClick={() => {
                   localStorage.setItem("openRegister", "true");
                   logout();
                 }}
                 className={cn(
                   "flex items-center text-sm font-semibold rounded-lg text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground",
                   isOpen ? "px-4 py-2.5 gap-3" : "justify-center py-2.5 px-0"
                 )}
               >
                 <Building2 className="w-5 h-5 shrink-0" />
                 {isOpen && <span>Build New OS</span>}
               </button>
             </>
           )}
           <NavLink
             to="/module/auth"
             onClick={() => setIsOpen && setIsOpen(false)}
             className={cn(
               "flex items-center text-sm font-semibold rounded-lg text-muted-foreground transition-all hover:bg-primary/10 hover:text-foreground",
               isOpen ? "px-4 py-2.5 gap-3" : "justify-center py-2.5 px-0"
             )}
           >
             <User className="w-5 h-5 shrink-0" />
             {isOpen && <span>Profile</span>}
           </NavLink>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className={cn(
            "flex items-center text-sm font-semibold rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all",
            isOpen ? "px-4 py-2 gap-2" : "justify-center py-2 px-0",
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
