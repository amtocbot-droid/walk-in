"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_ESTABLISHMENTS } from "@/lib/demos";
import { trackEvent } from "@/lib/telemetry";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDemoClick = (demoId: string) => {
    trackEvent("landing.demo_click", { demoId });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface text-on-background font-body-md">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="blob bg-primary-fixed/30 w-[600px] h-[600px] top-[-200px] left-[-200px]"></div>
        <div className="blob bg-tertiary-fixed-dim/20 w-[800px] h-[800px] bottom-[-300px] right-[-200px]"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl font-body-md text-body-md fixed top-0 w-full z-50 border-b border-glass-stroke shadow-sm transition-all duration-300 hover:bg-primary-fixed/10">
        <div className="flex justify-between items-center max-w-container-max mx-auto px-gutter h-20">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-deep-navy tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">view_in_ar</span>
            </div>
            Walk In
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/demo" className="text-slate-700 hover:text-electric-blue transition-colors">3D Stores</Link>
            <Link href="/demo" className="text-slate-700 hover:text-electric-blue transition-colors">Inventory</Link>
            <Link href="/demo" className="text-slate-700 hover:text-electric-blue transition-colors">AI Guide</Link>
            <Link href="/pricing" className="text-slate-700 hover:text-electric-blue transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-slate-700 hover:text-deep-navy font-semibold transition-colors hidden sm:block">Login</Link>
            <Link href="/signup" className="bg-sky-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 active:scale-95">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-gutter flex flex-col items-center text-center mt-margin-desktop mb-section-gap pt-32">
        <div className={`transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-electric-blue/20 mb-8 text-electric-blue text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-electric-blue animate-pulse"></span>
            Next-generation 3D commerce
          </div>
          <h1 className="font-display-xl text-display-xl max-w-4xl mb-6 text-deep-navy">
            Walk into any <br/>
            <span className="text-electric-blue">establishment</span>
          </h1>
          <p className="font-body-lg text-body-lg text-slate-700 max-w-2xl mb-10">
            Experience photorealistic 3D stores with live inventory, AI guidance, and seamless shopping. From coffee shops to libraries, explore any space from your browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/demo" className="bg-sky-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 active:scale-95 text-lg">
              Explore Demos
            </Link>
            <Link href="/signup" className="glass-card text-deep-navy px-8 py-4 rounded-full font-semibold hover:bg-white transition-all shadow-sm hover:shadow-md active:scale-95 text-lg border border-outline-variant/30">
              Start Free Trial
            </Link>
          </div>
          <div className="flex gap-16 mt-20 text-deep-navy border-t border-outline-variant/20 pt-8 w-full max-w-3xl justify-center">
            <div>
              <div className="font-headline-lg text-headline-lg text-electric-blue">6+</div>
              <div className="font-label-sm text-label-sm text-slate-700 mt-1">Virtual Environments</div>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-electric-blue">360°</div>
              <div className="font-label-sm text-label-sm text-slate-700 mt-1">Spatial Navigation</div>
            </div>
            <div>
              <div className="font-headline-lg text-headline-lg text-electric-blue">AI</div>
              <div className="font-label-sm text-label-sm text-slate-700 mt-1">Guided Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid (Bento Style) */}
      <section className="max-w-container-max mx-auto px-gutter mb-section-gap">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-deep-navy mb-4">Core Pillars</h2>
          <p className="font-body-lg text-body-lg text-slate-700">The foundation of immersive digital retail.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Pillar 1: Photorealistic 3D Stores */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden group col-span-1 lg:col-span-2 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/80 to-transparent z-10"></div>
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 z-0" alt="Photorealistic 3D store" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU22VE_Rs6SrgJtkG1o9286nTICXDWyP5NgjoXyCzgXG9cn6lZuK-QCIj8x6fc2put473pDrToHj33DFdQa3DI8GgX280Xvyc5Tc0GTIqhwHFYYuTHPnAiqPwxyBR2OGefNuRlxY7Wx1usVQFAcLWwwGJH2ek3q7oh7mwV9PbO9DUfiJO4-UDa8t2aIVB5wtLc-GyCVZ6ZgCPHTG88LytuDKZ1yz4u0qnNKU-6ZxC1DZ2uvPV_dG3TMg"/>
            <div className="relative z-20 text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-white">storefront</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2">Photorealistic 3D Stores</h3>
              <p className="text-white/80">Step into meticulously crafted digital twins of real-world locations, rendered in stunning detail directly in your browser.</p>
            </div>
          </div>
          {/* Pillar 2: Live Inventory */}
          <div className="glass-card rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="w-12 h-12 rounded-full bg-electric-blue/10 text-electric-blue flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold text-deep-navy mb-3">Live Inventory</h3>
            <p className="text-slate-700 text-sm">Real-time synchronization ensures what you see on the virtual shelf is exactly what&apos;s available in the warehouse. No discrepancies, just data.</p>
          </div>
          {/* Pillar 3: AI-Powered Guidance */}
          <div className="glass-card rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-tertiary-container/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
            <div className="w-12 h-12 rounded-full bg-tertiary-container/10 text-tertiary-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined">robot_2</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold text-deep-navy mb-3">AI-Powered Guidance</h3>
            <p className="text-slate-700 text-sm">Your personal shopping assistant. Our AI concierge helps navigate the 3D space, suggests items, and answers questions instantly.</p>
          </div>
          {/* Pillar 4: Seamless Browser Shopping */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-shadow col-span-1 lg:col-span-2 bg-gradient-to-br from-white to-surface-container-low">
            <div className="flex justify-between items-start">
              <div>
                <div className="w-12 h-12 rounded-full bg-deep-navy text-white flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </div>
                <h3 className="font-headline-md text-2xl font-bold text-deep-navy mb-3">Seamless Browser Shopping</h3>
                <p className="text-slate-700 max-w-md">No downloads, no apps. Experience full 3D spatial commerce smoothly on any modern web browser across devices.</p>
              </div>
              <div className="hidden sm:flex -space-x-4">
                <div className="w-16 h-16 rounded-full bg-white shadow-md border border-outline-variant/20 flex items-center justify-center z-20">
                  <span className="material-symbols-outlined text-electric-blue">credit_card</span>
                </div>
                <div className="w-16 h-16 rounded-full bg-white shadow-md border border-outline-variant/20 flex items-center justify-center z-10">
                  <span className="material-symbols-outlined text-slate-text">local_shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Showcase */}
      <section className="max-w-container-max mx-auto px-gutter mb-section-gap">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-deep-navy mb-4">Explore Demo Establishments</h2>
          <p className="font-body-lg text-body-lg text-slate-700">Experience different business types in immersive 3D.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_ESTABLISHMENTS.map((demo) => (
            <Link
              key={demo.id}
              href={`/demo?type=${demo.id}`}
              onClick={() => handleDemoClick(demo.id)}
              className="glass-card rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative z-10">
                <div className="mb-3 inline-block rounded-lg bg-electric-blue/10 px-3 py-1 text-xs font-medium text-electric-blue">
                  {demo.type}
                </div>
                <h3 className="font-headline-md text-xl font-bold text-deep-navy mb-2">{demo.name}</h3>
                <p className="text-slate-700 text-sm mb-4">{demo.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{demo.products.length} items</span>
                  <span className="text-sm text-electric-blue transition-transform group-hover:translate-x-1">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-container-max mx-auto px-gutter mb-section-gap text-center">
        <div className="glass-card rounded-2xl p-12 shadow-lg">
          <h2 className="font-headline-lg text-headline-lg text-deep-navy mb-4">Ready to transform your establishment?</h2>
          <p className="font-body-lg text-body-lg text-slate-700 mb-8">
            Join the future of commerce with immersive 3D experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-sky-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 active:scale-95 text-lg">
              Start Free Trial
            </Link>
            <Link href="/demo" className="glass-card text-deep-navy px-8 py-4 rounded-full font-semibold hover:bg-white transition-all shadow-sm hover:shadow-md active:scale-95 text-lg border border-outline-variant/30">
              View Demos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface font-label-sm text-label-sm w-full py-stack-lg border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto px-gutter gap-stack-md">
          <div className="font-headline-md text-headline-md font-bold text-deep-navy flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-electric-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">view_in_ar</span>
            </div>
            Walk In
          </div>
          <div className="flex gap-6 flex-wrap justify-center">
            <a href="#" className="text-slate-700 hover:text-electric-blue hover:underline transition-all opacity-80 hover:opacity-100">Privacy Policy</a>
            <a href="#" className="text-slate-700 hover:text-electric-blue hover:underline transition-all opacity-80 hover:opacity-100">Terms of Service</a>
            <a href="#" className="text-slate-700 hover:text-electric-blue hover:underline transition-all opacity-80 hover:opacity-100">Contact</a>
            <a href="#" className="text-slate-700 hover:text-electric-blue hover:underline transition-all opacity-80 hover:opacity-100">Documentation</a>
          </div>
          <div className="text-slate-600">
            © 2026 Walk In. The Future of Commerce.
          </div>
        </div>
      </footer>
    </main>
  );
}
