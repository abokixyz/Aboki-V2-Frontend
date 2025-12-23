"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  FingerPrintIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://apis.aboki.xyz";

/* =======================
   TYPES
======================= */

interface Passkey {
  credentialID?: string;
  publicKey?: string;
  createdAt?: string;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  wallet: {
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
  };
  passkey?: Passkey | null;
  createdAt: string;
}

type Step =
  | "check"
  | "setup"
  | "has_passkey"
  | "loading"
  | "success"
  | "error"
  | "removing";

/* =======================
   COMPONENT
======================= */

export default function PasskeySetupPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("check");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [userData, setUserData] = useState<User | null>(null);
  const [hasExistingPasskey, setHasExistingPasskey] = useState(false);

  /* =======================
     AUTH CHECK
  ======================= */

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.getUserProfile();

        if (response.success && response.data) {
          const user = response.data as User;

          setUserData(user);

          const userHasPasskey = Boolean(user.passkey?.credentialID);
          setHasExistingPasskey(userHasPasskey);

          setStep(userHasPasskey ? "has_passkey" : "setup");
        }
      } catch (err) {
        console.error("Error checking user:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  /* =======================
     HELPERS
  ======================= */

  const base64ToUint8Array = (base64: string): Uint8Array => {
    let base64Standard = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (base64Standard.length % 4)) % 4;
    base64Standard += "=".repeat(padLength);

    const binaryString = atob(base64Standard);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  };

  const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
    let binary = "";
    buffer.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

  const isPasskeySupported = () =>
    typeof window !== "undefined" &&
    "PublicKeyCredential" in window &&
    "credentials" in navigator;

  /* =======================
     REMOVE PASSKEY
  ======================= */

  const handleRemovePasskey = async () => {
    setError("");
    setStep("removing");
    setStatusMessage("Removing existing passkey...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/passkey/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiClient.getToken()}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove passkey");
      }

      setHasExistingPasskey(false);
      setStep("setup");
    } catch (err: any) {
      setError(err.message || "Failed to remove passkey");
      setStep("has_passkey");
    }
  };

  /* =======================
     SETUP PASSKEY
  ======================= */

  const handleSetupPasskey = async () => {
    if (!userData) return;

    setError("");
    setStep("loading");
    setStatusMessage("Preparing biometric setup...");

    try {
      if (!isPasskeySupported()) {
        throw new Error("Your browser does not support passkeys.");
      }

      const optionsRes = await fetch(
        `${API_BASE_URL}/api/auth/passkey/setup-options`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        }
      );

      const { data } = await optionsRes.json();
      const challengeBuffer = base64ToUint8Array(data.challenge);

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer,
          rp: data.options.rp,
          user: {
            id: new TextEncoder().encode(userData.email),
            name: userData.email,
            displayName: userData.name,
          },
          pubKeyCredParams: data.options.pubKeyCredParams,
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            residentKey: "preferred",
            userVerification: "preferred",
          },
        },
      })) as PublicKeyCredential;

      const response = credential.response as AuthenticatorAttestationResponse;

      await fetch(`${API_BASE_URL}/api/auth/passkey/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify({
          passkey: {
            id: credential.id,
            rawId: uint8ArrayToBase64(new Uint8Array(credential.rawId)),
            type: credential.type,
            response: {
              clientDataJSON: uint8ArrayToBase64(
                new Uint8Array(response.clientDataJSON)
              ),
              attestationObject: uint8ArrayToBase64(
                new Uint8Array(response.attestationObject)
              ),
            },
            challenge: data.challenge,
          },
        }),
      });

      setStep("success");
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to setup passkey");
      setStep("error");
    }
  };


