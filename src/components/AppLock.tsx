import { Fingerprint } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const CRED_KEY = "ourspace.lock.credentialId";
const SESSION_KEY = "ourspace.lock.unlocked";

function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

export function isLockEnabled() {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(CRED_KEY);
}

export async function enableAppLock(userName: string) {
  if (!window.PublicKeyCredential) throw new Error("This device doesn't support biometric unlock.");
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Our Space", id: window.location.hostname },
      user: { id: userId, name: userName, displayName: userName },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Couldn't set up biometric unlock.");
  window.localStorage.setItem(CRED_KEY, toBase64(credential.rawId));
  window.sessionStorage.setItem(SESSION_KEY, "1");
}

export function disableAppLock() {
  window.localStorage.removeItem(CRED_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

async function verify() {
  const stored = window.localStorage.getItem(CRED_KEY);
  if (!stored) return true;
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ type: "public-key", id: fromBase64(stored) }],
      userVerification: "required",
      timeout: 60_000,
    },
  });
  return !!assertion;
}

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isLockEnabled() && window.sessionStorage.getItem(SESSION_KEY) !== "1") setLocked(true);
  }, []);

  const unlock = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const ok = await verify();
      if (!ok) throw new Error("Unlock cancelled.");
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setLocked(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unlock failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  if (!locked) return <>{children}</>;

  return (
    <div className="hero-gradient flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center">
      <Fingerprint className="size-14 text-primary-foreground" />
      <div>
        <h1 className="font-display text-3xl text-primary-foreground">Our Space is locked</h1>
        <p className="mt-2 text-sm text-primary-foreground/80">
          Unlock with Face ID or your device passcode.
        </p>
      </div>
      <Button variant="secondary" size="lg" onClick={unlock} disabled={busy}>
        {busy ? "Waiting…" : "Unlock"}
      </Button>
      {error ? <p className="text-sm text-primary-foreground/80">{error}</p> : null}
    </div>
  );
}
