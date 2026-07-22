'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

/**
 * Official "Sign in with Google" button (Google Identity Services).
 * Renders when GOOGLE_CLIENT_ID is configured and we're in a real browser.
 * Hidden inside the native apps: Google refuses OAuth inside embedded
 * WebViews — Phase 2 will open it in a Custom Tab / Safari view and
 * deep-link back instead.
 */
export default function GoogleAuthButton({ clientId, text = 'continue_with', onError }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(!!(typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()));
  }, []);

  const enabled = Boolean(clientId) && !isNative;

  useEffect(() => {
    if (!enabled || !scriptReady || !containerRef.current || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) throw new Error(data.error || 'Google sign-in failed');
          router.push('/dashboard');
          router.refresh();
        } catch (err) {
          onError?.(err.message || 'Google sign-in failed — please try again');
        }
      },
    });

    containerRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text,
      width: 320,
      logo_alignment: 'center',
    });
  }, [enabled, scriptReady, clientId, text, router, onError]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div className="flex min-h-[44px] items-center justify-center">
        <div ref={containerRef} />
      </div>
    </>
  );
}
