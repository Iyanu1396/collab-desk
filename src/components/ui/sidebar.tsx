"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Settings,
  Users,
  BarChart3,
  PlusCircle,
  ExternalLink,
  Globe,
  BookOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthQuery } from "@/hooks/use-auth-query";
import LogoutModal from "./logout-modal";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: BarChart3,
    description: "Dashboard overview and analytics",
  },
  {
    name: "Your Playbooks",
    href: "/dashboard/playbooks",
    icon: BookOpen,
    description: "Create and manage your personal playbooks",
  },
  {
    name: "Collaborative",
    href: "/dashboard/collaborative",
    icon: Users,
    description: "Team playbooks and collaboration",
  },
  {
    name: "CMS Explorer",
    href: "/dashboard/cms",
    icon: Globe,
    description: "Browse and embed external content",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account and workspace settings",
  },
];

const quickActions = [
  {
    name: "New Playbook",
    href: "/dashboard/playbooks/new",
    icon: PlusCircle,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    name: "New Collaboration",
    href: "/dashboard/collaborative/new",
    icon: Users,
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    name: "Browse CMS",
    href: "/dashboard/cms",
    icon: ExternalLink,
    color: "bg-green-500 hover:bg-green-600",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, session, profile, signOut } = useAuthQuery();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const success = await signOut();
    if (success) {
      setShowLogoutModal(false);
    }
    setLoggingOut(false);
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col w-72 bg-white border-r border-gray-200 shadow-sm h-screen overflow-y-auto"
    >
      {/* Logo and branding */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">CollabDeck</h1>
          <p className="text-sm text-gray-500">Knowledge Platform</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors",
                action.color
              )}
            >
              <action.icon className="w-4 h-4" />
              {action.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-6 py-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Navigation
        </h3>
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div
                    className={cn(
                      "text-xs truncate transition-colors",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="px-6 py-4 border-t border-gray-100 space-y-4">
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || user.email || "User"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {profile?.username
                      ? profile.username.charAt(0).toUpperCase()
                      : user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              {session && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.username || "Set username"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-700" />
          <span className="group-hover:text-red-700">Sign Out</span>
        </button>

        {/* Footer Info */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
          <p>&copy; 2024 CollabDeck</p>
          <p>v1.0.0 - Beta</p>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        loading={loggingOut}
      />
    </motion.aside>
  );
}
