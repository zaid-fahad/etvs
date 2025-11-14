"use client";

import React from "react";

// Using a deep navy blue and a gold accent for a professional university feel.
const BRAND_PRIMARY = "bg-blue-900"; // Deep Navy/Indigo
const BRAND_ACCENT = "text-amber-400"; // Gold/Amber

interface VerificationLayoutProps {
  children: React.ReactNode;
}

/**
 * Provides a full-width, branded header and layout wrapper for the verification page 
 * with a correctly positioned sticky footer.
 */
export default function VerificationLayout({
  children,
}: VerificationLayoutProps) {
  return (
    // 1. Outer wrapper: Full height, flex column, background applies to whole screen
    <div className="min-h-svh flex flex-col bg-slate-100 font-sans">
      
      {/* 2. Content Wrapper: Takes up vertical space (flex-grow) 
          and now uses full width without horizontal padding */}
      <div className="flex-grow flex w-full"> 
        
        {/* 3. The Content Card: Now uses full width and has no rounded corners/shadows 
           to blend seamlessly with the edges of the screen. */}
        <div 
          className={`bg-white w-full transition duration-300`}
        >
          
          {/* BRANDING HEADER */}
          <header className={`text-center p-8 ${BRAND_PRIMARY} text-white`}>
            <div className="flex flex-col items-center justify-center">
              <div
                className={`h-16 w-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-xl`}
              >
                <span
                  className={`text-3xl font-extrabold ${BRAND_PRIMARY} p-2 rounded-full`}
                >
                  IUB
                </span>
              </div>
              <p className="text-sm font-light uppercase tracking-widest opacity-80">
                Department of Student Activities
              </p>
              <h2 className="text-2xl font-extrabold mt-0.5">
                Independent University, Bangladesh
              </h2>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <h1 className={`text-xl font-bold ${BRAND_ACCENT}`}>
                  ETVS (Events Tracking and Verification System)
              </h1>
            </div>
          </header>

          {/* MAIN CONTENT AREA (Children) 
              Applying a max-width here is often a good practice even in full-width 
              layouts, but it's now internal to the padding. */}
          <main className="">
            {children}
          </main>
        </div>
      </div>
      
      {/* 4. STICKY FOOTER: Full width and stuck to the bottom */}
      <footer className={`text-center p-4 ${BRAND_PRIMARY} text-white`}>
          <p className="text-sm font-medium opacity-80">
              &copy; {new Date().getFullYear()} Independent University, Bangladesh. 
              All rights reserved.
          </p>
      </footer>
    </div>
  );
}