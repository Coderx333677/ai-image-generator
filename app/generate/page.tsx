'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // Adjust if your client file path is different

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 5: Function to call Supabase Edge Function
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError('')
    setImageUrl('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Please log in first.')
        setLoading(false)
        return
      }

      // Supabase Edge Function Call
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ prompt }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image')
      }

      setImageUrl(result.signedUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Image Generator</h1>

      <form onSubmit={handleGenerate} className="flex gap-3 mb-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic cyberpunk city at sunset..."
          className="flex-1 p-3 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-900/40 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {imageUrl && (
        <div className="mt-6 border border-gray-800 rounded-xl overflow-hidden bg-gray-900">
          <img src={imageUrl} alt={prompt} className="w-full h-auto object-cover" />
        </div>
      )}
    </div>
  )
}