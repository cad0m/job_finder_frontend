import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container relative">
      <div className="fixed inset-0 noise-overlay pointer-events-none z-[100]"></div>
      <div className="fixed top-0 left-0 w-full h-[1px] bg-surface-bright/20 pointer-events-none z-[60]"></div>
      
      <Navbar />

      <main className="relative min-h-screen overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 grid-mesh pointer-events-none"></div>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
