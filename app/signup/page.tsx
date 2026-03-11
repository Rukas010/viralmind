'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth'
import { Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await signUp(email, password, displayName)

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Account created!')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-gray-400">Start making viral videos in 60 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur p-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="Your name or channel name" className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Account'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}