'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import { Lock, Loader2, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0904] text-white p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#caa02f18_0%,transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#161208] border border-[#caa02f]/30 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-6">
          <img src="/Logo_White.png" alt="Logo" className="h-16 w-auto mb-3 object-contain drop-shadow-[0_0_15px_rgba(202,160,47,0.4)]" />
          <div className="inline-block px-3 py-1 rounded-full bg-[#caa02f]/15 border border-[#caa02f]/30 text-[11px] font-bold uppercase tracking-widest text-[#caa02f] mb-2">
            AAWA PMSA Arts Fest 26-27
          </div>
          <h2 className="text-2xl font-black text-white">Admin Portal</h2>
          <p className="text-xs text-amber-100/60 mt-1">Sign in with authorized credentials</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-3 rounded-xl text-xs mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <div>
            <label className="text-xs font-bold text-amber-200/80 uppercase tracking-wider block mb-1.5">Email Address</label>
            <input
              placeholder="admin@pmsawafy.com"
              className="w-full bg-[#0e0c05] text-white border border-[#caa02f]/30 rounded-xl p-3 text-sm focus:border-[#caa02f] focus:outline-none focus:ring-1 focus:ring-[#caa02f] transition-all"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-amber-200/80 uppercase tracking-wider block mb-1.5">Password</label>
            <input
              placeholder="••••••••••••"
              className="w-full bg-[#0e0c05] text-white border border-[#caa02f]/30 rounded-xl p-3 text-sm focus:border-[#caa02f] focus:outline-none focus:ring-1 focus:ring-[#caa02f] transition-all"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full bg-[#caa02f] hover:bg-[#deb33a] text-[#0b0904] font-black py-3 px-4 rounded-xl mt-2 shadow-lg hover:shadow-[#caa02f]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-amber-200/60 hover:text-[#caa02f] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Fest Site
          </a>
        </div>
      </div>
    </div>
  )
}