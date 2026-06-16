"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SignupForm } from "@/views/signup/signupForm";

export function SignupPage() {
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
        className="w-full max-w-2xl"
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
            Create Your Account
          </h1>
          <p className="text-sm text-slate-500 mt-2">Join HIKIGAI Clinic Admin to manage your clinics</p>
        </div>

        <SignupForm />
      </motion.div>
    </div>
  );
}
