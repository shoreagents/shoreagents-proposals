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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 signin-page">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-gray-500 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Access your proposal dashboard</p>
          </div>

          <Auth
            supabaseClient={supabase}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email Address',
                  password_label: 'Password',
                },
              },
            }}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                                            brand: '#7EAC0B',
                        brandAccent: '#97BC34',
                        brandButtonText: '#ffffff',
                        inputBackground: '#ffffff',
                        inputBorder: '#d1d5db',
                        inputBorderFocus: '#6b7280',
                  },
                  fonts: {
                    bodyFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    buttonFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    inputFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                    labelFontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '16px',
                    baseLabelSize: '14px',
                    baseButtonSize: '16px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                                        radii: {
                        borderRadiusButton: '12px',
                        buttonBorderRadius: '12px',
                        inputBorderRadius: '6px',
                      },
                },
              },
              style: {
                                    button: {
                      background: '#7EAC0B',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '8px 24px',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      border: '1px solid #7EAC0B',
                      cursor: 'pointer',
                    },
                                    input: {
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                    },
                label: {
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                },
                message: {
                  fontSize: '14px',
                  marginTop: '6px',
                },
                anchor: {
                  display: 'none',
                },
                divider: {
                  display: 'none',
                },
                container: {
                  gap: '16px',
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