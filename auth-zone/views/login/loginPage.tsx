"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { LoginForm } from "@/views/login/loginForm";

export function LoginPage() {
  useEffect(() => {
    // "/" is owned by the main zone (a different app), so leaving the auth
    // zone must be a full-page navigation — the client router can't cross zones.
    getCurrentUser()
      .then(() => window.location.replace("/"))
      .catch(() => {});

    // Completes the Google/Hosted UI OAuth redirect: once Amplify exchanges the
    // authorization code for tokens, it emits "signInWithRedirect".
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signInWithRedirect") {
        window.location.replace("/");
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(140,198,63,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(229,100,159,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(41,171,226,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(247,148,29,0.1),transparent_40%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3iYmNCbNrAz3xweW1kCvDFAA44QRiG.png"
            alt="HIKIGAI Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-brand-gradient mt-4">
            Welcome
          </h1>
        </div>

        <LoginForm />
      </motion.div>
    </div>
  );
}
