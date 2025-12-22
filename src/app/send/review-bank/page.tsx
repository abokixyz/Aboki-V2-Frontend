"use client"

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import apiClient from "@/lib/api-client";

function ReviewBankContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const name = searchParams.get("name") || "";
  const account = searchParams.get("account") || "";
  const bank = searchParams.get("bank") || "";
  const bankName = searchParams.get("bankName") || "";
  const amountUSDC = searchParams.get("amountUSDC") || "0";
  const amountNGN = searchParams.get("amountNGN") || "0";
  const fee = searchParams.get("fee") || "0";

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"review" | "processing" | "success">("review");
  const [statusMessage, setStatusMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const base64ToUint8Array = (base64: string): Uint8Array => {
    try {
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
    } catch (err: any) {
      console.error('❌ Base64 decode error:', err);
      throw new Error(`Failed to decode base64: ${err.message}`);
    }
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

  const handleCompleteTransaction = async () => {
    setProcessing(true);
    setError("");
    setStep("processing");
    let transactionRef = "";

    try {
      // Step 1: Initiate offramp
      setStatusMessage("Initiating transaction...");
      console.log('📝 Step 1: Initiating offramp...');
      
      const initiateResponse = await apiClient.initiateOfframp({
        amountUSDC: parseFloat(amountUSDC),
        accountNumber: account,
        bankCode: bank,
        name: name
      });

      if (!initiateResponse.success || !initiateResponse.data) {
        throw new Error(initiateResponse.error || "Failed to initiate transaction");
      }

      transactionRef = initiateResponse.data.transactionReference;
      console.log('✅ Offramp initiated:', transactionRef);

      // Step 2: Get passkey challenge
      setStatusMessage("Preparing security verification...");
      console.log('🔐 Step 2: Getting passkey challenge...');
      
      const optionsResponse = await fetch("https://apis.aboki.xyz/api/auth/passkey/transaction-verify-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify({
          type: "withdraw",
          amount: parseFloat(amountUSDC),
          recipient: name
        })
      });

      if (!optionsResponse.ok) {
        const errorData = await optionsResponse.json();
        throw new Error(errorData.error || "Failed to get passkey challenge");
      }

      const options = await optionsResponse.json();
      console.log('✅ Challenge received');

      // Step 3: Biometric authentication
      setStatusMessage("Waiting for biometric verification...");
      console.log('👆 Step 3: Requesting biometric authentication...');
      
      const challengeBuffer = base64ToUint8Array(options.data.challenge);
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer as BufferSource,
          timeout: options.data.timeout || 60000,
          rpId: options.data.rpId || "aboki.xyz",
          allowCredentials: [],
          userVerification: "required"
        }
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Passkey verification was cancelled");
      }

      console.log('✅ Biometric authentication successful');

      // Step 4: Verify passkey
      setStatusMessage("Verifying your identity...");
      console.log('🔐 Step 4: Verifying passkey signature...');
      
      const response = credential.response as AuthenticatorAssertionResponse;
      
      const verifyPayload = {
        credentialId: credential.id,
        authenticatorData: uint8ArrayToBase64(new Uint8Array(response.authenticatorData)),
        clientDataJSON: uint8ArrayToBase64(new Uint8Array(response.clientDataJSON)),
        signature: uint8ArrayToBase64(new Uint8Array(response.signature)),
        userHandle: response.userHandle ? uint8ArrayToBase64(new Uint8Array(response.userHandle)) : null,
        transactionData: {
          type: "withdraw",
          amount: parseFloat(amountUSDC),
          recipient: name,
          transactionReference: transactionRef
        }
      };
      
      const verifyResponse = await fetch("https://apis.aboki.xyz/api/auth/passkey/transaction-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiClient.getToken()}`
        },
        body: JSON.stringify(verifyPayload)
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        console.error('❌ Verify failed:', errorData);
        throw new Error(errorData.error || "Passkey verification failed");
      }

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.data?.token) {
        throw new Error("No verification token received");
      }

      console.log('✅ Passkey verified, token received');
      
      // Step 5: IMMEDIATELY confirm and settle (before token expires)
      setStatusMessage("Processing payment...");
      console.log('💸 Step 5: Confirming account and initiating settlement...');
      
      // Set token right before the call to minimize delay
      apiClient.setPasskeyVerificationToken(verifyData.data.token);
      
      const confirmResponse = await apiClient.confirmOfframpAndSign({
        transactionReference: transactionRef,
        accountNumber: account,
        bankCode: bank
      });

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.error || "Transaction confirmation failed");
      }

      console.log('✅ Settlement initiated:', confirmResponse.data);
      apiClient.clearPasskeyVerificationToken();

      setStatusMessage("Transaction successful!");
      setStep("success");
      setRetryCount(0); // Reset retry count on success
      
      setTimeout(() => {
        router.push(`/send/bank-success?ref=${transactionRef}&amount=${amountNGN}&recipient=${encodeURIComponent(name)}&bank=${encodeURIComponent(bankName)}`);
      }, 2000);

    } catch (err: any) {
      console.error("❌ Transaction error:", err);
      console.error("Error stack:", err.stack);
      
      // Provide more helpful error messages
      let errorMessage = err.message || "Transaction failed";
      
      if (errorMessage.includes("cancelled")) {
        errorMessage = "Verification was cancelled. Please try again.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "Verification timed out. Please try again.";
      } else if (errorMessage.includes("challenge")) {
        errorMessage = "Security verification failed. Please try again.";
      } else if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
        errorMessage = "Transaction processing failed. Please try again.";
      } else if (errorMessage.includes("execute Aboki order")) {
        errorMessage = "Payment processing error. Please try again in a moment.";
      }
      
      setError(errorMessage);
      setStep("review");
      setProcessing(false);
      setStatusMessage("");
      setRetryCount(prev => prev + 1);
      
      // Always clear token on error to ensure fresh state for retry
      apiClient.clearPasskeyVerificationToken();
    }
  };

  return (
    <div className="bg-[#F6EDFF]/50 dark:bg-[#252525]">
      <div className="w-full max-w-[1080px] mx-auto bg-[#F6EDFF]/50 dark:bg-[#252525] transition-colors duration-300 min-h-screen">
        
        <header className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-[#F6EDFF] dark:bg-[#252525] z-10 border-b border-slate-200/50 dark:border-slate-700/50">
          {step === "review" && (
            <Link href={`/send/amount-ngn?name=${encodeURIComponent(name)}&account=${account}&bank=${bank}&bankName=${encodeURIComponent(bankName)}`} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeftIcon className="w-6 h-6 text-slate-900 dark:text-white" />
            </Link>
          )}
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">
            {step === "review" && "Review Payment"}
            {step === "processing" && "Processing Payment"}
            {step === "success" && "Payment Successful"}
          </h1>
        </header>

        <div className="px-6 pt-4" style={{ paddingBottom: '250px' }}>
          
          {step === "review" && (
            <div className="space-y-6 max-w-md mx-auto w-full">
              {/* Recipient Info */}
              <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-5 border-2 border-slate-200 dark:border-[#A3A3A3]">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Sending to</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base text-slate-900 dark:text-white truncate">{name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{bankName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">{account}</p>
                  </div>
                </div>
              </div>

              {/* Amount Card */}
              <div className="bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-2xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">They'll Receive</p>
                <p className="text-4xl font-bold mb-3">₦{parseFloat(amountNGN).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })}</p>
                <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <p className="text-sm opacity-90">You'll send: <span className="font-bold">${parseFloat(amountUSDC).toFixed(2)} USDC</span></p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-5 border-2 border-slate-200 dark:border-[#A3A3A3] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${(parseFloat(amountUSDC) - parseFloat(fee)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Transaction Fee</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">${parseFloat(fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">5-15 mins</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200 dark:border-slate-700">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">${parseFloat(amountUSDC).toFixed(2)} USDC</span>
                </div>
              </div>

              {/* Error Message with Retry Info */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">Payment Failed</p>
                      <p className="text-red-600 dark:text-red-300 text-xs mb-2">{error}</p>
                      {retryCount > 0 && (
                        <p className="text-red-500 dark:text-red-400 text-xs">
                          Attempt {retryCount + 1} - Don't worry, your funds are safe
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">Secure Transaction</p>
                    <p className="text-xs text-purple-700 dark:text-purple-400">
                      You'll be asked to verify with your fingerprint or face ID
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleCompleteTransaction}
                disabled={processing}
                className="w-full py-4 rounded-2xl bg-[#D364DB] text-white font-bold text-lg shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                {processing ? "Processing..." : "Confirm & Pay"}
              </button>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-900 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#D364DB] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowPathIcon className="w-8 h-8 text-[#D364DB]" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {statusMessage || "Processing..."}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Sending ₦{parseFloat(amountNGN).toLocaleString()} to {name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Please don't close this window
                </p>
              </div>

              {/* Progress Steps */}
              <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-5 border-2 border-slate-200 dark:border-[#A3A3A3] text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Transaction initiated</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-[#D364DB] flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 bg-[#D364DB] rounded-full animate-pulse" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{statusMessage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircleIcon className="w-14 h-14 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  ₦{parseFloat(amountNGN).toLocaleString()} is on its way to {name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Estimated arrival: 5-15 minutes
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ReviewBankPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-full animate-pulse" />
          <p className="text-sm text-gray-600 dark:text-purple-100/60 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <ReviewBankContent />
    </Suspense>
  );
}