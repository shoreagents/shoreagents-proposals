'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignIn() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
        return;
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 rounded-lg border border-gray-200">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
              style: {
                button: {
                  background: '#2563eb',
                  borderRadius: '9999px',
                  padding: '8px 16px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                },
                anchor: {
                  display: 'none',
                },
                divider: {
                  display: 'none',
                },
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/`}
            onlyThirdPartyProviders={false}
            magicLink={false}
            view="sign_in"
            showLinks={false}
          />
        </div>
      </div>
    </div>
  );
} 