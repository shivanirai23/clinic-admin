"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  bare?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  showClose = true,
  bare = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-white shadow-[0px_10px_30px_-10px_rgba(99,14,212,0.2)]",
          bare ? "overflow-hidden p-0" : "p-6",
          className,
        )}
      >
        {!bare && title && (
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  items: { label: string; onClick: () => void; destructive?: boolean }[];
  anchorRect: DOMRect | null;
}

export function DropdownMenu({ open, onClose, items, anchorRect }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (menuRef.current?.contains(target)) return;
      if (target.closest("[data-menu-trigger]")) return;
      onClose();
    };
    const handleScroll = () => onClose();
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, onClose]);

  if (!open || !anchorRect || typeof document === "undefined") return null;

  const menuWidth = 180;
  const left = Math.max(8, anchorRect.right - menuWidth);
  const top = anchorRect.bottom + 4;

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top, left, width: menuWidth, zIndex: 50 }}
      className="rounded-lg border border-border bg-white py-1 shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={cn(
            "block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-page",
            item.destructive ? "text-danger" : "text-text-primary",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
