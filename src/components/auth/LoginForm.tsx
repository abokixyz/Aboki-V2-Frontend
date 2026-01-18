"use client"

import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, FingerPrintIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  // ============= HELPER FUNCTIONS =============

  const base64ToUint8Array = (base64: string): Uint8Array => {
    let base64Standard = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const padLength = (4 - (base64Standard.length % 4)) % 4;
    base64Standard += '='.repeat(padLength);
    
    const binaryString = atob(base64Standard);
    const buffer = new ArrayBuffer(binaryString.length);
    const bytes = new Uint8Array(buffer);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  };

  const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    const base64 = btoa(binary);
    
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // ============= PASSKEY LOGIN FLOW =============

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email");
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      if (!window.PublicKeyCredential) {
        throw new Error("Passkeys are not supported on this browser. Please use Chrome 108+, Safari 16+, or Edge 108+.");
      }

      console.log("🔐 Step 1: Getting login options for:", email);

      // ============= STEP 1: Get login challenge from backend =============
      const optionsResponse = await fetch(`${API_BASE_URL}/api/auth/passkey/login-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || 'Failed to get login options');
      }

      const optionsData = await optionsResponse.json();
      const { options, challenge, rpId } = optionsData.data;

      console.log("✅ Login options received:", {
        hasOptions: !!options,
        hasChallenge: !!challenge,
        rpId
      });

      if (!challenge) {
        throw new Error("No challenge received from server");
      }

      // ============= STEP 2: Authenticate with passkey =============
      console.log("👆 Step 2: Requesting biometric authentication...");
      setSuccess("Please authenticate with your biometric...");

      const challengeBuffer = base64ToUint8Array(challenge);

      let credential;
      try {
        credential = await navigator.credentials.get({
          publicKey: {
            challenge: challengeBuffer as BufferSource,
            rpId: rpId,
            timeout: 120000,
            userVerification: "required"
          }
        }) as any;
      } catch (credError: any) {
        console.error("❌ Passkey authentication failed:", credError);
        
        if (credError.name === "NotAllowedError") {
          throw new Error("Authentication was cancelled. Please try again.");
        } else if (credError.name === "InvalidStateError") {
          throw new Error("No passkey found for this device. Please sign up first or use a different device.");
        } else if (credError.name === "TimeoutError") {
          throw new Error("Authentication timed out. Please try again.");
        } else if (credError.name === "NotSupportedError") {
          throw new Error("Your device doesn't support passkeys.");
        } else {
          throw new Error("Failed to authenticate: " + (credError.message || "Please try again."));
        }
      }

      if (!credential) {
        throw new Error("Failed to authenticate with passkey");
      }

      console.log("✅ Passkey verified on device");

      // ============= STEP 3: Prepare passkey data =============
      const passkeyData = {
        id: credential.id,
        rawId: uint8ArrayToBase64(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          clientDataJSON: uint8ArrayToBase64(new Uint8Array(credential.response.clientDataJSON)),
          authenticatorData: uint8ArrayToBase64(new Uint8Array(credential.response.authenticatorData)),
          signature: uint8ArrayToBase64(new Uint8Array(credential.response.signature)),
          userHandle: credential.response.userHandle ? uint8ArrayToBase64(new Uint8Array(credential.response.userHandle)) : null
        }
      };

      // ============= STEP 4: Send to backend with challenge =============
      console.log("📤 Step 4: Sending login request to server");
      setSuccess("Verifying authentication...");

      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          passkey: passkeyData,
          challenge: challenge // ✅ Send the challenge we received from backend
        }),
      });

      let data;
      try {
        const text = await loginResponse.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        throw new Error("Server returned invalid response");
      }

      console.log("📥 Login response:", { status: loginResponse.status, success: data.success });

      if (!loginResponse.ok) {
        const errorMessage = data.error || data.message || "Passkey login failed";
        console.error("❌ Login failed:", errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.data?.token) {
        throw new Error("No token received from server");
      }

      // ============= STEP 5: Store user data =============
      const userData = {
        id: data.data.user?._id || "",
        username: data.data.user?.username || "",
        name: data.data.user?.name || "User",
        email: data.data.user?.email || email
      };

      console.log("✅ Auth token received, logging in:", userData.username);

      login(data.data.token, userData);
      
      setSuccess("🎉 Welcome back! Logging you in...");
      setTimeout(() => onSuccess(), 1500);

    } catch (err: any) {
      console.error("Passkey login error:", err);
      setError(err.message || "Passkey authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 animate-slide-in">
          <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl flex items-start gap-3 animate-slide-in">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto bg-[#D364DB] rounded-full flex items-center justify-center shadow-lg">
          <FingerPrintIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Welcome Back!
        </h2>
        <p className="text-gray-600 dark:text-white/80">
          Authenticate with your passkey
        </p>
      </div>

      {/* Email input */}
      <div>
        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !loading && email.trim()) {
              handlePasskeyLogin();
            }
          }}
          placeholder="your@email.com"
          disabled={loading}
          className="w-full px-4 py-3 bg-[#2d2d2d] dark:bg-[#2d2d2d] border-2 border-[#3d3d3d] dark:border-[#3d3d3d] rounded-xl focus:border-[#D364DB] dark:focus:border-[#D364DB] focus:outline-none text-white dark:text-white placeholder:text-white/50 dark:placeholder:text-white/50 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Login button */}
      <button
        onClick={handlePasskeyLogin}
        disabled={loading || !email.trim()}
        className="w-full py-4 bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Authenticating...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FingerPrintIcon className="w-5 h-5" />
            Login with Passkey
          </span>
        )}
      </button>

      {/* Info boxes */}
      <div className="space-y-3">
        <div className="bg-purple-50 dark:bg-[#D364DB]/20 rounded-xl p-4 border border-purple-200 dark:border-[#D364DB]/30">
          <div className="flex items-start gap-3">
            <FingerPrintIcon className="w-5 h-5 text-[#D364DB] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Secure Passkey Login
              </h4>
              <p className="text-xs text-gray-600 dark:text-white/80 leading-relaxed">
                Your device will prompt you to verify your identity using Face ID, Touch ID, or Windows Hello. This is more secure than passwords and can't be phished.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-500/20 rounded-xl p-4 border border-blue-200 dark:border-blue-500/30">
          <p className="text-xs text-gray-600 dark:text-white/80 leading-relaxed">
            <strong className="font-bold text-gray-900 dark:text-white">New device?</strong> Your passkey is stored on the device you used to sign up. If you're on a different device, you'll need to use the same device or set up a new passkey.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}