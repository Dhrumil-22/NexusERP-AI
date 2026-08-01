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

export function SidebarEngine({ manifests, isOpen = true }) {
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
    <aside
      className={cn(
        "glass-panel border-r-0 h-full flex flex-col pt-6 relative z-40 transition-all duration-300 ease-in-out overflow-hidden shrink-0",
        isOpen ? "w-64" : "w-20",
      )}
    >
      <nav className="flex-1 overflow-y-auto px-3 space-y-2">
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
  );
}
