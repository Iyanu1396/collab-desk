"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  FileText,
  Users,
  Zap,
  ArrowRight,
  Edit3,
  Share2,
  Sparkles,
  Rocket,
  Shield,
  Globe,
  Star,
  CheckCircle,
 
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12"
        style={{ y, opacity, scale }}
      >
        <motion.div
          className="max-w-6xl mx-auto text-center z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200 dark:border-blue-800"
            >
              <Sparkles className="h-4 w-4" />
              Real-time collaboration platform
            </motion.div>

            <motion.h1
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6"
              variants={itemVariants}
            >
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Collab
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Deck
              </span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              The collaborative knowledge-sharing platform where teams{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                write
              </span>
              ,{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                edit
              </span>
              , and{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                publish
              </span>{" "}
              rich-text playbooks together in real-time.
            </motion.p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-16">
            <Link href="/login">
              <motion.button
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold px-10 py-5 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <span className="relative z-10 flex items-center">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </Link>
          </motion.div>

          {/* Floating Interactive Elements */}
          <motion.div className="relative" variants={itemVariants}>
            <div className="flex justify-center items-center space-x-8 relative">
              <motion.div
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Edit3 className="h-10 w-10 text-blue-600" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <motion.div
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50"
                animate={{
                  y: [0, 20, 0],
                  rotate: [0, -1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Users className="h-10 w-10 text-green-600" />
                <div className="flex -space-x-2 mt-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                whileHover={{ scale: 1.1 }}
              >
                <Share2 className="h-10 w-10 text-purple-600" />
                <motion.div
                  className="mt-2 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded"
                  animate={{ scaleX: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-slate-400/50 dark:border-slate-500/50 rounded-full flex justify-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-slate-400 dark:bg-slate-500 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-32 px-6 sm:px-8 lg:px-12 relative"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-purple-200 dark:border-purple-800"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Star className="h-4 w-4" />
              Why teams choose us
            </motion.div>

            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Built for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                collaboration
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Experience the future of team documentation with features designed
              for modern workflows.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Real-time Collaboration",
                description:
                  "See changes instantly as your team edits. Live cursors, presence indicators, and conflict-free merging keep everyone in perfect sync.",
                gradient: "from-blue-500 to-cyan-500",
                features: [
                  "Live cursors",
                  "Instant sync",
                  "Conflict resolution",
                ],
              },
              {
                icon: FileText,
                title: "Rich Text Editor",
                description:
                  "Powerful rich-text editing with markdown support, formatting options, and embedded content for beautiful documentation.",
                gradient: "from-green-500 to-emerald-500",
                features: [
                  "Markdown support",
                  "Rich formatting",
                  "Media embedding",
                ],
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description:
                  "Built for teams with enterprise-grade security, permission controls, and seamless collaboration workflows.",
                gradient: "from-purple-500 to-pink-500",
                features: [
                  "Role-based access",
                  "Audit logs",
                  "Data encryption",
                ],
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{
                  scale: 1.02,
                  rotateX: 5,
                  rotateY: 5,
                }}
              >
                <div
                  className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.features.map((item) => (
                    <div
                      key={item}
                      className="flex items-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {item}
                    </div>
                  ))}
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}
                ></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div
            className="absolute top-0 left-0 w-full h-full bg-repeat bg-[length:60px_60px] opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-5xl sm:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready to transform your team&apos;s{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              collaboration?
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Join thousands of teams already using CollabDeck to create, share,
            and collaborate on knowledge seamlessly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/login">
              <motion.button
                className="bg-white text-blue-600 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-gray-50 transition-colors duration-300 shadow-2xl group"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px rgba(255, 255, 255, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Start Collaborating Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
