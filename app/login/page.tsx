
import { Suspense } from 'react'
import { login, signup } from './actions'

type Props = {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

function LoginFallback() {
  return <main className="p-8">Loading login page...</main>
}

async function LoginContent({ searchParams }: Props) {
  const params = await searchParams

  const errors: Record<string, string> = {
    'missing-fields': 'Enter your email and password.',
    'authentication-failed': 'Invalid email or password.',
    'weak-password': 'Password must be at least 8 characters.',
    'signup-failed': 'Could not create your account. Try again.',
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <h1 className="text-3xl font-bold">AI Studio</h1>

      <p className="text-gray-500">
        Sign in or create your account.
      </p>

      {params.error && (
        <p role="alert" className="text-red-600">
          {errors[params.error] ?? 'Something went wrong.'}
        </p>
      )}

      {params.message === 'check-email' && (
        <p role="status" className="text-green-700">
          Check your email to confirm your account.
        </p>
      )}

      <form action={login} className="space-y-3">
        <h2 className="font-semibold">Sign in</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full rounded-lg border p-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-black p-3 text-white"
        >
          Sign in
        </button>
      </form>

      <hr />

      <form action={signup} className="space-y-3">
        <h2 className="font-semibold">Create account</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full rounded-lg border p-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Password (minimum 8 characters)"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          className="w-full rounded-lg border p-3"
        >
          Sign up
        </button>
      </form>
    </main>
  )
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}
