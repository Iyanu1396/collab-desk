"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Globe,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Share,
  Calendar,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useAuthQuery } from "@/hooks/use-auth-query";
import Loading from "@/components/ui/loading";

const stats = [
  {
    name: "Total Playbooks",
    value: "12",
    change: "+2.5%",
    changeType: "positive" as const,
    icon: BookOpen,
    color: "blue",
  },
  {
    name: "Collaborators",
    value: "8",
    change: "+1",
    changeType: "positive" as const,
    icon: Users,
    color: "green",
  },
  {
    name: "CMS Articles",
    value: "156",
    change: "+12%",
    changeType: "positive" as const,
    icon: Globe,
    color: "purple",
  },
  {
    name: "Views This Month",
    value: "2.4k",
    change: "+8.1%",
    changeType: "positive" as const,
    icon: Eye,
    color: "orange",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "edit",
    title: 'Updated "Getting Started Guide"',
    user: "You",
    time: "2 hours ago",
    icon: Edit,
  },
  {
    id: 2,
    type: "create",
    title: 'Created "API Documentation"',
    user: "Alice Johnson",
    time: "4 hours ago",
    icon: Plus,
  },
  {
    id: 3,
    type: "share",
    title: 'Shared "Team Workflow"',
    user: "Bob Smith",
    time: "6 hours ago",
    icon: Share,
  },
  {
    id: 4,
    type: "view",
    title: 'Viewed "Architecture Overview"',
    user: "Carol Davis",
    time: "8 hours ago",
    icon: Eye,
  },
];

const quickActions = [
  {
    title: "Create New Playbook",
    description: "Start writing a new personal document",
    href: "/dashboard/playbooks/new",
    icon: BookOpen,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Browse CMS",
    description: "Explore articles from external sources",
    href: "/dashboard/cms",
    icon: Globe,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Invite Collaborators",
    description: "Add team members to your workspace",
    href: "/dashboard/collaborators",
    icon: Users,
    color: "bg-purple-500 hover:bg-purple-600",
  },
];

export default function DashboardHome() {
  const {
    user,
    session,
    profile,
    loading,
    profileLoading,
    needsProfile,
    checkSession,
  } = useAuthQuery();

  useEffect(() => {
    // Check session when component mounts
    if (!loading) {
      checkSession();
    }
  }, [loading, checkSession]);

  // Show loading while checking session
  if (loading) {
    return (
      <div className="min-h-[60vh]">
        <Loading
          size="lg"
          text="Loading dashboard..."
          className="min-h-[60vh]"
        />
      </div>
    );
  }

  // If no session, the useAuth hook will redirect to login
  if (!session) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your knowledge platform today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">{stat.change}</span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group block"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className={`inline-flex p-2 rounded-lg text-white mb-3 ${action.color} transition-colors`}
                    >
                      <action.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {action.description}
                    </p>
                    <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                      Get started
                      <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <Link
                href="/dashboard/activity"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
                    <activity.icon className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-600">{activity.user}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href="/dashboard/activity"
                className="block w-full text-center py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                View all activity
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Overview
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Views
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Edits
            </div>
          </div>
        </div>

        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Analytics chart will be implemented here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Coming soon with real-time data
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
