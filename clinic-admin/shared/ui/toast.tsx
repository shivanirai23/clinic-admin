"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  variant?: "success" | "error";
}

export function Toast({ message, onClose, variant = "success" }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed right-6 top-6 z-50 flex max-w-md items-center gap-3 rounded-xl px-4 py-3 shadow-lg",
        variant === "success" ? "bg-success text-white" : "bg-danger text-white",
      )}
    >
      {variant === "success" && <CheckCircle2 className="h-5 w-5 shrink-0" />}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/10">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
