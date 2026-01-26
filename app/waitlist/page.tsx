'use client';

import { useState, FormEvent } from 'react';
import { SparklesIcon } from '@/components/Icons';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          twitter_handle: twitterHandle.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join waitlist');
        return;
      }

      setSuccess(true);
      setEmail('');
      setTwitterHandle('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Success State */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
              <p className="text-emerald-400 font-medium">You&apos;re on the list!</p>
              <p className="text-white/60 text-sm mt-1">
                We&apos;ll notify you when you&apos;re in.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-400/10 border border-red-400/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            />

            <input
              type="text"
              placeholder="X handle (optional)"
              value={twitterHandle}
              onChange={e => setTwitterHandle(e.target.value)}
              disabled={isLoading}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            />

            <button
              type="submit"
              disabled={isLoading}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:scale-100
              "
            >
              {isLoading ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>

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
