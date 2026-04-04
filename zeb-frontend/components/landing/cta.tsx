'use client';
'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-[#0F172A] rounded-[48px] py-24 px-12 text-center">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-white tracking-tight leading-tight">
              Ready to secure your <br/> creative legacy?
            </h2>
            <p className="text-lg text-slate-400 mb-12 font-bold leading-relaxed">
              Join over 10,000 artists and institutions already protecting their authorship on the ZEB network.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="px-12 py-5 bg-primary text-slate-900 font-black rounded-2xl text-md hover:bg-primary/80 transition-all tracking-tight">
                Start Registering
              </Link>
            </div>
          </div>
          
          {/* Subtle background detail */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-400/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>
    </section>
  );
}
