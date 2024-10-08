"use client";
import React, { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'
import { Input } from "./input"
import { Button } from "./button"
import { useRouter } from 'next/navigation'
import { AuthError } from '@supabase/supabase-js'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in, redirecting...');
        router.push('/');
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const validateForm = () => {
    let isValid = true
    setEmailError('')
    setPasswordError('')

    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid')
      isValid = false
    }

    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      isValid = false
    }

    return isValid
  }

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      if (isSignUp) {
        console.log('Attempting sign up...');
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              // You can add additional user metadata here
            }
          }
        });

        if (error) throw error;
        if (data.user) {
          // Automatically sign in the user after sign up
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          router.push('/');
        } else {
          setConfirmEmail(true);
        }
      } else {
        console.log('Attempting sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log('Sign in result:', { data, error });
        if (error) throw error;
        console.log('Sign in successful, redirecting...');
        router.push('/');
      }
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      if (error instanceof AuthError) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setLoading(false)
    }
  }

  if (confirmEmail) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Confirm your email</h2>
        <p>We&apos;ve sent you an email to confirm your account. Please check your inbox and click the confirmation link.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Emoji Maker</h1>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <Input
              className="w-full"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div>
            <Input
              className="w-full"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>
        <Button 
          className="w-full mt-4" 
          onClick={() => setIsSignUp(!isSignUp)} 
          variant="outline"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Button>
        <div className="mt-4 text-center">
          <span className="text-gray-600">Or</span>
        </div>
        <Button className="w-full mt-4" onClick={handleGoogleLogin} disabled={loading}>
          Sign In with Google
        </Button>
      </div>
    </div>
  )
}