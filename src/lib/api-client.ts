// ============= lib/api-client.ts (PRODUCTION READY - WITH PIN SUPPORT) =============
// API Client for Aboki Backend with Enhanced Token Management (Passkey + PIN)

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apis.aboki.xyz';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface TokenData {
  token: string;
  expiresAt: number;
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
  private passkeyVerificationToken: TokenData | null = null;
  private pinVerificationToken: TokenData | null = null;
  
  // Token configuration
  private readonly PASSKEY_TOKEN_LIFETIME = 5 * 60 * 1000; // 5 minutes
  private readonly PIN_TOKEN_LIFETIME = 5 * 60 * 1000; // 5 minutes
  private readonly TOKEN_EXPIRY_WARNING = 30000; // 30 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('aboki_auth_token');
      this.loadPasskeyToken();
      this.loadPinToken();
    }
  }

  // ============= JWT TOKEN MANAGEMENT =============

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

  // ============= PASSKEY TOKEN MANAGEMENT =============

  setPasskeyVerificationToken(token: string) {
    const expiresAt = Date.now() + this.PASSKEY_TOKEN_LIFETIME;
    
    this.passkeyVerificationToken = { token, expiresAt };
    
    // Use sessionStorage for short-lived tokens (better security)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('passkey_verification_token', JSON.stringify({
        token,
        expiresAt
      }));
    }
    
    console.log('✅ Passkey token stored (expires in 5 min)');
  }

  private loadPasskeyToken() {
    if (typeof window === 'undefined') return;
    
    const stored = sessionStorage.getItem('passkey_verification_token');
    if (!stored) return;
    
    try {
      const tokenData: TokenData = JSON.parse(stored);
      
      // Check if token is still valid
      if (Date.now() < tokenData.expiresAt) {
        this.passkeyVerificationToken = tokenData;
        console.log('✅ Valid passkey token loaded from storage');
      } else {
        console.log('⚠️ Stored passkey token expired, clearing');
        this.clearPasskeyVerificationToken();
      }
    } catch (error) {
      console.error('❌ Failed to parse stored passkey token:', error);
      this.clearPasskeyVerificationToken();
    }
  }

  getPasskeyVerificationToken(): string | null {
    // Check expiration before returning
    if (!this.passkeyVerificationToken) {
      this.loadPasskeyToken();
    }
    
    if (this.passkeyVerificationToken) {
      if (Date.now() < this.passkeyVerificationToken.expiresAt) {
        return this.passkeyVerificationToken.token;
      } else {
        console.warn('⚠️ Passkey token expired');
        this.clearPasskeyVerificationToken();
        return null;
      }
    }
    
    return null;
  }

  clearPasskeyVerificationToken() {
    this.passkeyVerificationToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('passkey_verification_token');
    }
    console.log('🗑️ Passkey token cleared');
  }

  isPasskeyTokenExpiringSoon(thresholdMs: number = this.TOKEN_EXPIRY_WARNING): boolean {
    if (!this.passkeyVerificationToken) return true;
    
    const timeRemaining = this.passkeyVerificationToken.expiresAt - Date.now();
    return timeRemaining < thresholdMs;
  }

  getPasskeyTokenTimeRemaining(): number {
    if (!this.passkeyVerificationToken) return 0;
    return Math.max(0, this.passkeyVerificationToken.expiresAt - Date.now());
  }

  // ============= PIN TOKEN MANAGEMENT (NEW) =============

  /**
   * Store PIN verification token (from backend after PIN verification)
   */
  setPinVerificationToken(token: string) {
    const expiresAt = Date.now() + this.PIN_TOKEN_LIFETIME;
    
    this.pinVerificationToken = { token, expiresAt };
    
    // Use sessionStorage for short-lived tokens (better security)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pin_verification_token', JSON.stringify({
        token,
        expiresAt
      }));
    }
    
    console.log('✅ PIN token stored (expires in 5 min)');
  }

  /**
   * Load PIN token from storage (called on init)
   */
  private loadPinToken() {
    if (typeof window === 'undefined') return;
    
    const stored = sessionStorage.getItem('pin_verification_token');
    if (!stored) return;
    
    try {
      const tokenData: TokenData = JSON.parse(stored);
      
      // Check if token is still valid
      if (Date.now() < tokenData.expiresAt) {
        this.pinVerificationToken = tokenData;
        console.log('✅ Valid PIN token loaded from storage');
      } else {
        console.log('⚠️ Stored PIN token expired, clearing');
        this.clearPinVerificationToken();
      }
    } catch (error) {
      console.error('❌ Failed to parse stored PIN token:', error);
      this.clearPinVerificationToken();
    }
  }

  /**
   * Get PIN verification token with expiration check
   */
  getPinVerificationToken(): string | null {
    // Check expiration before returning
    if (!this.pinVerificationToken) {
      this.loadPinToken();
    }
    
    if (this.pinVerificationToken) {
      if (Date.now() < this.pinVerificationToken.expiresAt) {
        return this.pinVerificationToken.token;
      } else {
        console.warn('⚠️ PIN token expired');
        this.clearPinVerificationToken();
        return null;
      }
    }
    
    return null;
  }

  /**
   * Clear PIN verification token
   */
  clearPinVerificationToken() {
    this.pinVerificationToken = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pin_verification_token');
    }
    console.log('🗑️ PIN token cleared');
  }

  /**
   * Check if PIN token is expiring soon
   */
  isPinTokenExpiringSoon(thresholdMs: number = this.TOKEN_EXPIRY_WARNING): boolean {
    if (!this.pinVerificationToken) return true;
    
    const timeRemaining = this.pinVerificationToken.expiresAt - Date.now();
    return timeRemaining < thresholdMs;
  }

  /**
   * Get time remaining for PIN token (in milliseconds)
   */
  getPinTokenTimeRemaining(): number {
    if (!this.pinVerificationToken) return 0;
    return Math.max(0, this.pinVerificationToken.expiresAt - Date.now());
  }

  // ============= HTTP REQUEST HANDLER =============

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

    // Add JWT authorization
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add passkey token with validation
    const passkeyToken = this.getPasskeyVerificationToken();
    if (passkeyToken) {
      // Warn if token is expiring soon
      if (this.isPasskeyTokenExpiringSoon()) {
        console.warn('⚠️ Passkey token expiring soon, request may fail');
      }
      
      headers['X-Passkey-Verified-Token'] = passkeyToken;
      console.log('✅ Passkey token added to request', {
        endpoint,
        timeRemaining: `${Math.round(this.getPasskeyTokenTimeRemaining() / 1000)}s`
      });
    }

    // Add PIN token with validation (NEW)
    const pinToken = this.getPinVerificationToken();
    if (pinToken) {
      // Warn if token is expiring soon
      if (this.isPinTokenExpiringSoon()) {
        console.warn('⚠️ PIN token expiring soon, request may fail');
      }
      
      headers['X-PIN-Verified-Token'] = pinToken;
      console.log('✅ PIN token added to request', {
        endpoint,
        timeRemaining: `${Math.round(this.getPinTokenTimeRemaining() / 1000)}s`
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration errors
        if (response.status === 401) {
          if (data.code === 'PASSKEY_VERIFICATION_REQUIRED') {
            this.clearPasskeyVerificationToken();
            console.error('❌ Passkey token invalid or expired');
          }
          if (data.code === 'PIN_VERIFICATION_REQUIRED') {
            this.clearPinVerificationToken();
            console.error('❌ PIN token invalid or expired');
          }
        }
        
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
      console.error('❌ Network Error:', error);
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  }

  // ============= HTTP METHODS =============

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
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
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============= USER ENDPOINTS =============

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
    verifiedWithPin?: boolean;
    verifiedWithPasskey?: boolean;
    createdAt: string;
  }>> {
    return this.get('/api/users/me');
  }

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

  async getUserWallet(): Promise<ApiResponse<{
    ownerAddress: string;
    smartAccountAddress: string;
    network: string;
  }>> {
    return this.get('/api/users/wallet');
  }

  async checkUsernameAvailability(username: string): Promise<ApiResponse<{
    available: boolean;
    username: string;
  }>> {
    return this.get(`/api/users/check-username/${username}`);
  }

  // ============= TRANSFER ENDPOINTS =============

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
   * ✅ REQUIRES PIN OR PASSKEY VERIFICATION TOKEN
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
    verifiedWithPin?: boolean;
    verifiedWithPasskey?: boolean;
    message?: string;
  }>> {
    const pinToken = this.getPinVerificationToken();
    const passkeyToken = this.getPasskeyVerificationToken();
    
    if (!pinToken && !passkeyToken) {
      return {
        success: false,
        error: 'PIN or Passkey verification required for transfers'
      };
    }
    
    return this.post('/api/transfer/send/username', params);
  }

  /**
   * Send USDC to external wallet
   * ✅ REQUIRES PIN OR PASSKEY VERIFICATION TOKEN
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
    verifiedWithPin?: boolean;
    verifiedWithPasskey?: boolean;
  }>> {
    const pinToken = this.getPinVerificationToken();
    const passkeyToken = this.getPasskeyVerificationToken();
    
    if (!pinToken && !passkeyToken) {
      return {
        success: false,
        error: 'PIN or Passkey verification required for transfers'
      };
    }
    
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
  }>> {
    return this.get('/api/wallet/balance');
  }

  // ============= OFFRAMP ENDPOINTS =============

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
    return this.post('/api/offramp/initiate', {
      amountUSDC: params.amountUSDC,
      beneficiary: {
        name: params.name || '',
        accountNumber: params.accountNumber,
        bankCode: params.bankCode
      }
    });
  }

  /**
   * Confirm account and sign with PIN or Passkey
   * ✅ REQUIRES VALID PIN OR PASSKEY VERIFICATION TOKEN
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
    lencoTransactionId: string;
    estimatedTime: string;
    verifiedWithPin?: boolean;
    verifiedWithPasskey?: boolean;
  }>> {
    // Validate token before making request
    const pinToken = this.getPinVerificationToken();
    const passkeyToken = this.getPasskeyVerificationToken();
    
    if (!pinToken && !passkeyToken) {
      return {
        success: false,
        error: 'PIN or Passkey verification token missing or expired. Please verify again.'
      };
    }
    
    if (pinToken && this.isPinTokenExpiringSoon(10000)) {
      console.warn('⚠️ PIN token expiring in <10s, request may fail');
    }
    
    if (passkeyToken && this.isPasskeyTokenExpiringSoon(10000)) {
      console.warn('⚠️ Passkey token expiring in <10s, request may fail');
    }
    
    return this.post('/api/offramp/confirm-account-and-sign', params);
  }

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

  // ============= BENEFICIARY ENDPOINTS =============

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

  async deleteBeneficiary(id: string): Promise<ApiResponse> {
    return this.delete(`/api/offramp/beneficiaries/${id}`);
  }

  async setDefaultBeneficiary(id: string): Promise<ApiResponse> {
    return this.put(`/api/offramp/beneficiaries/${id}/default`);
  }

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

  // ============= HISTORY ENDPOINTS =============

  async getTransactionHistory(params: HistoryParams = {}): Promise<ApiResponse<{
    transactions: Array<any>;
    summary: any;
    pagination: any;
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

  // ============= REWARD ENDPOINTS =============

  async getMyRewardPoints(): Promise<ApiResponse<any>> {
    return this.get('/api/rewards/my-points');
  }

  async getMyRewardHistory(params?: {
    type?: 'invite' | 'trade' | 'referral_bonus';
    limit?: number;
    skip?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    const endpoint = `/api/rewards/my-history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  async getReferralBonusInfo(): Promise<ApiResponse<any>> {
    return this.get('/api/rewards/referral-info');
  }

  async getRewardLeaderboard(params?: {
    type?: 'total' | 'invite' | 'trade' | 'referral';
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/rewards/leaderboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  async getRewardRules(): Promise<ApiResponse<any>> {
    return this.get('/api/rewards/rules');
  }

  async getRewardStats(): Promise<ApiResponse<any>> {
    return this.get('/api/rewards/stats');
  }
}

// Export singleton instance
const apiClient = new ApiClient(BASE_URL);

export default apiClient;
export { ApiClient };
export type { ApiResponse, TokenData, HistoryParams };