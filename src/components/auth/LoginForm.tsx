"use client"

import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, FingerPrintIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

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

      console.log("🔐 Attempting passkey login for:", email);

      // ============= STEP 1: Generate challenge =============
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      // Convert challenge to base64url for backend
      const challengeBase64Url = arrayBufferToBase64(challenge.buffer);

      console.log("🔑 Challenge generated:", {
        length: challenge.length,
        base64Length: challengeBase64Url.length
      });

      // ============= STEP 2: Get passkey from device =============
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 120000,
        rpId: window.location.hostname === "localhost" ? "localhost" : window.location.hostname,
        userVerification: "preferred"
      };

      let credential;
      try {
        credential = await navigator.credentials.get({
          publicKey: publicKeyOptions
        }) as any;
      } catch (credError: any) {
        console.error("❌ Passkey authentication failed:", credError);
        
        if (credError.name === "NotAllowedError") {
          throw new Error("Authentication was cancelled. Please try again and approve the biometric prompt.");
        } else if (credError.name === "InvalidStateError") {
          throw new Error("No passkey found for this device. Please sign up first or use a different device.");
        } else if (credError.name === "TimeoutError" || credError.message?.includes("timed out")) {
          throw new Error("Authentication timed out. Please try again and complete the biometric prompt quickly (you have 2 minutes).");
        } else if (credError.name === "NotSupportedError") {
          throw new Error("Your device doesn't support passkeys. Please use a device with Face ID, Touch ID, or Windows Hello.");
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
        rawId: arrayBufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
          authenticatorData: arrayBufferToBase64(credential.response.authenticatorData),
          signature: arrayBufferToBase64(credential.response.signature)
        }
        // ✅ DO NOT include challenge in passkeyData
      };

      // ============= STEP 4: Send to backend with challenge =============
      console.log("📤 Sending login request to server with challenge");

      const response = await fetch("https://apis.aboki.xyz/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email,
          passkey: passkeyData,
          challenge: challengeBase64Url // ✅ SEND CHALLENGE AS SEPARATE FIELD
        }),
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        throw new Error("Server returned invalid response");
      }

      console.log("📥 Login response:", { status: response.status, success: data.success });

      if (!response.ok) {
        const errorMessage = data.error || data.message || "Passkey login failed";
        console.error("❌ Login failed:", errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.data?.token) {
        throw new Error("No token received from server");
      }

      // ✅ Extract user data from response
      const userData = {
        id: data.data.user?._id || "",
        username: data.data.user?.username || "",
        name: data.data.user?.name || "User",
        email: data.data.user?.email || email
      };

      console.log("✅ Auth token received, storing user data:", userData.username);

      // ✅ Use auth context's login function to store both token and user
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

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
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