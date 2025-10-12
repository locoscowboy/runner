import crypto from 'crypto';
import { keccak_256 } from '@noble/hashes/sha3';

export class SeedService {
  /**
   * Generate a random server seed (32 bytes)
   */
  static generateServerSeed(): Buffer {
    return crypto.randomBytes(32);
  }

  /**
   * Hash the server seed using Keccak256 (same as Solana program)
   */
  static hashServerSeed(seed: Buffer): Buffer {
    return Buffer.from(keccak_256(seed));
  }

  /**
   * Generate both seed and hash
   */
  static generateSeedPair(): { seed: Buffer; hash: Buffer } {
    const seed = this.generateServerSeed();
    const hash = this.hashServerSeed(seed);
    return { seed, hash };
  }
}

