'use client';

import { CampaignBrowser } from '@/components/CampaignBrowser';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - Phase 3: Dark Mode - FIXED: Removed dark:text-gray-900 causing invisibility */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Critical Role Companion
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Explore campaigns, characters, and episodes from your favorite stories
          </p>
        </div>
      </div>

      {/* Campaign Browser */}
      <CampaignBrowser />

      {/* Footer - Phase 3: Dark Mode */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-16 sm:py-20 mt-16 sm:mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="animate-fade-in-stagger">
              <h3 className="text-white font-bold text-lg mb-4">About</h3>
              <p className="text-base leading-relaxed text-gray-400">
                Critical Role Companion is a campaign hub for exploring characters, episodes, and stories.
              </p>
            </div>
            <div className="animate-fade-in-stagger delay-100">
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="text-base space-y-3">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Admin Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="animate-fade-in-stagger delay-200">
              <h3 className="text-white font-bold text-lg mb-4">Info</h3>
              <p className="text-base leading-relaxed text-gray-400">
                Created with care for campaign creators and storytellers.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-base text-gray-400">
            <p>&copy; {new Date().getFullYear()} Critical Role Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}