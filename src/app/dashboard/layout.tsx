"use client";

import { useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useAuthQuery } from "@/hooks/use-auth-query";
import Loading from "@/components/ui/loading";
import ProfileSetupModal from "@/components/profile-setup-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    session,
    user,
    loading,
    profileLoading,
    needsProfile,
    checkSession,
    refreshProfile,
  } = useAuthQuery();

  useEffect(() => {
    if (!loading) {
      checkSession();
    }
  }, [loading, checkSession]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Authenticating..." className="min-h-[50vh]" />
      </div>
    );
  }

  // If no session, useAuth will redirect to login
  if (!session || !user) {
    return null;
  }

  // Show profile loading
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Loading profile..." className="min-h-[50vh]" />
      </div>
    );
  }

  // Show profile setup modal if needed
  if (needsProfile) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
        <ProfileSetupModal
          isOpen={true}
          userId={user.id}
          onComplete={refreshProfile}
        />
      </>
    );
  }
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
