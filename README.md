# Aboki V1 — Complete Technical Architecture

### _The Stateless Conversion Bridge_

---

## Overview

Aboki V1 operates as a **one-time conversion utility**. Its sole purpose is simple:

> **Crypto in → Fiat out.**

There is **no persistent relationship** between Aboki and the user beyond the swap.  
Every interaction is **isolated, atomic, and stateless**.

---

## The V1 Mental Model

Think of V1 like a **currency exchange booth at an airport**:

- You walk up with dollars
- You exchange for local currency
- You leave
- The booth has no memory of you, no account for you, no wallet for you

There is **zero stickiness** and **zero long-term engagement**.

---

## V1 User Journey (Step-by-Step)

1. User has **USDC** in MetaMask / Coinbase Wallet.
2. They visit **Aboki**, connect their wallet via **WalletConnect**.
3. They input the amount to convert.
4. They **approve** USDC spend.
5. They initiate the swap.
6. Aboki smart contract **receives USDC → forwards to Paycrest**.
7. Paycrest triggers a **NIBSS NGN payout**.
8. In ~**90 seconds**, the user gets a **bank alert**.
9. User disconnects wallet.
10. No further touchpoint.

---

## V1 Technical Reality

### **Frontend**

- React app
- Wallet connection via **wagmi + WalletConnect**
- Privy for lightweight auth (wallet signatures)

### **Backend**

Node.js service responsible for:

- Fetching **real-time USDC/NGN price quotes**
  - Crypto prices → Chainlink/Pyth
  - NGN rates → Parallel Market API
- Logging completed transactions for internal analytics

### **Smart Contract (on Base)**

A simple router that:

- Accepts USDC/ETH
- Performs basic validation
- Forwards funds to **Paycrest's address**
- Emits events the backend listens to

---

## V1 Limitations

### 1. **User pays gas fees**

Even Base’s low fees (~$0.02–$0.05) create friction.

### 2. **Crypto-native UX**

User must:

- Approve token spends
- Wait for block confirmations
- Understand hashes
- Handle wallet interactions

Mainstream users are effectively excluded.

### 3. **Zero retention**

V1 is a tool, not a platform.  
Users don’t come back unless they randomly need another swap.

### 4. **Linear business model**

Revenue only comes from:

- The spread on swaps

No compounding network effects.  
No recurring revenue.

---

## V1 Data Flow (Full Lifecycle)

```

User’s External Wallet (MetaMask / Coinbase Wallet)
↓ Connects via WalletConnect
↓ Approves USDC spend
↓ Initiates swap
Aboki Smart Contract
↓ Receives USDC
↓ Forwards to Paycrest
Paycrest Backend
↓ Detects deposit
↓ Initiates NGN payout via NIBSS
User’s Nigerian Bank
↓ Receives credit alert (~90 sec)
↓ User disconnects wallet

```

---

## Core Proof From V1

V1 validated that Nigerians **want fast, reliable crypto-to-fiat conversion**.

It proved:

- Paycrest integration works
- Base fees are low enough
- Users tolerate crypto complexity **if** the payout is reliable
- Sub-90-second settlements create real value

But it also exposed V1’s ceiling:

- Low retention
- No network effects
- No reason for users to stay
- Business growth is linear

V1 is the bridge…  
**V2 is the city on the other side.**

---
