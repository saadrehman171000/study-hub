"use client"

import { useEffect, useRef } from "react"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  BarChart,
  Calendar,
  Shield,
  Zap,
  CheckCircle,
  Brain,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Star,
  Lightbulb,
} from "lucide-react"
import { useState } from "react"

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeFeature, setActiveFeature] = useState(0)

  const featuresRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // Set up intersection observer to highlight active section in nav
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // You could use this to highlight the active nav item
            // console.log('In view:', entry.target.id);
          }
        })
      },
      { threshold: 0.3 },
    )

    const sections = [featuresRef.current, benefitsRef.current, testimonialsRef.current, faqRef.current]

    sections.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  // Auto-rotate featured items
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200">
      <Header />

      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white"
            >
              Elevate Your Study Experience
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Transform your learning journey with smart study tools, collaborative features, and personalized
              analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors shadow-lg"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-dark-100 transition-colors"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>

          {/* Hero Image/Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600&q=80"
                alt="StudyHub Dashboard Preview"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <p className="text-lg font-medium">Visualize your study progress and stay on track</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-20 bg-white dark:bg-dark-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Powerful Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need to Excel
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Powerful features designed to enhance your learning experience and boost productivity.
              </p>
            </motion.div>

            {/* Feature Tabs */}
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { icon: BookOpen, name: "Study Materials" },
                  { icon: Users, name: "Collaboration" },
                  { icon: BarChart, name: "Analytics" },
                  { icon: Calendar, name: "Scheduling" },
                  { icon: Shield, name: "Security" },
                  { icon: Zap, name: "AI Insights" },
                ].map((tab, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFeature(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                      activeFeature === index
                        ? "bg-primary-600 text-white dark:bg-primary-500"
                        : "bg-gray-100 text-gray-700 dark:bg-dark-200 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300"
                    } transition-colors`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Feature Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {(() => {
                    const feature = [
                      {
                        title: "Smart Study Materials",
                        description:
                          "Organize and access your study materials efficiently with our intelligent organization system. Tag, categorize, and search through your notes, documents, and resources with ease.",
                        features: [
                          "Intelligent document organization",
                          "Advanced search capabilities",
                          "Automatic tagging and categorization",
                          "Cloud storage with offline access",
                        ],
                        icon: BookOpen,
                      },
                      {
                        title: "Collaborative Learning",
                        description:
                          "Connect with peers, share resources, and learn together in real-time. Create study groups, share notes, and collaborate on projects seamlessly.",
                        features: [
                          "Real-time document collaboration",
                          "Study group management",
                          "Resource sharing and permissions",
                          "Discussion threads and comments",
                        ],
                        icon: Users,
                      },
                      {
                        title: "Progress Analytics",
                        description:
                          "Track your learning progress with detailed analytics and insights. Visualize your study patterns, identify areas for improvement, and optimize your learning strategy.",
                        features: [
                          "Personalized study dashboards",
                          "Performance tracking over time",
                          "Subject-specific analytics",
                          "Goal setting and achievement tracking",
                        ],
                        icon: BarChart,
                      },
                      {
                        title: "Schedule Management",
                        description:
                          "Stay on top of your assignments and deadlines with our intuitive calendar. Plan your study sessions, set reminders, and never miss a deadline again.",
                        features: [
                          "Smart deadline tracking",
                          "Study session scheduling",
                          "Customizable reminders",
                          "Integration with popular calendar apps",
                        ],
                        icon: Calendar,
                      },
                      {
                        title: "Secure Platform",
                        description:
                          "Your data is protected with enterprise-grade security measures. We use end-to-end encryption and follow strict privacy policies to keep your information safe.",
                        features: [
                          "End-to-end encryption",
                          "GDPR compliance",
                          "Regular security audits",
                          "Granular privacy controls",
                        ],
                        icon: Shield,
                      },
                      {
                        title: "AI-Powered Insights",
                        description:
                          "Get personalized recommendations to optimize your study habits. Our AI analyzes your learning patterns and provides tailored suggestions to help you study more effectively.",
                        features: [
                          "Personalized study recommendations",
                          "Learning style analysis",
                          "Adaptive study plans",
                          "Performance prediction",
                        ],
                        icon: Zap,
                      },
                    ][activeFeature];

                    return (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">{feature.description}</p>
                        <ul className="space-y-3">
                          {feature.features.map((featureItem, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{featureItem}</span>
                            </li>
                          ))}
                        </ul>
                        <motion.button
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium"
                        >
                          Learn more about this feature
                          <ArrowRight className="h-4 w-4" />
                        </motion.button>
                      </>
                    );
                  })()}
                </motion.div>

                <motion.div
                  key={`image-${activeFeature}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-100 dark:bg-dark-200 rounded-xl overflow-hidden shadow-lg"
                >
                  <img
                    src={[
                      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
                      "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
                      "https://images.unsplash.com/photo-1506784926709-22f1ec395907?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
                      "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
                      "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80",
                    ][activeFeature]}
                    alt="Feature showcase"
                    className="w-full h-auto"
                  />
                </motion.div>
              </div>
            </div>

            {/* Feature Grid (Simplified version) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {[
                {
                  icon: Sparkles,
                  title: "Spaced Repetition",
                  description:
                    "Optimize your memory retention with scientifically-proven spaced repetition techniques.",
                },
                {
                  icon: Star,
                  title: "Gamified Learning",
                  description: "Earn points, badges, and rewards as you complete study goals and assignments.",
                },
                {
                  icon: Lightbulb,
                  title: "Smart Suggestions",
                  description: "Receive personalized content recommendations based on your learning patterns.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 dark:bg-dark-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <feature.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" ref={benefitsRef} className="py-20 bg-gray-50 dark:bg-dark-200">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Why Choose StudyHub
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Students Love StudyHub
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join thousands of students who have transformed their academic performance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {[
                  {
                    icon: CheckCircle,
                    title: "Improved Grades",
                    description:
                      "Students report an average GPA increase of 0.5 points after using StudyHub for one semester.",
                  },
                  {
                    icon: Brain,
                    title: "Enhanced Learning Retention",
                    description: "Our spaced repetition system helps you remember more of what you study.",
                  },
                  {
                    icon: Clock,
                    title: "Time Optimization",
                    description: "Save up to 5 hours per week with our efficient study planning tools.",
                  },
                  {
                    icon: Award,
                    title: "Reduced Stress",
                    description: "Never miss a deadline again with our comprehensive assignment tracking.",
                  },
                ].map((benefit, index) => (
                  <motion.div key={index} className="flex items-start" whileHover={{ x: 5 }}>
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-4">
                      <benefit.icon className="h-6 w-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
                    alt="Student using StudyHub"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg font-medium">
                      "StudyHub transformed how I prepare for exams. My grades improved dramatically!"
                    </p>
                    <p className="text-sm opacity-80 mt-1">— Jamie Chen, Computer Science Major</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" ref={testimonialsRef} className="py-20 bg-white dark:bg-dark-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Success Stories
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Success Stories</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Hear from students who have transformed their academic journey with StudyHub.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Alex Johnson",
                  role: "Computer Science Major",
                  image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
                  quote: "StudyHub helped me organize my coding projects and study materials. My productivity increased by 40% in just one month!",
                },
                {
                  name: "Sarah Williams",
                  role: "Pre-Med Student",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
                  quote: "The analytics feature showed me exactly where I needed to focus my study time. I aced my MCAT thanks to StudyHub's insights.",
                },
                {
                  name: "Michael Chen",
                  role: "Business Administration",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80",
                  quote: "The collaborative tools made group projects so much easier to manage. Our team's efficiency improved dramatically.",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 dark:bg-dark-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" ref={faqRef} className="py-20 bg-gray-50 dark:bg-dark-200">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Common Questions
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get answers to common questions about StudyHub.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: "Is StudyHub free for students?",
                  answer:
                    "StudyHub offers a free basic plan for all students. Premium features are available with our affordable student subscription plans, with special discounts for educational institutions.",
                },
                {
                  question: "Can I access StudyHub on mobile devices?",
                  answer:
                    "Yes! StudyHub is fully responsive and works on all devices. We also offer dedicated mobile apps for iOS and Android for an optimized experience on the go.",
                },
                {
                  question: "How secure is my data on StudyHub?",
                  answer:
                    "We take data security seriously. All your data is encrypted both in transit and at rest. We never share your personal information with third parties without your explicit consent.",
                },
                {
                  question: "Can I collaborate with classmates on StudyHub?",
                  answer:
                    "Our collaboration features allow you to share notes, create study groups, and work on projects together in real-time.",
                },
                {
                  question: "How does the analytics feature work?",
                  answer:
                    "Our analytics engine tracks your study patterns, assignment completion rates, and learning progress. It then provides personalized insights and recommendations to help you optimize your study habits.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-100 rounded-lg shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full p-6 text-left"
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</h3>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-20 bg-primary-600 dark:bg-primary-700">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Study Experience?
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Join thousands of students who are already excelling with StudyHub. Get started today for free!
              </p>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 text-primary-600 bg-white rounded-lg hover:bg-gray-100 font-medium text-lg shadow-lg"
                >
                  Create Free Account
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 text-white border-2 border-white rounded-lg hover:bg-primary-700 font-medium text-lg"
                >
                  Schedule Demo
                </motion.button>
              </div>

              <p className="text-white/70 text-sm">No credit card required. Cancel anytime.</p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

