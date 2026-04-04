'use client'

import { PlusCircle, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { UploadArtModal } from './UploadArtModal';

export function UploadArtModalTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-8 py-4 px-8 bg-primary text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-center hover:bg-primary/80 transition-all shadow-md"
      >
        <UploadCloud size={16} className="inline mr-2" />
        Upload New Asset
      </button>
      <UploadArtModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

