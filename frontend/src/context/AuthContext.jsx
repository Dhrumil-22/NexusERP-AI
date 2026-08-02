import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(undefined);

// Helper to convert HEX to HSL values and calculate luminance
const hexToHSLValues = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Calculate perceived luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    isLight: luminance > 0.5,
  };
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [businessId, setBusinessId] = useState(
    localStorage.getItem("businessId"),
  );
  const [businessName, setBusinessName] = useState(
    localStorage.getItem("businessName"),
  );
  const [businessAddress, setBusinessAddress] = useState(
    localStorage.getItem("businessAddress"),
  );
  const [businessOwnerName, setBusinessOwnerName] = useState(
    localStorage.getItem("businessOwnerName"),
  );
  const [logoUrl, setLogoUrl] = useState(
    localStorage.getItem("logoUrl") || "/logo.png",
  );
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem("themeColor") || "#3b82f6",
  );
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("themeMode") || "light",
  );
  const [role, setRole] = useState(localStorage.getItem("role"));

  // Global Status Modal State
  const [statusMessage, setStatusMessage] = useState(null);
  
  const showStatus = (title, message, type) => {
    setStatusMessage({ title, message, type });
  };

  // Apply theme to document
  React.useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  // Apply dynamic color palette to document
  React.useEffect(() => {
    if (themeColor && themeColor.startsWith("#")) {
      try {
        const { h, s, l, isLight } = hexToHSLValues(themeColor);
        const root = document.documentElement;
        // Primary and Accents
        const primaryHsl = `${h} ${s}% ${l}%`;
        const primaryForegroundHsl = isLight
          ? `${h} ${Math.min(s, 50)}% 10%`
          : `0 0% 100%`; // Dark text if light bg, White text if dark bg
        root.style.setProperty("--primary", primaryHsl);
        root.style.setProperty("--primary-foreground", primaryForegroundHsl);
        root.style.setProperty("--ring", primaryHsl);
        root.style.setProperty("--accent", primaryHsl);
        // Dynamic Palette based on theme mode
        if (themeMode === "light") {
          root.style.setProperty(
            "--background",
            `${h} ${Math.min(s, 30)}% 98%`,
          );
          root.style.setProperty(
            "--foreground",
            `${h} ${Math.min(s, 50)}% 10%`,
          );
          root.style.setProperty("--card", `${h} ${Math.min(s, 20)}% 100%`);
          root.style.setProperty(
            "--card-foreground",
            `${h} ${Math.min(s, 50)}% 10%`,
          );
          root.style.setProperty("--popover", `${h} ${Math.min(s, 20)}% 100%`);
          root.style.setProperty(
            "--popover-foreground",
            `${h} ${Math.min(s, 50)}% 10%`,
          );
          root.style.setProperty("--muted", `${h} ${Math.min(s, 30)}% 92%`);
          root.style.setProperty(
            "--muted-foreground",
            `${h} ${Math.min(s, 30)}% 40%`,
          );
          root.style.setProperty("--border", `${h} ${Math.min(s, 30)}% 90%`);
          root.style.setProperty("--input", `${h} ${Math.min(s, 30)}% 90%`);
          root.style.setProperty(
            "--body-bg",
            `hsl(${h}, ${Math.min(s, 30)}%, 98%)`,
          );
          root.style.setProperty(
            "--body-text",
            `hsl(${h}, ${Math.min(s, 50)}%, 10%)`,
          );
        } else {
          // Dark Mode Palette
          root.style.setProperty("--background", `${h} ${Math.min(s, 40)}% 6%`);
          root.style.setProperty(
            "--foreground",
            `${h} ${Math.min(s, 20)}% 96%`,
          );
          root.style.setProperty("--card", `${h} ${Math.min(s, 30)}% 10%`);
          root.style.setProperty(
            "--card-foreground",
            `${h} ${Math.min(s, 20)}% 96%`,
          );
          root.style.setProperty("--popover", `${h} ${Math.min(s, 30)}% 10%`);
          root.style.setProperty(
            "--popover-foreground",
            `${h} ${Math.min(s, 20)}% 96%`,
          );
          root.style.setProperty("--muted", `${h} ${Math.min(s, 30)}% 16%`);
          root.style.setProperty(
            "--muted-foreground",
            `${h} ${Math.min(s, 20)}% 70%`,
          );
          root.style.setProperty("--border", `${h} ${Math.min(s, 30)}% 16%`);
          root.style.setProperty("--input", `${h} ${Math.min(s, 30)}% 16%`);
          root.style.setProperty(
            "--body-bg",
            `hsl(${h}, ${Math.min(s, 40)}%, 6%)`,
          );
          root.style.setProperty(
            "--body-text",
            `hsl(${h}, ${Math.min(s, 20)}%, 96%)`,
          );
        }
      } catch (e) {
        console.error("Failed to parse theme color", e);
      }
    }
  }, [themeColor, themeMode]);

  const toggleThemeMode = () => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  const login = (
    newToken,
    newBusinessId,
    newBusinessName,
    newLogoUrl,
    newTheme,
    newRole,
    newAddress,
    newOwnerName,
  ) => {
    setToken(newToken);
    setBusinessId(newBusinessId);
    localStorage.setItem("token", newToken);
    localStorage.setItem("businessId", newBusinessId);
    if (newBusinessName) {
      setBusinessName(newBusinessName);
      localStorage.setItem("businessName", newBusinessName);
    }
    if (newAddress) {
      setBusinessAddress(newAddress);
      localStorage.setItem("businessAddress", newAddress);
    }
    if (newOwnerName) {
      setBusinessOwnerName(newOwnerName);
      localStorage.setItem("businessOwnerName", newOwnerName);
    }
    if (newLogoUrl) {
      setLogoUrl(newLogoUrl);
      localStorage.setItem("logoUrl", newLogoUrl);
    }
    if (newTheme) {
      setThemeColor(newTheme);
      localStorage.setItem("themeColor", newTheme);
    }
    if (newRole) {
      setRole(newRole);
      localStorage.setItem("role", newRole);
    }
  };

  const logout = () => {
    setToken(null);
    setBusinessId(null);
    setBusinessName(null);
    setBusinessAddress(null);
    setBusinessOwnerName(null);
    setRole(null);
    setLogoUrl("/logo.png");
    setThemeColor("#3b82f6");
    localStorage.removeItem("token");
    localStorage.removeItem("businessId");
    localStorage.removeItem("businessName");
    localStorage.removeItem("businessAddress");
    localStorage.removeItem("businessOwnerName");
    localStorage.removeItem("logoUrl");
    localStorage.removeItem("themeColor");
    localStorage.removeItem("role");
    document.documentElement.removeAttribute("style");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        businessId,
        businessName,
        businessAddress,
        businessOwnerName,
        logoUrl,
        themeColor,
        themeMode,
        role,
        setRole,
        statusMessage,
        setStatusMessage,
        showStatus,
        toggleThemeMode,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
