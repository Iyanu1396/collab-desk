"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Save,
  Lock,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuthQuery } from "@/hooks/use-auth-query";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuthQuery();
  const [username, setUsername] = useState(profile?.username || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; avatar?: string }>(
    {}
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

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
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
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
      let avatarUrl = profile?.avatar_url;

      if (avatar) {
        const newAvatarUrl = await uploadAvatar(avatar);
        if (!newAvatarUrl) {
          setErrors({ avatar: "Failed to upload avatar. Please try again." });
          setLoading(false);
          return;
        }
        avatarUrl = newAvatarUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user?.id);

      if (updateError) {
        console.error("Profile update error:", updateError);

        if (updateError.code === "23505") {
          setErrors({
            username: "Username already taken. Please choose another.",
          });
        } else {
          toast.error("Failed to update profile. Please try again.");
        }
        return;
      }

      toast.success("Profile updated successfully!");
      setAvatar(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await refreshProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
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

  const hasChanges = username !== (profile?.username || "") || avatar !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <SettingsIcon className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {avatarPreview ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
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
                      ) : profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Current avatar"
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                          <span className="text-white font-semibold text-lg">
                            {profile?.username
                              ? profile.username.charAt(0).toUpperCase()
                              : user?.email?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
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
                        Change Picture
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG or GIF. Max size 5MB.
                      </p>
                    </div>
                  </div>

                  {errors.avatar && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.avatar}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
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
                  {username &&
                    !errors.username &&
                    username !== profile?.username && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        Username looks good!
                      </div>
                    )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    Email address cannot be changed for security reasons
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={loading || !!errors.username || !hasChanges}
                    loading={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  {!hasChanges && (
                    <p className="text-sm text-gray-500">No changes to save</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  User ID
                </label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border">
                  {user?.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Account Created
                </label>
                <p className="text-sm text-gray-900">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Sign In
                </label>
                <p className="text-sm text-gray-900">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email Verified
                </label>
                <div className="flex items-center gap-2">
                  {user?.email_confirmed_at ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-600">
                        Unverified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Playbooks Created</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Collaborations</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profile Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile?.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
