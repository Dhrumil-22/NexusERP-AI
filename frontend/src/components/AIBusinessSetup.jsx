import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Wand2,
  ArrowRight,
  Image as ImageIcon,
  Briefcase,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { API_BASE, EXPRESS_API } from "../config";

export function AIBusinessSetup() {
  const [step, setStep] = useState(1);
  // Step 1 State
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [themeColor, setThemeColor] = useState("#3b82f6");
  // Step 2 State
  const [description, setDescription] = useState("");
  // Step 3 State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfig, setAiConfig] = useState(null);
  const [error, setError] = useState("");
  const { token, login, themeMode, toggleThemeMode } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!description || !businessName) {
      setError("Please provide a business description.");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const response = await axios.post(
        `${EXPRESS_API}/api/ai/configure`,
        { description },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAiConfig(response.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to generate AI configuration. Ensure Express server is running and GEMINI_API_KEY is set.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = async () => {
    if (!aiConfig) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("business_name", businessName);
      formData.append("owner_name", ownerName);
      formData.append("address", address);
      formData.append("industry", aiConfig.industry);
      formData.append("theme_color", themeColor);
      formData.append("enabled_modules", JSON.stringify(aiConfig.modules));
      formData.append("ai_prompt", description);
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      await axios.post(
        `${API_BASE}/api/business_setup/onboarding/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      const meResponse = await axios.get(`${API_BASE}/api/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meResponse.data.business_id) {
        const fullLogoUrl = meResponse.data.logo
          ? meResponse.data.logo.startsWith("data:") 
            ? meResponse.data.logo 
            : `${API_BASE}${meResponse.data.logo}`
          : undefined;
        login(
          token,
          meResponse.data.business_id,
          meResponse.data.business_name,
          fullLogoUrl,
          meResponse.data.theme_color,
          meResponse.data.role,
          meResponse.data.business_address,
          meResponse.data.business_owner_name,
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["moduleManifests"] });
      navigate("/");
    } catch (err) {
      console.error("Django API Error:", err.response?.data);
      const djangoError = err.response?.data;
      let errorMsg = "Failed to save business configuration to Django.";
      if (djangoError) {
        if (typeof djangoError === "object") {
          errorMsg = JSON.stringify(djangoError);
        } else {
          errorMsg = String(djangoError);
        }
      }
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen relative overflow-hidden bg-background font-sans text-foreground">
      {/* Immersive AI Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-background">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        {/* Dynamic Glowing Orbs */}
        <div
          className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20 mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"
          style={{
            backgroundColor: themeColor,
            transition: "background-color 1s ease",
          }}
        />

        <div
          className="absolute bottom-[10%] right-[20%] w-[30vw] h-[30vw] rounded-full blur-[120px] opacity-10 mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"
          style={{ backgroundColor: "#6366f1", animationDelay: "2s" }}
        />
      </div>

      <div className="flex-1 w-full h-full overflow-y-auto relative z-10 flex flex-col items-center justify-center p-6">
        {/* Top Header / AI Badge */}
        <div className="absolute top-4 sm:p-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border backdrop-blur-md shadow-sm">
          <Sparkles
            className="w-4 h-4 text-primary"
            style={{ color: themeColor }}
          />
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Nexus AI Architect
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleThemeMode}
          className="absolute top-4 sm:p-8 right-8 w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-foreground hover:bg-accent/50 transition-colors z-20"
        >
          {themeMode === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <div className="max-w-2xl w-full mx-auto space-y-12 transition-all duration-500 ease-out">
          {error && (
            <div className="animate-in slide-in-from-top-4 flex items-center gap-3 text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-xl font-medium text-sm">
              <div className="w-2 h-2 rounded-full bg-destructive animate-ping shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground drop-shadow-sm">
                  Let's craft your workspace.
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto">
                  Provide the essential details, and I'll tailor the environment
                  to your brand's unique identity.
                </p>
              </div>

              <div className="bg-card border border-border rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                {/* Minimalist Input Group */}
                <div className="space-y-5">
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-muted-foreground transition-colors" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Business Name"
                      className="w-full h-14 bg-background hover:bg-accent/50 focus:bg-background border border-input rounded-2xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      style={{ "--tw-ring-color": themeColor }}
                    />
                  </div>

                  <div className="relative group">
                    <Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-muted-foreground transition-colors" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Your Name (Owner)"
                      className="w-full h-14 bg-background hover:bg-accent/50 focus:bg-background border border-input rounded-2xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      style={{ "--tw-ring-color": themeColor }}
                    />
                  </div>

                  <div className="relative group">
                    <MapPin className="absolute left-4 top-5 w-5 h-5 text-muted-foreground group-focus-within:text-muted-foreground transition-colors" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Business Address"
                      className="w-full min-h-[100px] bg-background hover:bg-accent/50 focus:bg-background border border-input rounded-2xl pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      style={{ "--tw-ring-color": themeColor }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Brand Color Picker */}
                  <div
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("color-picker")?.click()
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full shadow-inner border border-border"
                        style={{ backgroundColor: themeColor }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          Brand Color
                        </span>
                        <span className="text-xs text-muted-foreground uppercase">
                          {themeColor}
                        </span>
                      </div>
                    </div>
                    <input
                      id="color-picker"
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="opacity-0 absolute w-0 h-0"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer relative overflow-hidden"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    <div className="flex items-center gap-3 z-10">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-input overflow-hidden shrink-0">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground truncate">
                          Company Logo
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {logoFile ? logoFile.name : "Optional"}
                        </span>
                      </div>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="opacity-0 absolute w-0 h-0"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!businessName}
                  className="w-full h-14 flex items-center justify-center gap-2 text-white font-bold rounded-2xl transition-all disabled:opacity-50 group shadow-lg"
                  style={{
                    backgroundColor: themeColor,
                    boxShadow: `0 8px 30px -10px ${themeColor}80`,
                  }}
                >
                  Continue to Architecture{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground drop-shadow-sm">
                  What do you do?
                </h1>
                <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto">
                  Describe your operations in natural language. The AI will
                  analyze this to build your custom software architecture.
                </p>
              </div>

              <div className="relative group max-w-3xl mx-auto">
                <div
                  className={`absolute -inset-1 rounded-3xl blur-xl opacity-30 transition duration-1000 group-hover:opacity-60 ${isGenerating ? "animate-pulse" : ""}`}
                  style={{ backgroundColor: themeColor }}
                />

                <div className="relative bg-card border border-input rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g., We are a boutique hotel with a small restaurant. We need to manage room bookings, track kitchen inventory, and handle employee shifts..."
                    className="w-full min-h-[200px] bg-transparent p-4 sm:p-8 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-relaxed"
                    disabled={isGenerating}
                  />

                  <div className="flex items-center justify-between p-4 bg-background border-t border-border">
                    <button
                      onClick={() => setStep(1)}
                      disabled={isGenerating}
                      className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Back
                    </button>

                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !description}
                      className="px-6 py-3 flex items-center gap-2 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                      style={{ backgroundColor: themeColor }}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing Intent...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          Generate Architecture
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {isGenerating && (
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground animate-pulse mt-8">
                  <p className="text-sm font-medium">
                    Synthesizing modules based on your description...
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 3 && aiConfig && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border border-border mb-2 shadow-2xl relative">
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-50"
                    style={{ backgroundColor: themeColor }}
                  />
                  <CheckCircle2 className="w-8 h-8 text-foreground relative z-10" />
                </div>
                <h2 className="text-3xl font-semibold text-foreground tracking-tight">
                  Architecture Ready
                </h2>
                <p className="text-muted-foreground font-medium">
                  Classified as{" "}
                  <strong className="text-foreground capitalize">
                    {aiConfig.industry}
                  </strong>
                </p>
              </div>

              <div className="bg-card border border-border rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-background rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h3 className="font-semibold text-lg text-foreground mb-6 flex items-center gap-2">
                  <Bot className="w-5 h-5" style={{ color: themeColor }} />
                  AI-Selected Modules
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {aiConfig.modules
                    .filter(
                      (mod) =>
                        ![
                          "auth",
                          "business_setup",
                          "module_registry",
                          "permissions",
                        ].includes(mod),
                    )
                    .map((mod, i) => (
                      <div
                        key={mod}
                        className="p-4 bg-card border border-input rounded-2xl flex flex-col items-start gap-2 relative overflow-hidden group animate-in zoom-in-95 fill-mode-both"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                          style={{ backgroundColor: themeColor }}
                        />
                        <div
                          className="w-2 h-2 rounded-full shadow-md"
                          style={{ backgroundColor: themeColor }}
                        />
                        <div className="font-medium text-foreground text-sm capitalize">
                          {mod.replace(/_/g, " ")}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t border-input flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isGenerating}
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit Description
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={isGenerating}
                    className="h-12 px-8 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 group shadow-xl"
                    style={{
                      backgroundColor: themeColor,
                      boxShadow: `0 8px 30px -10px ${themeColor}80`,
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />{" "}
                        Deploying...
                      </>
                    ) : (
                      <>
                        Launch OS{" "}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
