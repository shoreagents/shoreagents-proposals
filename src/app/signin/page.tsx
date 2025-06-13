'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignIn() {
  const [supabase] = useState(() => createClient())
  const [redirectUrl, setRedirectUrl] = useState('/')
  const router = useRouter()

  useEffect(() => {
    // Set redirect URL on client side
    if (typeof window !== 'undefined') {
      setRedirectUrl(`${window.location.origin}/`)
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  background: '#1f2937',
                  color: 'white',
                  borderRadius: '0.5rem',
                },
                anchor: {
                  color: '#1f2937',
                },
              }
            }}
            providers={[]}
            redirectTo={redirectUrl}
            onlyThirdPartyProviders={false}
            magicLink={false}
            view="sign_in"
            showLinks={false}
          />
        </div>
      </div>
    </div>
  )
} 