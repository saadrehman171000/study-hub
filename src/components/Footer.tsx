import { motion } from 'framer-motion';
import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">StudyHub</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Empowering students to achieve academic excellence through smart study tools and collaboration.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  About
                </a>
              </li>
              <li>
                <a href="#careers" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} StudyHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}