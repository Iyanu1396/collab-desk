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
  Settings,
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  Star,
  Sparkles,
  Coffee,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useAuthQuery } from "@/hooks/use-auth-query";
import Loading from "@/components/ui/loading";

const stats = [
  {
    name: "Total Playbooks",
    value: "12",
    change: "+2",
    changeType: "positive" as const,
    icon: BookOpen,
    color: "blue",
    description: "Personal & Collaborative",
  },
  {
    name: "Team Members",
    value: "8",
    change: "+3",
    changeType: "positive" as const,
    icon: Users,
    color: "emerald",
    description: "Active Collaborators",
  },
  {
    name: "Published Content",
    value: "24",
    change: "+6",
    changeType: "positive" as const,
    icon: Globe,
    color: "purple",
    description: "Live Playbooks",
  },
  {
    name: "Monthly Views",
    value: "2.4k",
    change: "+15%",
    changeType: "positive" as const,
    icon: Eye,
    color: "orange",
    description: "Engagement Growth",
  },
];

const quickActions = [
  {
    title: "Create New Playbook",
    description: "Start documenting your processes",
    href: "/dashboard/playbooks/new",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    hoverColor: "hover:from-blue-600 hover:to-indigo-700",
  },
  {
    title: "Team Collaboration",
    description: "Work together on shared playbooks",
    href: "/dashboard/collaborative",
    icon: Users,
    color: "from-emerald-500 to-green-600",
    hoverColor: "hover:from-emerald-600 hover:to-green-700",
  },
  {
    title: "Browse CMS",
    description: "Explore external knowledge sources",
    href: "/dashboard/cms",
    icon: Globe,
    color: "from-purple-500 to-violet-600",
    hoverColor: "hover:from-purple-600 hover:to-violet-700",
  },
  {
    title: "Account Settings",
    description: "Manage your profile and preferences",
    href: "/dashboard/settings",
    icon: Settings,
    color: "from-slate-500 to-gray-600",
    hoverColor: "hover:from-slate-600 hover:to-gray-700",
  },
];

const quickTips = [
  {
    icon: Lightbulb,
    title: "Start with a Clear Structure",
    tip: "Organize your playbook with clear headings, step-by-step instructions, and logical flow.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: Target,
    title: "Include Visual Elements",
    tip: "Add diagrams, screenshots, and charts to make your content more engaging and easier to follow.",
    color: "from-red-400 to-pink-500",
  },
  {
    icon: Zap,
    title: "Keep it Action-Oriented",
    tip: "Use clear action verbs and specific instructions. Avoid vague language and be direct.",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: Star,
    title: "Test Your Procedures",
    tip: "Walk through your playbook steps to ensure they work and make sense to others.",
    color: "from-purple-400 to-indigo-500",
  },
];

const inspirations = [
  {
    icon: Coffee,
    title: "Morning Ritual",
    description: "Document your perfect morning routine and productivity setup",
  },
  {
    icon: Rocket,
    title: "Project Launch",
    description: "Create a comprehensive project kickoff checklist",
  },
  {
    icon: Sparkles,
    title: "Creative Process",
    description: "Capture your creative workflow and inspiration sources",
  },
];

export default function DashboardHome() {
  const {
    session,
    loading,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="text-4xl"
            >
              👋
            </motion.div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Ready to create amazing playbooks? Your knowledge management hub
            awaits with powerful tools and insights.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -5, 5, -5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 4,
                      }}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-3xl font-bold bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-700 bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      >
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      </motion.div>
                      <span className="text-xs font-semibold text-emerald-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {stat.name}
                  </h3>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
                <div
                  className={`h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-full mt-4 opacity-20`}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl"
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Quick Actions
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group block"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="relative p-6 border-2 border-gray-200/50 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:scale-105"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600"></div>

                      <div
                        className={`inline-flex p-3 rounded-xl text-white mb-4 bg-gradient-to-br ${action.color} ${action.hoverColor} transition-all duration-300 group-hover:scale-110`}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, -8, 8, -8, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 4,
                            delay: index * 0.3,
                          }}
                        >
                          <action.icon className="w-6 h-6" />
                        </motion.div>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors text-lg">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-semibold">
                        Get started
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        >
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{
                    rotate: [0, -15, 15, -15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl"
                >
                  <Lightbulb className="w-6 h-6 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-900">Pro Tips</h2>
              </div>

              <div className="space-y-6">
                {quickTips.map((tip, index) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${tip.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, -10, 10, -10, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 5,
                            delay: index * 0.4,
                          }}
                        >
                          <tip.icon className="w-4 h-4 text-white" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                          {tip.title}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {tip.tip}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Inspiration Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              animate={{
                rotate: [0, -20, 20, -20, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 4,
              }}
              className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Playbook Inspiration
              </h2>
              <p className="text-gray-600 mt-1">
                Get ideas for your next amazing playbook
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inspirations.map((inspiration, index) => (
              <motion.div
                key={inspiration.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="p-6 border-2 border-gray-200/50 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:scale-105">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <motion.div
                        animate={{
                          rotate: [0, -12, 12, -12, 0],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          repeatDelay: 4,
                          delay: index * 0.5,
                        }}
                      >
                        <inspiration.icon className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {inspiration.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {inspiration.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
