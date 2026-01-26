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
    <div className="mb-12 mt-8">
      <button
        onClick={handleClick}
        className="
          group
          relative
          w-full
          flex items-center justify-center gap-4
          px-8 py-6
          rounded-2xl
          border border-emerald-400/30
          bg-gradient-to-br from-emerald-400/[0.15] to-sky-400/[0.10]
          backdrop-blur-[14px]
          shadow-[0_0_40px_rgba(52,211,153,0.15),0_8px_32px_rgba(0,0,0,0.2)]
          transition-all duration-300 ease-out
          hover:scale-[1.02]
          hover:shadow-[0_0_60px_rgba(52,211,153,0.25),0_12px_48px_rgba(0,0,0,0.3)]
          hover:border-emerald-400/50
          active:scale-[0.99]
          overflow-hidden
        "
      >
        {/* Animated gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content container */}
        <div className="relative flex items-center justify-center gap-4">
          {/* Icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/40 blur-xl rounded-full" />
            <div className="relative p-3 rounded-full bg-emerald-400/20 border border-emerald-400/30">
              <SparklesIcon className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-lg font-semibold text-white tracking-tight">
              Join the Waitlist
            </span>
            <span className="text-sm text-white/60">Early access to rankings & alerts</span>
          </div>

          {/* Arrow indicator */}
          <svg
            className="w-5 h-5 text-emerald-400/70 ml-2 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      </button>
    </div>
  );
}
