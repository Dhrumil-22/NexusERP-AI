import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, UploadCloud, Sun, Moon } from "lucide-react";

import { API_BASE } from "../../config";

export function VariantTopIllustration({
  isRegistering,
  setIsRegistering,
  themeMode,
  toggleThemeMode,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [otpInput, setOtpInput] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogoPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatus("submitting");

    try {
      if (isRegistering && step === "credentials") {
        await axios.post(`${API_BASE}/api/auth/register/`, {
          username,
          password,
          email,
          business_name: businessName,
        });
      }

      if (step === "credentials") {
        const response = await axios.post(`${API_BASE}/api/auth/login/`, {
          username,
          password,
        });

        if (response.data.otp_required) {
          setMaskedEmail(response.data.email_masked);
          setStep("otp");
          setStatus("idle");
          return;
        }
      }

      // Step: OTP verification
      const response = await axios.post(`${API_BASE}/api/auth/login/`, {
        username,
        password,
        otp: otpInput,
      });

      const { access } = response.data;
      const meResponse = await axios.get(`${API_BASE}/api/auth/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const {
        business_id,
        business_name,
        theme_color,
        logo,
        role,
        business_address,
        business_owner_name,
      } = meResponse.data;
      const fullLogoUrl = logo
          ? logo.startsWith("data:") 
            ? logo 
            : `${API_BASE}${logo}`
          : undefined;
      setStatus("success");
      setTimeout(() => {
        login(
          access,
          business_id,
          business_name,
          fullLogoUrl,
          theme_color,
          role,
          business_address,
          business_owner_name,
        );
        if (isRegistering) {
          navigate("/setup", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 800);
    } catch (err) {
      setStatus("error");
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          setErrorMsg(err.response.data.error);
        } else if (err.response.data.detail) {
          setErrorMsg(err.response.data.detail);
        } else if (typeof err.response.data === "object") {
          const errors = Object.values(err.response.data).flat();
          setErrorMsg(errors[0] || "Action failed.");
        } else {
          setErrorMsg(isRegistering ? "Registration failed." : "Invalid credentials.");
        }
      } else {
        setErrorMsg(
          isRegistering
            ? "Registration failed."
            : "Invalid credentials.",
        );
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden relative">
      {/* Top 30vh - Hero Illustration */}
      <div className="h-[30vh] w-full bg-surface-alt relative overflow-hidden border-b border-border flex items-center justify-center shrink-0">
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 text-sm font-semibold rounded-full bg-background/50 backdrop-blur border border-border shadow-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
          >
            &larr; Back
          </button>
        </div>

        <div className="absolute top-6 right-8 z-50">
          <button
            onClick={toggleThemeMode}
            className="p-2.5 rounded-full bg-background border border-border shadow-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
            title="Toggle Theme"
          >
            {themeMode === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>

        {/* Abstract SVG line-art representing modular network */}
        <svg
          className="absolute inset-0 w-full h-full text-border/40 stroke-current mix-blend-multiply dark:mix-blend-lighten"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Animated node connections */}
          <circle
            cx="20%"
            cy="40%"
            r="4"
            fill="currentColor"
            className="animate-pulse"
          />
          <circle
            cx="35%"
            cy="70%"
            r="6"
            fill="currentColor"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="65%"
            cy="30%"
            r="5"
            fill="currentColor"
            className="animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <circle
            cx="80%"
            cy="60%"
            r="4"
            fill="currentColor"
            className="animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <line
            x1="20%"
            y1="40%"
            x2="35%"
            y2="70%"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-50"
          />
          <line
            x1="35%"
            y1="70%"
            x2="50%"
            y2="50%"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-50"
          />
          <line
            x1="50%"
            y1="50%"
            x2="65%"
            y2="30%"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-50"
          />
          <line
            x1="65%"
            y1="30%"
            x2="80%"
            y2="60%"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-50"
          />
        </svg>

        {/* Central Core Badge */}
        <div className="relative z-10 animate-slide-up flex flex-col items-center">
          <div className="bg-transparent p-2">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md border-2 border-white/10"
              />
            ) : (
              <img
                src="/logo.png"
                alt="NexusERP Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                style={{
                  filter:
                    "drop-shadow(0 0 15px rgba(59, 130, 246, 0.7)) drop-shadow(0 0 25px rgba(139, 92, 246, 0.5))",
                }}
              />
            )}
          </div>
          <div className="mt-3 bg-background/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-border shadow-sm">
            <span className="text-sm font-bold tracking-widest text-foreground uppercase">
              {isRegistering ? businessName || "Your Business" : "NexusERP"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom 70vh - Form Panel */}
      <div className="flex-1 w-full flex justify-center pt-10 pb-8 px-6 overflow-y-auto">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {isRegistering
                ? "Welcome to NexusERP"
                : "Sign In to Your Workspace"}
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              {isRegistering
                ? "Let's set up your modular business operating system."
                : "Enter your credentials below."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "error" && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-full animate-shake text-center font-medium mx-auto max-w-md">
                {errorMsg}
              </div>
            )}

            {step === "credentials" ? (
              <div
                className={`grid gap-6 ${isRegistering ? "md:grid-cols-2" : "max-w-md mx-auto"}`}
              >
                {isRegistering && (
                  <div className="space-y-6 col-span-1 md:col-span-2">
                    <div className="flex items-center gap-4 bg-card p-4 rounded-full border border-border shadow-sm">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UploadCloud className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          required
                          className="flex h-10 w-full bg-transparent px-1 text-base font-semibold focus:outline-none transition-shadow placeholder:font-normal"
                          placeholder="My Awesome Cafe"
                          disabled={
                            status === "submitting" || status === "success"
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isRegistering && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-4">
                        Work Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex h-14 w-full rounded-full border border-input bg-card px-6 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="admin@cafe.com"
                        disabled={status === "submitting" || status === "success"}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-4">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="flex h-14 w-full rounded-full border border-input bg-card px-6 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="+1 555-0123"
                        disabled={status === "submitting" || status === "success"}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-4">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={`flex h-14 w-full rounded-full border border-input bg-card px-6 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${status === "error" ? "border-destructive" : ""}`}
                    placeholder="admin"
                    disabled={status === "submitting" || status === "success"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-4">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`flex h-14 w-full rounded-full border border-input bg-card px-6 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${status === "error" ? "border-destructive" : ""}`}
                    placeholder="••••••••"
                    disabled={status === "submitting" || status === "success"}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-md mx-auto animate-fade-in">
                <div className="text-center bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    🔒 Security Verification Code Sent
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please check <strong className="font-bold text-foreground">{maskedEmail}</strong> for your 6-digit OTP code.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-4">
                    Enter 6-Digit Security OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    className="flex h-16 w-full rounded-2xl border-2 border-primary/50 bg-card px-6 text-center text-2xl font-black tracking-[12px] shadow-md focus:ring-2 focus:ring-primary focus:border-primary transition-all text-primary"
                    placeholder="••••••"
                    disabled={status === "submitting" || status === "success"}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setOtpInput("");
                      setStatus("idle");
                      setErrorMsg("");
                    }}
                    className="hover:text-foreground underline font-medium"
                  >
                    ← Back to credentials
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setErrorMsg("");
                      setStatus("submitting");
                      try {
                        await axios.post(`${API_BASE}/api/auth/login/`, { username, password });
                        setStatus("idle");
                        alert("A new OTP has been sent to your email!");
                      } catch (e) {
                        setStatus("error");
                        setErrorMsg("Failed to resend OTP.");
                      }
                    }}
                    className="text-primary hover:underline font-bold"
                  >
                    Resend OTP Code
                  </button>
                </div>
              </div>
            )}

            <div
              className={`mt-8 ${isRegistering || step === "credentials" ? "max-w-md mx-auto pt-4" : "max-w-md mx-auto"}`}
            >
              <button
                type="submit"
                disabled={status === "submitting" || status === "success"}
                className={`inline-flex items-center justify-center rounded-full text-sm font-bold h-14 w-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-2 ${
                  status === "success"
                    ? "bg-success border-success text-white"
                    : "border-primary text-primary hover:bg-primary/5"
                } disabled:opacity-80 disabled:pointer-events-none disabled:transform-none`}
              >
                {status === "submitting" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step === "otp" ? (
                  "Verify & Log In"
                ) : isRegistering ? (
                  "Initialize OS"
                ) : (
                  "Sign In Securely"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
              disabled={status === "submitting" || status === "success"}
            >
              {isRegistering ? "Already have an account? " : "Need a new OS? "}
              <span className="text-primary hover:underline font-bold">
                {isRegistering ? "Sign In" : "Register"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
