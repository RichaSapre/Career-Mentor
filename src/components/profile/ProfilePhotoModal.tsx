"use client";

import { useRef } from "react";
import Image from "next/image";
import { signupDraft } from "@/lib/auth/signupDraft";

type Props = {
  onClose: () => void;
  onSelect: (img: string | null) => void;
};

const AVATARS = [
  "/images/avatar1.png",
  "/images/avatar2.png",
  "/images/avatar3.png",
];

export default function ProfilePhotoModal({ onClose, onSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      signupDraft.set({ profilePhoto: result });
      onSelect(result);
      onClose();
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-3xl p-8 w-full max-w-lg shadow-elevated relative backdrop-blur-xl">

        <h2 className="text-2xl font-semibold mb-6 text-center text-heading">
          Update Profile Picture
        </h2>

        {/* Drag & Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:bg-surface-hover transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-muted">
            Drag & drop image here or click to upload
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {/* Avatar Selection */}
        <div className="mt-8">
          <p className="text-muted mb-3 text-sm">
            Or choose an avatar:
          </p>

          <div className="flex gap-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                className="w-16 h-16 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition border border-border"
                onClick={() => {
                  signupDraft.set({ profilePhoto: avatar });
                  onSelect(avatar);
                  onClose();
                }}
              >
                <Image
                  src={avatar}
                  alt="Avatar option"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Delete Option */}
        <button
          onClick={() => {
            signupDraft.set({ profilePhoto: null });
            onSelect(null);
            onClose();
          }}
          className="mt-8 text-red-400 text-sm underline"
        >
          Remove current photo
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-faint hover:text-heading transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}