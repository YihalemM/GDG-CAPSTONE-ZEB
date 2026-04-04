'use client';

import React from 'react';
import { Shield, FileCheck, Award } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: 'Register',
      desc: 'Cryptographically sign your original files to establish immutable ownership of creation.',
      icon: FileCheck,
    },
    {
      title: 'Verify',
      desc: 'The protocol validates the authorship history and scans for prior existing signatures globally.',
      icon: Shield,
    },
    {
      title: 'Own',
      desc: 'Transfer, license, or archive your certified assets with total legal and digital transparency.',
      icon: Award,
    }
  ];

  return (
    <section className="py-32 bg-white flex flex-col items-center text-center">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">A Unified Ecosystem</h2>
        <p className="text-slate-500 font-bold text-sm max-w-lg mx-auto mb-20">
          Ensuring the integrity of digital creation through a transparent, three-step cryptographic process.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:border-cyan-400 group-hover:bg-cyan-50 transition-all duration-500">
                <step.icon size={32} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">{step.title}</h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
