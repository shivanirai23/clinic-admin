"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LockIcon, MailIcon, AlertCircle, EyeOffIcon, EyeIcon } from "lucide-react";
import { signIn, resetPassword, confirmSignIn, signInWithRedirect } from "aws-amplify/auth";
import { AUTH_BYPASS, setDevSession } from "@/lib/auth/session";
import { redirectToMainApp } from "@/lib/auth/redirect";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [authError, setAuthError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState({ email: "", password: "" });

  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = React.useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = React.useState(false);

  const [newPasswordRequired, setNewPasswordRequired] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");

  const [mfaRequired, setMfaRequired] = React.useState(false);
  const [mfaCode, setMfaCode] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    } else if (name === "password") {
      setPassword(value);
      setFieldErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleNewPassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPassword) return;
    setIsLoggingIn(true);
    setAuthError("");
    try {
      await confirmSignIn({ challengeResponse: newPassword });
      redirectToMainApp();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Failed to set new password.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");

    let hasError = false;
    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter email" }));
      hasError = true;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: "Please enter password" }));
      hasError = true;
    }
    if (hasError) return;

    setIsLoggingIn(true);
    try {
      if (AUTH_BYPASS) {
        setDevSession(email);
        redirectToMainApp();
        return;
      }

      const { nextStep } = await signIn({ username: email, password });
      if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNewPasswordRequired(true);
      } else if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        setMfaRequired(true);
      } else {
        redirectToMainApp(); // "/" lives in the main zone — hard navigation required
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMfaCode = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mfaCode) return;
    setIsLoggingIn(true);
    setAuthError("");
    try {
      await confirmSignIn({ challengeResponse: mfaCode });
      redirectToMainApp(); // "/" lives in the main zone — hard navigation required
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    if (AUTH_BYPASS) {
      setDevSession("google-user@dev.local");
      redirectToMainApp();
      return;
    }
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your email address.");
      return;
    }
    setForgotPasswordLoading(true);
    setForgotPasswordMessage("");
    try {
      await resetPassword({ username: forgotPasswordEmail });
      setForgotPasswordMessage("Reset link sent! Check your inbox.");
    } catch (err: unknown) {
      setForgotPasswordMessage(err instanceof Error ? err.message : "Error sending reset link.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Two-factor authentication</h2>
        <p className="text-sm text-slate-500 mb-6">Enter the 6-digit code from your authenticator app to continue.</p>
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
            <span className="text-sm">{authError}</span>
          </div>
        )}
        <form onSubmit={handleMfaCode} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Authentication code</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="pl-10 h-12 tracking-widest"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-brand-blue hover:bg-brand-pink text-white"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </div>
    );
  }

  if (newPasswordRequired) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Set a new password</h2>
        <p className="text-sm text-slate-500 mb-6">Your temporary password has expired. Please set a new password to continue.</p>
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
            <span className="text-sm">{authError}</span>
          </div>
        )}
        <form onSubmit={handleNewPassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                className="pl-10 h-12"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-brand-blue hover:bg-brand-pink text-white"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Saving..." : "Set New Password"}
          </Button>
        </form>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address*</Label>
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
              onChange={handleChange}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password*</Label>

            <Dialog onOpenChange={() => {
              setForgotPasswordEmail("");
              setForgotPasswordMessage("");
              setForgotPasswordLoading(false);
            }}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-xs text-brand-blue hover:text-brand-pink transition-colors font-medium cursor-pointer no-underline"
                >
                  Forgot password?
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-106.25 bg-white rounded-lg">
                <DialogHeader>
                  <DialogTitle>Forgot Password</DialogTitle>
                  <DialogDescription>
                    Enter your email address below and we will send you a link to reset your
                    password.
                  </DialogDescription>
                </DialogHeader>
                <form>
                  <div className="grid gap-4 pb-6">
                    <div className="col-span-4 items-center gap-4">
                      <Label
                        htmlFor="forgot-email"
                        className="text-left col-span-1 text-sm text-slate-700"
                      >
                        Email
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="col-span-3 h-10 rounded-md border-slate-200 focus:border-brand-blue focus:ring-brand-blue mt-2"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                    {forgotPasswordMessage && (
                      <div
                        className={`col-span-4 text-sm p-2 rounded-md ${
                          forgotPasswordMessage.includes("Error")
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {forgotPasswordMessage}
                      </div>
                    )}
                  </div>
                  <DialogFooter className="gap-3">
                    <DialogClose asChild>
                      <Button type="button" variant="outline" className="h-10 px-5 rounded-lg text-sm">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      className="h-10 px-5 rounded-lg text-sm bg-brand-blue hover:bg-brand-pink text-white"
                      disabled={forgotPasswordLoading}
                      onClick={handleForgotPassword}
                    >
                      {forgotPasswordLoading && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                        />
                      )}
                      {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        <div className="pt-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-brand-gradient rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <Button
              type="submit"
              className="relative w-full h-12 bg-white text-slate-800 hover:text-white hover:bg-brand-blue border-none"
              disabled={isLoggingIn}
            >
              {isLoggingIn && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                />
              )}
              {isLoggingIn ? "Logging in..." : "LOGIN"}
            </Button>
          </div>
        </div>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="px-3 text-xs uppercase tracking-wide text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Google SSO */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        onClick={handleGoogleSignIn}
        disabled={isLoggingIn}
      >
        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
        </svg>
        Continue with Google
      </Button>

      {/* Sign up disabled — accounts are provisioned by your clinic admin. */}

      {/* Social media links */}
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
