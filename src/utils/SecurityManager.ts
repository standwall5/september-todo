/**
 * SecurityManager - Handles secure export/import of todo data
 * Features:
 * - AES-256 encryption with user-generated OTP
 * - Time-based expiry (5 minutes)
 * - Data integrity verification
 * - Salt-based key derivation
 */

interface SecureExport {
  encryptedData: string;
  salt: string;
  iv: string;
  timestamp: number;
  expiresAt: number;
  checksum: string;
  version: string;
}

interface AppData {
  todos: any[];
  tabGroups?: any[];
  tabManagerGroups?: any[];
  notes?: any[];
  folders?: any[];
  taskbarIconOrder?: string[];
  settings?: {
    hasSeenTutorial?: string;
    isBgmMuted?: string;
    isSfxMuted?: string;
    selectedTheme?: string;
    userPreferences?: any;
  };
  exportVersion?: string;
  exportDate: string;
  appVersion: string;
  dataTypes?: string[];
}

export class SecurityManager {
  private static readonly EXPIRY_MINUTES = 5;
  private static readonly VERSION = "1.0.0";

  /**
   * Generates a secure 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Derives encryption key from OTP using PBKDF2
   */
  private static async deriveKey(
    otp: string,
    salt: string
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(otp),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Generates random salt
   */
  private static generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }

  /**
   * Generates random IV
   */
  private static generateIV(): Uint8Array {
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    return iv;
  }

  /**
   * Creates SHA-256 checksum of data
   */
  private static async createChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(data)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Encrypts todo data with OTP
   */
  static async encryptData(appData: any, otp: string): Promise<SecureExport> {
    try {
      const data: AppData = {
        ...appData,
        exportDate: appData.exportDate || new Date().toISOString(),
        appVersion: this.VERSION,
      };

      const dataString = JSON.stringify(data);
      const salt = this.generateSalt();
      const iv = this.generateIV();
      const key = await this.deriveKey(otp, salt);

      const encoder = new TextEncoder();
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        key,
        encoder.encode(dataString)
      );

      const encryptedData = Array.from(new Uint8Array(encryptedBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const checksum = await this.createChecksum(dataString);
      const now = Date.now();

      return {
        encryptedData,
        salt,
        iv: Array.from(iv)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
        timestamp: now,
        expiresAt: now + this.EXPIRY_MINUTES * 60 * 1000,
        checksum,
        version: this.VERSION,
      };
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Failed to encrypt data. Please try again.");
    }
  }

  /**
   * Decrypts todo data with OTP
   */
  static async decryptData(
    secureExport: SecureExport,
    otp: string
  ): Promise<AppData> {
    try {
      // Check if data has expired
      if (Date.now() > secureExport.expiresAt) {
        throw new Error(
          "Import data has expired. Please generate a new export."
        );
      }

      // Validate version compatibility
      if (secureExport.version !== this.VERSION) {
        console.warn(
          "Version mismatch detected. Attempting compatibility mode."
        );
      }

      const key = await this.deriveKey(otp, secureExport.salt);
      const iv = new Uint8Array(
        secureExport.iv.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
      );
      const encryptedBuffer = new Uint8Array(
        secureExport.encryptedData
          .match(/.{2}/g)!
          .map((byte) => parseInt(byte, 16))
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        key,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);

      // Verify data integrity
      const computedChecksum = await this.createChecksum(decryptedString);
      if (computedChecksum !== secureExport.checksum) {
        throw new Error(
          "Data integrity check failed. The file may be corrupted or tampered with."
        );
      }

      const data: AppData = JSON.parse(decryptedString);

      // Additional validation
      if (!Array.isArray(data.todos)) {
        throw new Error("Invalid data format detected.");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.error("Decryption failed:", error);
      throw new Error(
        "Failed to decrypt data. Please check your OTP and try again."
      );
    }
  }

  /**
   * Validates OTP format
   */
  static validateOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }

  /**
   * Gets remaining time until expiry in minutes
   */
  static getRemainingTime(secureExport: SecureExport): number {
    const remaining = secureExport.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / (60 * 1000)));
  }

  /**
   * Generates secure filename with timestamp
   */
  static generateSecureFilename(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `september-todos-secure-${timestamp}.json`;
  }

  /**
   * Validates secure export structure
   */
  static isValidSecureExport(data: any): data is SecureExport {
    return (
      typeof data === "object" &&
      typeof data.encryptedData === "string" &&
      typeof data.salt === "string" &&
      typeof data.iv === "string" &&
      typeof data.timestamp === "number" &&
      typeof data.expiresAt === "number" &&
      typeof data.checksum === "string" &&
      typeof data.version === "string"
    );
  }
}
