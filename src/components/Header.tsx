"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react"
import { BookOpen, Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isLandingPage = location.pathname === "/"

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Smooth scroll to section when clicking on nav links
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 dark:bg-dark-100/95 backdrop-blur-sm shadow-sm" : "bg-transparent dark:bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">StudyHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isLandingPage && (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("benefits")}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Benefits
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Testimonials
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  FAQ
                </button>
              </>
            )}

            <SignedIn>
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
              >
                Dashboard
              </Link>
            </SignedIn>
          </nav>

          <div className="flex items-center space-x-4">
            <SignedIn>
              <div className="hidden md:block">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden md:block px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {isLandingPage && (
              <>
                <button
                  onClick={() => scrollToSection("features")}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("benefits")}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Benefits
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Testimonials
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  FAQ
                </button>
              </>
            )}

            <SignedIn>
              <Link
                to="/dashboard"
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="py-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full mt-4 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  )
}

