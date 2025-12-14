/**
 * Cryptographically secure password generator
 * Uses Web Crypto API for true randomness
 */

interface PasswordOptions {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    minUppercase?: number;
    minLowercase?: number;
    minNumbers?: number;
    minSymbols?: number;
  }
  
  const DEFAULT_OPTIONS: Required<PasswordOptions> = {
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  };
  
  /**
   * Character sets for password generation
   */
  const CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*-_=+<>?",
  } as const;
  
  /**
   * Get a cryptographically secure random integer between 0 and max (exclusive)
   */
  function getSecureRandomInt(max: number): number {
    if (max <= 0) {
      throw new Error("Max must be greater than 0");
    }
    
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
  }
  
  /**
   * Get a random character from a string using crypto random
   */
  function getRandomChar(chars: string): string {
    return chars[getSecureRandomInt(chars.length)];
  }
  
  /**
   * Shuffle a string using Fisher-Yates algorithm with crypto random
   */
  function shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }
  
  /**
   * Generate a cryptographically secure random password
   * 
   * @param options - Configuration options for password generation
   * @returns A secure random password
   * 
   * @example
   * ```ts
   * // Generate default password (20 chars with all character types)
   * const password = generatePassword();
   * 
   * // Generate custom password
   * const customPassword = generatePassword({
   *   length: 16,
   *   includeSymbols: false,
   *   minUppercase: 2,
   *   minNumbers: 2
   * });
   * ```
   */
  export function generatePassword(options: PasswordOptions = {}): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Validate options
    const minRequiredLength = 
      opts.minUppercase + 
      opts.minLowercase + 
      opts.minNumbers + 
      opts.minSymbols;
      
    if (opts.length < minRequiredLength) {
      throw new Error(
        `Password length (${opts.length}) must be at least ${minRequiredLength} ` +
        `to satisfy minimum requirements`
      );
    }
    
    let password = "";
    let availableChars = "";
    
    // Add required minimum characters from each enabled set
    if (opts.includeUppercase) {
      availableChars += CHAR_SETS.uppercase;
      for (let i = 0; i < opts.minUppercase; i++) {
        password += getRandomChar(CHAR_SETS.uppercase);
      }
    }
    
    if (opts.includeLowercase) {
      availableChars += CHAR_SETS.lowercase;
      for (let i = 0; i < opts.minLowercase; i++) {
        password += getRandomChar(CHAR_SETS.lowercase);
      }
    }
    
    if (opts.includeNumbers) {
      availableChars += CHAR_SETS.numbers;
      for (let i = 0; i < opts.minNumbers; i++) {
        password += getRandomChar(CHAR_SETS.numbers);
      }
    }
    
    if (opts.includeSymbols) {
      availableChars += CHAR_SETS.symbols;
      for (let i = 0; i < opts.minSymbols; i++) {
        password += getRandomChar(CHAR_SETS.symbols);
      }
    }
    
    // If no character sets are enabled, throw error
    if (availableChars.length === 0) {
      throw new Error("At least one character set must be enabled");
    }
    
    // Fill the rest with random characters from all available sets
    while (password.length < opts.length) {
      password += getRandomChar(availableChars);
    }
    
    // Shuffle to avoid predictable patterns (e.g., all uppercase first)
    return shuffleString(password);
  }
  
  /**
   * Generate a secure PIN (numbers only)
   * 
   * @param length - Length of PIN (default: 6)
   * @returns A random PIN
   */
  export function generatePIN(length: number = 6): string {
    return generatePassword({
      length,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      minNumbers: length,
    });
  }
  
  /**
   * Generate a memorable password (no symbols, mixed case and numbers)
   * 
   * @param length - Length of password (default: 16)
   * @returns A memorable password
   */
  export function generateMemorablePassword(length: number = 16): string {
    return generatePassword({
      length,
      includeSymbols: false,
      minUppercase: 2,
      minLowercase: Math.floor(length * 0.6),
      minNumbers: 2,
    });
  }
  
  /**
   * Validate password strength
   * 
   * @param password - Password to validate
   * @returns Strength score (0-4) and feedback
   */
  export function validatePasswordStrength(password: string): {
    score: number;
    strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];
    
    // Check length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    else feedback.push("Use at least 16 characters for better security");
    
    // Check character variety
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    else feedback.push("Include both uppercase and lowercase letters");
    
    if (/\d/.test(password)) score++;
    else feedback.push("Include numbers");
    
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push("Include special characters");
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score--;
      feedback.push("Avoid repeating characters");
    }
    
    if (/^[0-9]+$/.test(password)) {
      score = 0;
      feedback.push("Don't use only numbers");
    }
    
    // Determine strength
    const strengthMap = ['very-weak', 'weak', 'medium', 'strong', 'very-strong'] as const;
    const strength = strengthMap[Math.max(0, Math.min(4, score))];
    
    return {
      score: Math.max(0, Math.min(4, score)),
      strength,
      feedback,
    };
  }
  
  /**
   * Calculate password entropy (bits)
   * Higher entropy = stronger password
   * 
   * @param password - Password to analyze
   * @returns Entropy in bits
   */
  export function calculatePasswordEntropy(password: string): number {
    let charsetSize = 0;
    
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Approximate
    
    return Math.log2(Math.pow(charsetSize, password.length));
  }