import { SparklesIcon } from '@/components/Icons';

export default function WaitlistPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div
          className="
            glass-highlight
            rounded-2xl
            p-8
            text-center
          "
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-emerald-400/10">
              <SparklesIcon className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-semibold text-white/90 mb-3">Join the Waitlist</h1>

          {/* Description */}
          <p className="text-white/60 mb-8">
            Get early access to advanced rankings, personalized alerts, and exclusive features.
            We&apos;ll notify you when you&apos;re in.
          </p>

          {/* Placeholder for form */}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="
                w-full
                px-4 py-3
                rounded-xl
                glass
                text-white/90
                placeholder:text-white/40
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-400/50
                transition-all
              "
            />

            <button
              className="
                w-full
                px-4 py-3
                rounded-xl
                bg-emerald-400/90
                hover:bg-emerald-400
                text-gray-900
                font-medium
                transition-all
                hover:scale-[1.02]
                active:scale-[0.98]
              "
            >
              Join Waitlist
            </button>
          </div>

          {/* Back link */}
          <a
            href="/"
            className="
              inline-block
              mt-6
              text-sm
              text-white/50
              hover:text-white/70
              transition-colors
            "
          >
            ← Back to articles
          </a>
        </div>
      </div>
    </div>
  );
}
