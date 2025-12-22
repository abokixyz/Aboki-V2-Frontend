// ============= lib/api-client.ts (WITH REWARD ENDPOINTS) =============
// API Client for Aboki Backend

const BASE_URL = 'https://apis.aboki.xyz';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface HistoryParams {
  type?: 'onramp' | 'offramp' | 'transfer' | 'link';
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private passkeyVerificationToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('aboki_auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aboki_auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aboki_auth_token');
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('aboki_auth_token');
    }
    return this.token;
  }

  setPasskeyVerificationToken(token: string) {
    this.passkeyVerificationToken = token;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('passkey_verification_token', token);
    }
    console.log('✅ Passkey verification token stored');
  }

  getPasskeyVerificationToken(): string | null {
    if (!this.passkeyVerificationToken && typeof window !== 'undefined') {
      this.passkeyVerificationToken = sessionStorage.getItem('passkey_verification_token');
    }
    return this.passkeyVerificationToken;
  }

  clearPasskeyVerificationToken() {
    this.passkeyVerificationToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('passkey_verification_token');
    }
    console.log('🗑️ Passkey verification token cleared');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add authorization if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // ✅ FIXED: Add passkey verification header for offramp confirm endpoint
    if (endpoint.includes('/confirm-account-and-sign') || 
        endpoint.includes('/send/') || 
        endpoint.includes('/withdraw')) {
      const token = this.getPasskeyVerificationToken();
      if (token) {
        headers['X-Passkey-Verified'] = 'true';
        console.log('✅ Adding X-Passkey-Verified header');
        console.log('   Endpoint:', endpoint);
        console.log('   Token present:', 'YES');
      } else {
        console.warn('⚠️ Passkey verification token missing!');
        console.warn('   Endpoint:', endpoint);
        console.warn('   This request will likely fail');
      }
    }

    try {
      console.log('🌐 API Request:', {
        method: options.method || 'GET',
        endpoint,
        headers: Object.keys(headers),
        hasPasskeyHeader: !!headers['X-Passkey-Verified']
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          error: data.error || data.message
        });
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return data;
    } catch (error: any) {
      console.error('❌ API Request Error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // ========== PUBLIC HTTP METHODS ==========

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // ========== USER ENDPOINTS ==========

  /**
   * Get current authenticated user profile
   */
  async getUserProfile(): Promise<ApiResponse<{
    _id: string;
    name: string;
    username: string;
    email: string;
    wallet: {
      ownerAddress: string;
      smartAccountAddress: string;
      network: string;
    };
    createdAt: string;
  }>> {
    return this.get('/api/users/me');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(params: {
    name?: string;
    email?: string;
    username?: string;
  }): Promise<ApiResponse<{
    _id: string;
    name: string;
    username: string;
    email: string;
  }>> {
    return this.put('/api/users/me', params);
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<ApiResponse<{
    _id: string;
    name: string;
    username: string;
    email: string;
    wallet: {
      ownerAddress: string;
      smartAccountAddress: string;
      network: string;
    };
  }>> {
    return this.get(`/api/users/username/${username}`);
  }

  /**
   * Get user wallet details
   */
  async getUserWallet(): Promise<ApiResponse<{
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
  }>> {
    return this.get('/api/users/wallet');
  }

  /**
   * Check if username is available
   */
  async checkUsernameAvailability(username: string): Promise<ApiResponse<{
    available: boolean;
    username: string;
  }>> {
    return this.get(`/api/users/check-username/${username}`);
  }

  // ========== TRANSFER ENDPOINTS ==========

  async validateUsername(username: string): Promise<ApiResponse<{
    username: string;
    name: string;
  }>> {
    return this.get(`/api/transfer/validate-username/${username}`);
  }

  async getContacts(): Promise<ApiResponse<Array<{
    id: string;
    username: string;
    name: string;
    address: string;
    interactionCount: number;
    transferCount: number;
    totalAmountTransferred: number;
    lastInteractedAt: string;
  }>>> {
    return this.get('/api/transfer/contacts');
  }

  async getRecentContacts(limit: number = 5): Promise<ApiResponse<Array<{
    username: string;
    name: string;
    lastInteractedAt: string;
  }>>> {
    return this.get(`/api/transfer/contacts/recent?limit=${limit}`);
  }

  /**
   * Send USDC to another user by username
   * Automatically includes passkey verification if available
   */
  async sendToUsername(params: {
    username: string;
    amount: number;
    message?: string;
  }): Promise<ApiResponse<{
    transferId: string;
    from: string;
    to: string;
    amount: number;
    transactionHash: string;
    explorerUrl: string;
    gasSponsored: boolean;
    message?: string;
  }>> {
    return this.post('/api/transfer/send/username', params);
  }

  /**
   * Send USDC to external wallet
   * Automatically includes passkey verification if available
   */
  async sendToExternal(params: {
    address: string;
    amount: number;
    message?: string;
  }): Promise<ApiResponse<{
    transferId: string;
    from: string;
    to: string;
    amount: number;
    transactionHash: string;
    explorerUrl: string;
    gasSponsored: boolean;
  }>> {
    return this.post('/api/transfer/send/external', params);
  }

  async createPaymentLink(params: {
    amount: number;
    message?: string;
  }): Promise<ApiResponse<{
    transferId: string;
    linkCode: string;
    claimUrl: string;
    amount: number;
    message?: string;
    inviteCode?: string;
    expiresAt: string;
    status: string;
  }>> {
    return this.post('/api/transfer/create-link', params);
  }

  async getPaymentLinkDetails(linkCode: string): Promise<ApiResponse<{
    from: string;
    fromName: string;
    amount: number;
    message?: string;
    status: string;
    isClaimed: boolean;
    isExpired: boolean;
    claimedBy?: string;
    claimedAt?: string;
    expiresAt: string;
    transactionHash?: string;
    inviteCode?: string;
    requiresSignup: boolean;
  }>> {
    return this.get(`/api/transfer/link/${linkCode}`);
  }

  async claimPaymentLink(linkCode: string): Promise<ApiResponse<{
    transferId: string;
    from: string;
    amount: number;
    transactionHash: string;
    explorerUrl: string;
    gasSponsored: boolean;
    message?: string;
  }>> {
    return this.post(`/api/transfer/claim/${linkCode}`);
  }

  async cancelPaymentLink(linkCode: string): Promise<ApiResponse> {
    return this.delete(`/api/transfer/link/${linkCode}`);
  }

  async getTransferHistory(): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    direction: 'SENT' | 'RECEIVED';
    from: string;
    to: string;
    amount: number;
    status: string;
    message?: string;
    transactionHash?: string;
    linkCode?: string;
    createdAt: string;
    claimedAt?: string;
  }>>> {
    return this.get('/api/transfer/history');
  }

  async getWalletBalance(): Promise<ApiResponse<{
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
    ethBalance: string;
    usdcBalance: string;
    balances: {
      ETH: {
        balance: string;
        balanceInWei: string;
      };
      USDC: {
        balance: string;
        balanceInWei: string;
      };
    };
    isReal: boolean;
    // Legacy fields for backward compatibility
    balance?: string;
    formattedBalance?: string;
    address?: string;
  }>> {
    return this.get('/api/wallet/balance');
  }

  // ========== OFFRAMP ENDPOINTS ==========

  /**
   * Verify Nigerian bank account details
   */
  async verifyBankAccount(params: {
    accountNumber: string;
    bankCode: string;
  }): Promise<ApiResponse<{
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }>> {
    return this.post('/api/offramp/verify-account', params);
  }

  /**
   * Get current offramp exchange rate
   * Updated to match actual API response structure
   * @param amountUSDC - Optional amount in USDC to get specific calculation
   */
  async getOfframpRate(amountUSDC?: number): Promise<ApiResponse<{
    baseRate: number;
    offrampRate: number;
    markup: number;
    fee: {
      percentage: number;
      amountUSDC: number;
      amountNGN: number;
      maxFeeUSD: number;
      effectiveFeePercent: number;
    };
    calculation?: {
      amountUSDC: number;
      feeUSDC: number;
      netUSDC: number;
      ngnAmount: number;
      effectiveRate: number;
      lpFeeUSDC: number;
      breakdown: string;
    };
    source?: string;
    cached?: boolean;
    timestamp?: string;
  }>> {
    const endpoint = amountUSDC 
      ? `/api/offramp/rate?amountUSDC=${amountUSDC}`
      : '/api/offramp/rate';
    return this.get(endpoint);
  }

  /**
   * Initiate offramp transaction
   */
  async initiateOfframp(params: {
    amountUSDC: number;
    accountNumber: string;
    bankCode: string;
    name?: string;
  }): Promise<ApiResponse<{
    transactionReference: string;
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    nextStep: string;
  }>> {
    // Backend expects beneficiary object with name, accountNumber, bankCode
    return this.post('/api/offramp/initiate', {
      amountUSDC: params.amountUSDC,
      beneficiary: {
        name: params.name || '', // Backend will use verified name from Lenco
        accountNumber: params.accountNumber,
        bankCode: params.bankCode
      }
    });
  }

  /**
   * Confirm account and sign with passkey
   */
  async confirmOfframpAndSign(params: {
    transactionReference: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<ApiResponse<{
    transactionReference: string;
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    lencoReference: string;
    estimatedTime: string;
    verifiedWithPasskey: boolean;
  }>> {
    return this.post('/api/offramp/confirm-account-and-sign', params);
  }

  /**
   * Get offramp transaction status
   */
  async getOfframpStatus(reference: string): Promise<ApiResponse<{
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    createdAt: string;
    completedAt?: string;
  }>> {
    return this.get(`/api/offramp/status/${reference}`);
  }

  /**
   * Get offramp history
   */
  async getOfframpHistory(): Promise<ApiResponse<Array<{
    id: string;
    transactionReference: string;
    status: string;
    amountUSDC: number;
    amountNGN: number;
    accountName: string;
    bankName: string;
    createdAt: string;
  }>>> {
    return this.get('/api/offramp/history');
  }

  // ========== BENEFICIARY ENDPOINTS ==========

  /**
   * Add new beneficiary
   */
  async addBeneficiary(params: {
    name: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<ApiResponse<{
    id: string;
    name: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
  }>> {
    return this.post('/api/offramp/beneficiaries', params);
  }

  /**
   * Get all beneficiaries
   */
  async getBeneficiaries(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    isDefault: boolean;
    createdAt: string;
  }>>> {
    return this.get('/api/offramp/beneficiaries');
  }

  /**
   * Delete beneficiary
   */
  async deleteBeneficiary(id: string): Promise<ApiResponse> {
    return this.delete(`/api/offramp/beneficiaries/${id}`);
  }

  /**
   * Set default beneficiary
   */
  async setDefaultBeneficiary(id: string): Promise<ApiResponse> {
    return this.put(`/api/offramp/beneficiaries/${id}/default`);
  }

  /**
   * Get frequently used accounts
   */
  async getFrequentAccounts(): Promise<ApiResponse<Array<{
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
    transactionCount: number;
    lastUsed: string;
  }>>> {
    return this.get('/api/offramp/frequent-accounts');
  }

  // ========== HISTORY ENDPOINTS ==========

  /**
   * Get unified transaction history
   */
  async getTransactionHistory(params: HistoryParams = {}): Promise<ApiResponse<{
    transactions: Array<{
      transactionId: string;
      type: 'onramp' | 'offramp' | 'transfer' | 'link';
      description: string;
      amount: number;
      amountUSDC?: number;
      amountNGN?: number;
      currency: string;
      status: string;
      date: string;
      reference?: string;
      transactionHash?: string;
      explorerUrl?: string;
      metadata?: any;
    }>;
    summary: {
      totalTransactions: number;
      totalOnramp: number;
      totalOfframp: number;
      totalTransfer: number;
      totalLink: number;
      completedCount: number;
      pendingCount: number;
      failedCount: number;
    };
    pagination: {
      limit: number;
      skip: number;
      hasMore: boolean;
      total: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());

    const endpoint = `/api/history/unified${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  /**
   * Get onramp history only
   */
  async getOnrampHistoryOnly(params: Omit<HistoryParams, 'type'> = {}): Promise<ApiResponse<{
    transactions: any[];
    pagination: {
      limit: number;
      skip: number;
      total: number;
      hasMore: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());

    const endpoint = `/api/history/onramp${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  /**
   * Get offramp history only
   */
  async getOfframpHistoryOnly(params: Omit<HistoryParams, 'type'> = {}): Promise<ApiResponse<{
    transactions: any[];
    pagination: {
      limit: number;
      skip: number;
      total: number;
      hasMore: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());

    const endpoint = `/api/history/offramp${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  /**
   * Get transfer history only (from history endpoint)
   */
  async getTransferHistoryOnly(params: Omit<HistoryParams, 'type'> = {}): Promise<ApiResponse<{
    transactions: any[];
    pagination: {
      limit: number;
      skip: number;
      total: number;
      hasMore: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.skip) queryParams.append('skip', params.skip.toString());

    const endpoint = `/api/history/transfer${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<ApiResponse<{
    onramp: {
      count: number;
      totalNGN: number;
      totalUSDC: number;
      avgAmount: number;
      completedCount: number;
    };
    offramp: {
      count: number;
      totalUSDC: number;
      totalNGN: number;
      avgAmount: number;
      completedCount: number;
    };
    transfer: {
      count: number;
      totalUSDC: number;
      avgAmount: number;
      sent: number;
      received: number;
      completedCount: number;
    };
    overall: {
      totalTransactions: number;
      totalCompleted: number;
      completionRate: number;
      totalUSDCInvolved: number;
      totalNGNInvolved: number;
    };
  }>> {
    return this.get('/api/history/stats');
  }

  // ========== REWARD ENDPOINTS ==========

  /**
   * Get my reward points and breakdown
   * 
   * @returns User's total points, broken down by category:
   *   - invitePoints: Points from inviting friends
   *   - tradePoints: Points from trading
   *   - referralBonusPoints: Points from referrals trading
   */
  async getMyRewardPoints(): Promise<ApiResponse<{
    userId: string;
    totalPoints: number;
    pointBreakdown: {
      invitePoints: number;
      tradePoints: number;
      referralBonusPoints: number;
    };
    details: {
      fromInvites: {
        points: number;
        description: string;
      };
      fromTrades: {
        points: number;
        description: string;
      };
      fromReferralBonus: {
        points: number;
        description: string;
      };
    };
    lastUpdated: string;
  }>> {
    return this.get('/api/rewards/my-points');
  }

  /**
   * Get my points earning history
   * 
   * @param params Optional filters:
   *   - type: Filter by 'invite', 'trade', or 'referral_bonus'
   *   - limit: Number of records (default 50, max 100)
   *   - skip: Pagination offset (default 0)
   * 
   * @returns Array of point transactions with pagination info
   */
  async getMyRewardHistory(params?: {
    type?: 'invite' | 'trade' | 'referral_bonus';
    limit?: number;
    skip?: number;
  }): Promise<ApiResponse<{
    data: Array<{
      transactionId: string;
      pointType: 'invite' | 'trade' | 'referral_bonus';
      points: number;
      description: string;
      amount?: number;
      referrerId?: string;
      relatedTransactionId?: string;
      earnedAt: string;
    }>;
    pagination: {
      limit: number;
      skip: number;
      total: number;
      hasMore: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    const endpoint = `/api/rewards/my-history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  /**
   * Get referral bonus information
   * 
   * @returns Information about who referred you and your referral earnings
   */
  async getReferralBonusInfo(): Promise<ApiResponse<{
    youAreInvitedBy?: {
      username: string;
      name: string;
      referralBonusPoints: number;
      totalPoints: number;
      earnedFromYou: number;
    } | null;
    yourReferralBonus: {
      totalBonusPoints: number;
      description: string;
      howItWorks: {
        step1: string;
        step2: string;
        step3: string;
        step4: string;
        step5: string;
      };
    };
  }>> {
    return this.get('/api/rewards/referral-info');
  }

  /**
   * Get reward leaderboard
   * 
   * @param params Optional filters:
   *   - type: 'total' (default), 'invite', 'trade', or 'referral'
   *   - limit: Number of top earners (default 20, max 100)
   * 
   * @returns Top earners ranked by points
   */
  async getRewardLeaderboard(params?: {
    type?: 'total' | 'invite' | 'trade' | 'referral';
    limit?: number;
  }): Promise<ApiResponse<{
    leaderboardType: string;
    leaderboard: Array<{
      rank: number;
      username: string;
      name: string;
      totalPoints: number;
      invitePoints: number;
      tradePoints: number;
      referralBonusPoints: number;
    }>;
    generatedAt: string;
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/rewards/leaderboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  /**
   * Get reward system rules and information
   * 
   * @returns Complete guide on how to earn points and upcoming rewards
   */
  async getRewardRules(): Promise<ApiResponse<{
    pointSystem: {
      title: string;
      status: string;
      description: string;
      rules: Array<{
        activity: string;
        pointsEarned: number | string;
        description: string;
        maxPoints: string;
        example: string;
      }>;
      pointCalculations: {
        tradePoints: {
          formula: string;
          examples: Array<{
            amount: string;
            points: number;
          }>;
        };
        referralBonus: {
          formula: string;
          examples: Array<{
            referralTradeAmount: string;
            referralEarns: number;
            youEarn: number;
          }>;
        };
      };
      pointAccumulation: {
        description: string;
        categories: Array<{
          name: string;
          description: string;
          color: string;
        }>;
        totalPoints: string;
      };
      upcomingRewards: {
        status: string;
        description: string;
        message: string;
      };
      tracking: {
        description: string;
        features: string[];
      };
    };
  }>> {
    return this.get('/api/rewards/rules');
  }

  /**
   * Get reward system statistics
   * 
   * @returns Aggregated stats: total points distributed, user count, breakdowns
   */
  async getRewardStats(): Promise<ApiResponse<{
    systemStats: {
      totalRewardRecords: number;
      totalUsersWithPoints: number;
      totalPointsDistributed: number;
      avgPointsPerUser: number;
      maxPointsEarned: number;
      minPointsEarned: number;
    };
    pointsBreakdown: {
      invitePoints: number;
      tradePoints: number;
      referralBonusPoints: number;
    };
    generatedAt: string;
  }>> {
    return this.get('/api/rewards/stats');
  }
}

const apiClient = new ApiClient(BASE_URL);

export default apiClient;
export { ApiClient };
export type { ApiResponse, HistoryParams };