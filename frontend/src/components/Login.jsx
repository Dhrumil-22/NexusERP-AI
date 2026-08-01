import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { VariantTopIllustration } from "./login/VariantTopIllustration";

export function Login() {
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(() => {
    if (localStorage.getItem("openRegister") === "true") {
      localStorage.removeItem("openRegister");
      return true;
    }
    return location.state?.isRegistering || false;
  });
  const { themeMode, toggleThemeMode } = useAuth();
  return (
    <div className="relative w-screen h-screen">
      <VariantTopIllustration
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    </div>
  );
}
