'use client';

import { useRouter } from 'next/navigation';
import { SparklesIcon } from './Icons';

export function WaitlistCTA() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/waitlist');
    // Alternative: Open modal when ready
    // setIsModalOpen(true);
  };

  return (
    <div className="mb-8">
      <button
        onClick={handleClick}
        className="
          group
          relative
          flex items-center gap-3
          px-5 py-3.5
          rounded-[14px]
          border border-white/15
          bg-white/10
          backdrop-blur-[12px]
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          transition-all duration-200 ease-out
          hover:scale-[1.03]
          hover:bg-white/[0.15]
          hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)]
          active:scale-[0.98]
          w-fit
        "
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <SparklesIcon className="w-5 h-5 text-emerald-400/90" />
        </div>

        {/* Text content */}
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-medium text-white/90 tracking-tight">
            Join the Waitlist
          </span>
          <span className="text-xs text-white/50">Early access to rankings & alerts</span>
        </div>

        {/* Subtle arrow indicator */}
        <svg
          className="w-4 h-4 text-white/40 ml-1 transition-transform duration-200 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
