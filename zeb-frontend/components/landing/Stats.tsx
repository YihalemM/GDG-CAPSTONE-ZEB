import React from 'react';

export default function Stats() {
  return (
    <section className="py-24 bg-[#0A0E14] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Trust */}
        <div className="bg-[#11161D] border border-white/5 p-12 rounded-[30px] flex flex-col justify-between">
          <div>
            <h3 className="text-4xl font-black text-white mb-6 tracking-tighter leading-none">Institutional <br/> Trust.</h3>
            <p className="text-sm text-foreground/40 font-bold mb-12 max-w-xs leading-relaxed uppercase tracking-wider">
              ZEB is used by leading galleries and private collectors to service over $400M in digital assets yearly.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center opacity-40 grayscale">
             {['GALLERIA', 'KRYPTO', 'ETHEREUM', 'MUSEUM'].map(brand => (
               <span key={brand} className="text-[10px] font-black tracking-tighter text-white border-r border-white/10 pr-4 last:border-0">{brand}</span>
             ))}
          </div>
        </div>

        {/* Middle: Stat 1 */}
        <div className="bg-[#11161D] border border-white/5 p-12 rounded-[30px] flex flex-col items-center justify-center text-center group">
          <div className="text-8xl font-black text-[#33FFEB] mb-4 tracking-tighter group-hover:scale-105 transition-transform">99.9%</div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Provenance Rate</div>
        </div>

        <div className="bg-[#11161D] border border-white/5 p-12 rounded-[30px] flex flex-col items-center justify-center text-center group">
          <div className="text-8xl font-black text-white mb-4 tracking-tighter group-hover:scale-105 transition-transform">2M+</div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Assets Vaulted</div>
        </div>
      </div>
    </section>
  );
}
