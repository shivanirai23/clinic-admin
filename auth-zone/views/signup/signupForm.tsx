"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LockIcon,
  MailIcon,
  AlertCircle,
  EyeOffIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  BuildingIcon,
  StethoscopeIcon,
  InfoIcon,
} from "lucide-react";
import { signUp, confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";

const SPECIALTIES = [
  "General Practitioner",
  "Family Medicine",
  "Internal Medicine",
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Gastroenterology",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Nephrology",
  "Neurology",
  "Obstetrics",
  "Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pathology",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Surgery",
  "Urology",
];

const COUNTRY_CODES = [
  { code: "+1", label: "+1 US" },
  { code: "+1", label: "+1 CA" },
  { code: "+44", label: "+44 UK" },
  { code: "+91", label: "+91 IN" },
  { code: "+61", label: "+61 AU" },
  { code: "+49", label: "+49 DE" },
  { code: "+33", label: "+33 FR" },
  { code: "+81", label: "+81 JP" },
  { code: "+86", label: "+86 CN" },
  { code: "+55", label: "+55 BR" },
];

const PASSWORD_TOOLTIP = "Must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";

type Step = "register" | "verify";

export function SignupForm() {
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("register");

  // Register fields
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+1");
  const [phone, setPhone] = React.useState("");
  const [specialty, setSpecialty] = React.useState("");
  const [clinicName, setClinicName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = React.useState(false);

  // Verify field
  const [code, setCode] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    code: "",
  });
  const [resendMessage, setResendMessage] = React.useState("");

  const clearFieldError = (field: keyof typeof fieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));

  const validateRegister = () => {
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      code: "",
    };
    let valid = true;
    if (!firstName.trim()) { errors.firstName = "Please enter your first name"; valid = false; }
    if (!lastName.trim()) { errors.lastName = "Please enter your last name"; valid = false; }
    if (!email) { errors.email = "Please enter your email"; valid = false; }
    if (!password) { errors.password = "Please enter a password"; valid = false; }
    else if (password.length < 8) { errors.password = "Password must be at least 8 characters"; valid = false; }
    if (!confirmPassword) { errors.confirmPassword = "Please confirm your password"; valid = false; }
    else if (password !== confirmPassword) { errors.confirmPassword = "Passwords do not match"; valid = false; }
    setFieldErrors(errors);
    return valid;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    if (!validateRegister()) return;

    setIsLoading(true);
    try {
      const userAttributes: Record<string, string> = {
        email,
        given_name: firstName.trim(),
        family_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
      };
      if (phone) {
        userAttributes.phone_number = `${countryCode}${phone.replace(/\D/g, "")}`;
      }
      if (specialty) {
        userAttributes["custom:specialty"] = specialty;
      }
      if (clinicName) {
        userAttributes["custom:clinic_name"] = clinicName.trim();
      }

      const { nextStep } = await signUp({
        username: email,
        password,
        options: { userAttributes },
      });
      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setStep("verify");
      } else {
        router.replace("/login");
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    if (!code) {
      setFieldErrors((prev) => ({ ...prev, code: "Please enter the verification code" }));
      return;
    }

    setIsLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      router.replace("/login");
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage("");
    try {
      await resendSignUpCode({ username: email });
      setResendMessage("A new code has been sent to your email.");
    } catch (err: unknown) {
      setResendMessage(err instanceof Error ? err.message : "Failed to resend code.");
    }
  };

  if (step === "verify") {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Verify your email</h2>
        <p className="text-sm text-slate-500 mb-6">
          We sent a verification code to <span className="font-medium text-slate-700">{email}</span>. Enter it below to complete sign up.
        </p>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
            <span className="text-sm">{authError}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              className="h-12 text-center tracking-widest text-lg"
              value={code}
              onChange={(e) => { setCode(e.target.value); clearFieldError("code"); }}
            />
            {fieldErrors.code && <p className="text-xs text-red-600">{fieldErrors.code}</p>}
          </div>

          {resendMessage && (
            <p className={`text-xs ${resendMessage.startsWith("A new") ? "text-green-600" : "text-red-600"}`}>
              {resendMessage}
            </p>
          )}

          <div className="pt-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-brand-gradient rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <Button
                type="submit"
                className="relative w-full h-12 bg-white text-slate-800 hover:text-white hover:bg-brand-blue border-none"
                disabled={isLoading}
              >
                {isLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                )}
                {isLoading ? "Verifying..." : "VERIFY EMAIL"}
              </Button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Didn&apos;t receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-brand-blue hover:text-brand-pink transition-colors"
          >
            Resend
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {authError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
          <span className="text-sm">{authError}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        {/* Row 1: First Name + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <UserIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                className="pl-10 h-12"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
              />
            </div>
            {fieldErrors.firstName && <p className="text-xs text-red-600">{fieldErrors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <UserIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                className="pl-10 h-12"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
              />
            </div>
            {fieldErrors.lastName && <p className="text-xs text-red-600">{fieldErrors.lastName}</p>}
          </div>
        </div>

        {/* Row 2: Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MailIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 h-12"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
              />
            </div>
            {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex gap-1.5">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-12 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 shrink-0 w-24"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.label} value={c.code}>{c.label}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  className="pl-10 h-12"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
                />
              </div>
            </div>
            {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
          </div>
        </div>

        {/* Row 3: Specialty + Clinic Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <StethoscopeIcon className="h-4 w-4 text-slate-400" />
              </div>
              <select
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 appearance-none"
              >
                <option value="">Specialty</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BuildingIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="clinicName"
                name="clinicName"
                type="text"
                placeholder="Clinic Name"
                className="pl-10 h-12"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Row 4: Password + Confirm Password */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  onMouseEnter={() => setShowPasswordTooltip(true)}
                  onMouseLeave={() => setShowPasswordTooltip(false)}
                  aria-label="Password requirements"
                >
                  <InfoIcon className="h-3.5 w-3.5" />
                </button>
                {showPasswordTooltip && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg z-10">
                    {PASSWORD_TOOLTIP}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center h-5.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>
        </div>

        <div className="pt-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-brand-gradient rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <Button
              type="submit"
              className="relative w-full h-12 bg-white text-slate-800 hover:text-white hover:bg-brand-blue border-none"
              disabled={isLoading}
            >
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                />
              )}
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-blue hover:text-brand-pink transition-colors no-underline"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex justify-center space-x-4">
          <a
            className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            target="_blank"
            href="https://www.facebook.com/profile.php?id=61555402344945"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            target="_blank"
            href="https://x.com/HikigaiInc"
            rel="noreferrer"
            aria-label="X (Twitter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
          <a
            className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            target="_blank"
            href="https://www.linkedin.com/company/hikigai/"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
