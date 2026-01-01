"use client"

import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon, FingerPrintIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz';

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

  // ============= STEP HANDLER =============

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

        if (username.length < 3) {
          throw new Error("Username must be at least 3 characters");
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

  // ============= PASSKEY SIGNUP FLOW =============

  const signupWithPasskey = async () => {
    // Check WebAuthn support
    if (!window.PublicKeyCredential) {
      throw new Error("Passkeys are not supported on this browser. Please use Chrome 108+, Safari 16+, or Edge 108+ on a device with biometric authentication.");
    }

    console.log('📝 Step 1: Getting registration options...');

    // ============= STEP 1: Get registration options + challenge from backend =============
    const optionsResponse = await fetch(
      `${API_BASE_URL}/api/auth/passkey/register-options`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      }
    );

    if (!optionsResponse.ok) {
      const errorData = await optionsResponse.json();
      throw new Error(errorData.error || 'Failed to get registration options');
    }

    const optionsData = await optionsResponse.json();
    const { options, challenge } = optionsData.data; // ✅ GET CHALLENGE HERE

    console.log('✅ Registration options received:', {
      hasOptions: !!options,
      hasChallenge: !!challenge,
      challengeLength: challenge?.length
    });

    if (!challenge) {
      throw new Error("No challenge received from server");
    }

    // ============= STEP 2: Create passkey with biometric auth =============
    console.log('👆 Step 2: Requesting biometric authentication...');
    setSuccess('Please complete biometric authentication on your device...');

    // Convert challenge to Uint8Array for browser API
    const challengeBuffer = base64ToUint8Array(challenge);

    let credential: PublicKeyCredential | null = null;

    try {
      credential = await navigator.credentials.create({
        publicKey: {
          challenge: challengeBuffer as BufferSource,
          rp: {
            name: 'Aboki',
            id: options.rp.id
          },
          user: {
            id: new TextEncoder().encode(email),
            name: email,
            displayName: name
          },
          pubKeyCredParams: options.pubKeyCredParams,
          timeout: 60000,
          attestation: 'direct',
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            residentKey: 'preferred',
            userVerification: 'preferred'
          }
        }
      }) as PublicKeyCredential;
    } catch (credError: any) {
      console.error('❌ Passkey creation failed:', credError);
      
      if (credError.name === 'NotAllowedError') {
        throw new Error('Passkey creation was cancelled. Please try again and approve the biometric prompt.');
      } else if (credError.name === 'InvalidStateError') {
        throw new Error('A passkey already exists for this device. Please try logging in instead.');
      } else if (credError.name === 'TimeoutError' || credError.message?.includes('timed out')) {
        throw new Error('Passkey creation timed out. Please try again and complete the biometric prompt quickly.');
      } else if (credError.name === 'NotSupportedError') {
        throw new Error('Your device doesn\'t support passkeys. Please use a device with Face ID, Touch ID, or Windows Hello.');
      } else {
        throw new Error('Failed to create passkey: ' + (credError.message || 'Unknown error'));
      }
    }

    if (!credential) {
      throw new Error('Passkey creation was cancelled. Please try again.');
    }

    console.log('✅ Passkey created successfully');

    // ============= STEP 3: Prepare credential data =============
    const response = credential.response as AuthenticatorAttestationResponse;
    const attestationObject = new Uint8Array(response.attestationObject as ArrayBuffer);
    const clientDataJSON = new Uint8Array(response.clientDataJSON as ArrayBuffer);

    const passkeyData = {
      id: credential.id,
      rawId: uint8ArrayToBase64(new Uint8Array(credential.rawId)),
      type: credential.type,
      response: {
        clientDataJSON: uint8ArrayToBase64(clientDataJSON),
        attestationObject: uint8ArrayToBase64(attestationObject)
      }
      // ✅ DO NOT include challenge here - it will be sent separately
    };

    // ============= STEP 4: Register with backend (SEND CHALLENGE SEPARATELY) =============
    console.log('📡 Step 4: Submitting signup request with challenge...');
    setSuccess('Creating your account...');

    const signupResponse = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        username: username.toLowerCase(),
        email,
        inviteCode: inviteCode.toUpperCase(),
        passkey: passkeyData,
        challenge: challenge // ✅ SEND CHALLENGE AS SEPARATE FIELD
      })
    });

    let data;
    try {
      const text = await signupResponse.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      throw new Error('Server returned invalid response');
    }

    console.log('📥 Signup response:', { status: signupResponse.status, success: data.success });

    if (!signupResponse.ok) {
      const errorMessage = data.error || data.message || 'Registration failed';
      console.error('❌ Signup failed:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!data.success) {
      throw new Error(data.error || 'Signup failed');
    }

    if (!data.data?.token) {
      throw new Error('No token received from server');
    }

    // ============= STEP 5: Store user data =============
    console.log('✅ Auth token received, storing user data');

    const userData = {
      id: data.data.user?._id || '',
      username: data.data.user?.username || username,
      name: data.data.user?.name || name,
      email: data.data.user?.email || email
    };

    // Use auth context to store token and user
    login(data.data.token, userData);

    setSuccess('✨ Account created with passkey! Setting up your wallet...');
    setTimeout(() => onSuccess(), 2000);
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
              <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                3+ characters, lowercase, numbers and underscores only
              </p>
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