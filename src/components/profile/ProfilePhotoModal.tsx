"use client";

import { useRef } from "react";
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1f2433] rounded-3xl p-8 w-full max-w-lg shadow-xl relative">

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Update Profile Picture
        </h2>

        {/* Drag & Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:bg-white/5 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-white/60">
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
          <p className="text-white/60 mb-3 text-sm">
            Or choose an avatar:
          </p>

          <div className="flex gap-4">
            {AVATARS.map((avatar) => (
              <img
                key={avatar}
                src={avatar}
                className="w-16 h-16 rounded-full cursor-pointer hover:scale-110 transition"
                onClick={() => {
                  signupDraft.set({ profilePhoto: avatar });
                  onSelect(avatar);
                  onClose();
                }}
              />
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
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}