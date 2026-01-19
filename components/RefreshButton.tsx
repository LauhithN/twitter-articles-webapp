'use client'

import { useState } from 'react'

export function RefreshButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRefresh() {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/refresh', { method: 'POST' })

      if (response.ok) {
        setMessage('Refresh queued')
        setTimeout(() => setMessage(null), 3000)
      } else if (response.status === 429) {
        setMessage('Rate limited')
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage('Error')
        setTimeout(() => setMessage(null), 3000)
      }
    } catch {
      setMessage('Error')
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className="border-2 border-black px-3 py-1 text-meta font-mono hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'LOADING...' : 'REFRESH'}
      </button>
      {message && (
        <span className="text-meta text-accent font-mono">{message}</span>
      )}
    </div>
  )
}
