"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, ExclamationCircleIcon, LockClosedIcon, ArrowPathIcon, ChevronLeftIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz';

// Type definitions
interface UserData {
  _id: string;
  name: string;
  username: string;
  email: string;
  wallet: {
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
  };
  verifiedWithPin?: boolean;
  createdAt: string;
}

export default function PinSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"check" | "setup" | "has_pin" | "loading" | "success" | "error" | "removing">("check");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [setupAttempted, setSetupAttempted] = useState(false);
  
  // PIN input states
  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [step1Complete, setStep1Complete] = useState(false);

  // Check if user is authenticated and get profile on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔄 Checking auth and PIN status...');
        const response = await apiClient.getUserProfile();
        if (response.success && response.data) {
          const userData = response.data as UserData;
          setUserData(userData);
          
          // Check if user already has a PIN
          const userHasPin = userData?.verifiedWithPin ? true : false;
          console.log(`🔐 User has PIN: ${userHasPin}`);
          
          setHasExistingPin(userHasPin);
          
          if (userHasPin) {
            console.log('➡️ Setting step to "has_pin"');
            setStep("has_pin");
          } else {
            console.log('➡️ Setting step to "setup"');
            setStep("setup");
          }
          setLoading(false);
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (err: any) {
        console.error('❌ Error checking user:', err);
        setError('Failed to load user data. Please try again.');
        setStep("error");
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // ============= REMOVE PIN HANDLER =============
  const handleRemovePin = async () => {
    if (!userData) {
      setError('User data not available');
      return;
    }

    setError("");
    setStep("removing");
    setStatusMessage("Removing existing PIN...");
    setLoading(true);

    try {
      const removeResponse = await fetch(
        `${API_BASE_URL}/api/auth/pin/remove`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiClient.getToken()}`
          }
        }
      );

      const removeData = await removeResponse.json();

      if (!removeResponse.ok || !removeData.success) {
        throw new Error(removeData.error || 'Failed to remove PIN');
      }

      console.log('✅ Existing PIN removed');
      
      // Update state
      setHasExistingPin(false);
      setSetupAttempted(false);
      setPinInput("");
      setPinConfirm("");
      setStep1Complete(false);
      setStep("setup");
      setLoading(false);
      
      // Refresh user data
      const response = await apiClient.getUserProfile();
      if (response.success && response.data) {
        setUserData(response.data as UserData);
      }
    } catch (err: any) {
      console.error('❌ Remove error:', err);
      setError(err.message || 'Failed to remove PIN. Please try again.');
      setStep("has_pin");
      setLoading(false);
    }
  };

  // ============= SETUP PIN HANDLER =============
  const handleSetupPin = async () => {
    if (!userData) {
      setError('User data not available');
      return;
    }

    // Validation
    if (pinInput.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (!step1Complete) {
      // Step 1: Validate PIN matches
      if (pinInput !== pinConfirm) {
        setError('PINs do not match. Please try again.');
        return;
      }

      if (!/^\d+$/.test(pinInput)) {
        setError('PIN must contain only numbers');
        return;
      }

      setError("");
      setStep1Complete(true);
      return;
    }

    // Step 2: Send to backend
    setError("");
    setStep("loading");
    setSetupAttempted(true);
    setLoading(true);

    try {
      console.log('📝 Setting up PIN...');
      setStatusMessage("Setting up your PIN...");

      const setupResponse = await fetch(
        `${API_BASE_URL}/api/auth/pin/setup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiClient.getToken()}`
          },
          body: JSON.stringify({
            pin: pinInput
          })
        }
      );

      const setupData = await setupResponse.json();

      if (!setupResponse.ok || !setupData.success) {
        if (setupData.error && setupData.error.includes('already have a pin')) {
          setStep("has_pin");
          setError('You already have a PIN. Please remove it first.');
          setLoading(false);
          return;
        }
        throw new Error(setupData.error || 'Failed to setup PIN');
      }

      console.log('✅ PIN saved successfully!');
      setStep("success");
      setSetupAttempted(false);
      setLoading(false);

      // Refresh user data
      const refreshResponse = await apiClient.getUserProfile();
      if (refreshResponse.success && refreshResponse.data) {
        setUserData(refreshResponse.data as UserData);
        setHasExistingPin(true);
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err: any) {
      console.error('❌ Setup error:', err);
      setError(err.message || 'Failed to setup PIN. Please try again.');
      setStep("error");
      setLoading(false);
    }
  };

  // ============= RENDER =============
  if (step === "check" && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] to-white dark:from-[#1a1a1a] dark:to-[#252525] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400">Checking your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6EDFF] to-white dark:from-[#1a1a1a] dark:to-[#252525]">
      <div className="max-w-md mx-auto px-6 py-12 flex flex-col justify-center min-h-screen">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Security Setup
          </h1>
        </div>

        {/* HAS EXISTING PIN STEP */}
        {step === "has_pin" && (
          <div className="space-y-6">
            {/* Status Message */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-green-900 dark:text-green-300 mb-2">
                    PIN Already Active
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    You already have a PIN registered. Your transactions are secured with PIN verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">Want to change your PIN?</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                You can remove your current PIN and set up a new one. This is useful if:
              </p>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You forgot your PIN</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You want to change it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>You're experiencing issues</span>
                </li>
              </ul>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemovePin}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <TrashIcon className="w-5 h-5" />
                  Remove Current PIN
                </>
              )}
            </button>

            {/* Back Link */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <Link
                href="/dashboard"
                className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* REMOVING PIN STEP */}
        {step === "removing" && (
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-red-200 dark:border-red-900 rounded-full" />
              <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <TrashIcon className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {statusMessage}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Please wait...
              </p>
            </div>
          </div>
        )}

        {/* SETUP STEP */}
        {step === "setup" && !loading && (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                    {hasExistingPin ? 'Set Up New PIN' : `Welcome, ${userData?.name || 'User'}!`}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    {hasExistingPin 
                      ? 'Your old PIN has been removed. Now set up a new one to secure your account.'
                      : 'Set up a secure PIN to protect your funds and verify transactions.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                <p className="text-red-600 dark:text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">What is a PIN?</h3>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>A unique 4+ digit security code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Required to verify all transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Easy to remember and use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Maximum security for your account</span>
                </li>
              </ul>
            </div>

            {/* PIN Input Section */}
            {!step1Complete ? (
              <div className="space-y-4">
                {/* First PIN Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Create Your PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4+ digits"
                      maxLength={10}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none text-center text-2xl tracking-widest font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPin ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Must be at least 4 digits
                  </p>
                </div>

                {/* Confirm PIN Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Confirm Your PIN
                  </label>
                  <input
                    type={showPin ? "text" : "password"}
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter PIN"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-purple-500 focus:outline-none text-center text-2xl tracking-widest font-bold"
                  />
                </div>

                {/* PIN Strength Indicator */}
                {pinInput && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <LockClosedIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">PIN Strength</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded-full transition-colors ${
                            pinInput.length >= i * 2
                              ? 'bg-green-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                      {pinInput.length < 4 ? 'Too short' : 'Strong PIN ✓'}
                    </p>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleSetupPin}
                  disabled={pinInput.length < 4 || !pinConfirm}
                  className="w-full py-4 rounded-xl bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <LockClosedIcon className="w-5 h-5" />
                  Continue
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white">PIN confirmed!</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Click the button below to finalize your PIN setup.</p>
                
                <button
                  onClick={handleSetupPin}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5" />
                      Finalize PIN Setup
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setStep1Complete(false);
                    setError("");
                  }}
                  className="w-full py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm transition-all"
                >
                  Change PIN
                </button>
              </div>
            )}

            {/* Back Link */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <Link
                href="/dashboard"
                className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* LOADING SETUP STEP */}
        {step === "loading" && (
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full" />
              <div className="absolute inset-0 border-4 border-[#D364DB] border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <LockClosedIcon className="w-10 h-10 text-[#D364DB]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {statusMessage}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Please wait...
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircleIcon className="w-14 h-14 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                All Set! ✓
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your PIN is ready. You can now transfer funds with PIN verification.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* ERROR STEP */}
        {step === "error" && (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">
                  Setup Failed
                </p>
                <p className="text-red-600 dark:text-red-300 text-sm">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setError("");
                setStep("setup");
                setPinInput("");
                setPinConfirm("");
                setStep1Complete(false);
              }}
              className="w-full py-4 rounded-xl bg-[#D364DB] hover:bg-[#C554CB] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>

            {/* Back Link */}
            <Link
              href="/dashboard"
              className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}