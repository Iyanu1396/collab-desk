"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Upload, X, Check, AlertCircle } from "lucide-react";
import Button from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useAuthQuery } from "@/hooks/use-auth-query";

interface ProfileSetupModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
}

export default function ProfileSetupModal({
  isOpen,
  userId,
  onComplete,
}: ProfileSetupModalProps) {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; avatar?: string }>(
    {}
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { user } = useAuthQuery();

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return "Username is required";
    }
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 30) {
      return "Username must be less than 30 characters";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "Username can only contain letters, numbers, hyphens, and underscores";
    }
    return null;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    const error = validateUsername(value);
    setErrors((prev) => ({ ...prev, username: error || undefined }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, avatar: "Please select an image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Image must be less than 5MB" }));
      return;
    }

    setAvatar(file);
    setErrors((prev) => ({ ...prev, avatar: undefined }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Avatar upload error:", error);
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameError = validateUsername(username);
    if (usernameError) {
      setErrors({ username: usernameError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let avatarUrl: string | null = null;

      if (avatar) {
        avatarUrl = await uploadAvatar(avatar);
        if (!avatarUrl) {
          setErrors({ avatar: "Failed to upload avatar. Please try again." });
          setLoading(false);
          return;
        }
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: userId,
        username: username.trim(),
        avatar_url: avatarUrl,
        email: user?.email,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);

        if (profileError.code === "23505") {
          setErrors({
            username: "Username already taken. Please choose another.",
          });
        } else {
          toast.error("Failed to create profile. Please try again.");
        }
        return;
      }

      toast.success("Profile created successfully!");
      onComplete();
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            Set up your username and avatar to get started with CollabDeck
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {avatarPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                {avatar ? "Change Avatar" : "Upload Avatar (Optional)"}
              </label>
            </div>

            {errors.avatar && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.avatar}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.username ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.username && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                {errors.username}
              </div>
            )}
            {username && !errors.username && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                Username looks good!
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !!errors.username || !username.trim()}
            loading={loading}
          >
            {loading ? "Creating Profile..." : "Complete Setup"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your username will be visible to other collaborators
          </p>
        </div>
      </motion.div>
    </div>
  );
}
