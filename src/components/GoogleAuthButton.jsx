'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Load the Google Identity Services script exactly once.
 * (We don't use next/script: when navigating between /login and /register
 * the script is already in the document, so onLoad may never fire again
 * and the button vanished until a full reload. This shared promise survives
 * client-side navigation and returns instantly when GSI is already present.)
 */
let gsiPromise = null;
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiPromise = null; // allow retry on next render
      reject(new Error('load failed'));
    };
    document.head.appendChild(script);
  });
  return gsiPromise;
}

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
  const [isNative, setIsNative] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsNative(!!(typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()));
  }, []);

  const enabled = Boolean(clientId) && !isNative;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;

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
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          onError?.('Could not load Google sign-in — check your connection or ad blocker, then reload');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, clientId, text]);

  if (!enabled) return null;

  return (
    <div className="flex min-h-[44px] items-center justify-center">
      {!ready ? (
        <div
          className="h-[44px] w-full max-w-[320px] animate-pulse rounded-full border border-line-soft bg-soft"
          aria-hidden="true"
        />
      ) : null}
      <div ref={containerRef} style={ready ? undefined : { display: 'none' }} />
    </div>
  );
}
