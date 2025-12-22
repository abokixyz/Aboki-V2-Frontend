"use client"

import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, FingerPrintIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";

interface SignupFormProps {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<"initial" | "invite" | "details">("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const handleNext = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (step === "initial") {
        setStep("invite");
        setLoading(false);
        return;
      }

      if (step === "invite") {
        if (!inviteCode.trim()) {
          throw new Error("Please enter your invite code");
        }
        setStep("details");
        setLoading(false);
        return;
      }

      if (step === "details") {
        if (!name.trim() || !username.trim() || !email.trim()) {
          throw new Error("Please fill in all fields");
        }

        if (!email.includes("@")) {
          throw new Error("Please enter a valid email address");
        }

        // Create passkey and signup
        await signupWithPasskey();
      }

    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const signupWithPasskey = async () => {
    // Check WebAuthn support
    if (!window.PublicKeyCredential) {
      throw new Error("Passkeys are not supported on this browser. Please use Chrome 108+, Safari 16+, or Edge 108+ on a device with biometric authentication (Face ID, Touch ID, or Windows Hello).");
    }

    console.log("🔐 Creating passkey for:", email);

    // Create passkey
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "Aboki Wallet",
        id: window.location.hostname === "localhost" ? "localhost" : window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(email),
        name: email,
        displayName: name,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: false,
        residentKey: "preferred",
        userVerification: "preferred",
      },
      timeout: 120000,
      attestation: "none"
    };

    let credential;
    try {
      credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as any;
    } catch (credError: any) {
      console.error("❌ Passkey creation failed:", credError);
      
      if (credError.name === "NotAllowedError") {
        throw new Error("Passkey creation was cancelled. Please try again and approve the biometric prompt.");
      } else if (credError.name === "InvalidStateError") {
        throw new Error("A passkey already exists for this device. Please try logging in instead.");
      } else if (credError.name === "TimeoutError" || credError.message?.includes("timed out")) {
        throw new Error("Passkey creation timed out. Please try again and complete the biometric prompt quickly (you have 2 minutes).");
      } else if (credError.name === "NotSupportedError") {
        throw new Error("Your device doesn't support passkeys. Please use a device with Face ID, Touch ID, or Windows Hello.");
      } else {
        throw new Error("Failed to create passkey: " + (credError.message || "Unknown error. Please ensure your device supports biometric authentication."));
      }
    }

    if (!credential) {
      throw new Error("Failed to create passkey. Please try again.");
    }

    console.log("✅ Passkey created successfully");

    // Prepare passkey data
    const passkeyData = {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64(credential.response.clientDataJSON),
        attestationObject: arrayBufferToBase64(credential.response.attestationObject)
      },
      challenge: arrayBufferToBase64(challenge.buffer)
    };

    console.log("📤 Sending signup request to server");

    // Register with backend
    const response = await fetch("https://apis.aboki.xyz/api/auth/signup", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name,
        username,
        email,
        inviteCode,
        passkey: passkeyData
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

    console.log("📥 Signup response:", { status: response.status, success: data.success });
    
    if (!response.ok) {
      const errorMessage = data.error || data.message || "Registration failed";
      console.error("❌ Signup failed:", errorMessage);
      throw new Error(errorMessage);
    }

    if (!data.data?.token) {
      throw new Error("No token received from server");
    }

    // ✅ Extract user data from response
    const userData = {
      id: data.data.user?._id || "",
      username: data.data.user?.username || username,
      name: data.data.user?.name || name,
      email: data.data.user?.email || email
    };

    console.log("✅ Auth token received, storing user data:", userData.username);

    // ✅ Use auth context's login function to store both token and user
    login(data.data.token, userData);
    
    setSuccess("✨ Account created with passkey! Setting up your wallet...");
    setTimeout(() => onSuccess(), 2000);
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

  const resetFlow = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="space-y-6">
      {/* Error/Success messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3 animate-slide-in">
          <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl flex items-start gap-3 animate-slide-in">
          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Initial step */}
      {step === "initial" && (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-[#D364DB] rounded-full flex items-center justify-center shadow-lg">
              <FingerPrintIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Get Started
            </h2>
            <p className="text-gray-600 dark:text-white/80">
              Create your secure wallet with passkey authentication
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-[#D364DB]/20 rounded-xl p-4 border border-purple-200 dark:border-[#D364DB]/30">
            <div className="flex items-start gap-3">
              <FingerPrintIcon className="w-5 h-5 text-[#D364DB] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Passkey Authentication
                </h4>
                <p className="text-xs text-gray-600 dark:text-white/80 leading-relaxed">
                  Your wallet will be secured with Face ID, Touch ID, or Windows Hello. No passwords to remember, ultra-secure, and phishing-proof.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Continue
          </button>
        </div>
      )}

      {/* Invite code step */}
      {step === "invite" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <button
              onClick={() => { setStep("initial"); resetFlow(); }}
              className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Enter Invite Code
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/70">
              Aboki is invite-only. Enter your code to continue.
            </p>
          </div>

          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="INVITE CODE"
              className="w-full px-4 py-4 bg-[#2d2d2d] dark:bg-[#2d2d2d] border-2 border-[#3d3d3d] dark:border-[#3d3d3d] rounded-xl focus:border-[#D364DB] dark:focus:border-[#D364DB] focus:outline-none text-center text-lg font-bold tracking-widest text-white dark:text-white placeholder:text-white/50 dark:placeholder:text-white/50 transition-colors"
              maxLength={20}
            />
          </div>

          <button
            onClick={handleNext}
            disabled={!inviteCode.trim() || loading}
            className="w-full py-4 bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Verifying..." : "Continue"}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-white/50">
              Don't have an invite code?{" "}
              <button className="text-[#D364DB] dark:text-[#D364DB] font-semibold hover:underline">
                Join waitlist
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Details step */}
      {step === "details" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <button
              onClick={() => { setStep("invite"); resetFlow(); }}
              className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Create Account
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/70">
              Fill in your details to set up your wallet
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-[#2d2d2d] dark:bg-[#2d2d2d] border-2 border-[#3d3d3d] dark:border-[#3d3d3d] rounded-xl focus:border-[#D364DB] dark:focus:border-[#D364DB] focus:outline-none text-white dark:text-white placeholder:text-white/50 dark:placeholder:text-white/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="johndoe"
                className="w-full px-4 py-3 bg-[#2d2d2d] dark:bg-[#2d2d2d] border-2 border-[#3d3d3d] dark:border-[#3d3d3d] rounded-xl focus:border-[#D364DB] dark:focus:border-[#D364DB] focus:outline-none text-white dark:text-white placeholder:text-white/50 dark:placeholder:text-white/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-[#2d2d2d] dark:bg-[#2d2d2d] border-2 border-[#3d3d3d] dark:border-[#3d3d3d] rounded-xl focus:border-[#D364DB] dark:focus:border-[#D364DB] focus:outline-none text-white dark:text-white placeholder:text-white/50 dark:placeholder:text-white/50 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!name.trim() || !username.trim() || !email.trim() || loading}
            className="w-full py-4 bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Passkey...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FingerPrintIcon className="w-5 h-5" />
                Create Passkey & Sign Up
              </span>
            )}
          </button>

          <div className="bg-purple-50 dark:bg-[#D364DB]/20 rounded-xl p-4 border border-purple-200 dark:border-[#D364DB]/30">
            <p className="text-xs text-gray-600 dark:text-white/80 leading-relaxed">
              <strong className="font-bold text-gray-900 dark:text-white">Next Step:</strong> Your device will prompt you to create a passkey using Face ID, Touch ID, or Windows Hello. This passkey is unique to your device and can't be stolen or phished.
            </p>
          </div>
        </div>
      )}

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