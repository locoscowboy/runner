import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { keccak_256 } from '@noble/hashes/sha3';

interface Player {
  pubkey: PublicKey;
  betAmount: BN;
}

export class WinnerCalculation {
  /**
   * Calculate the winner using the exact same algorithm as the smart contract
   * This ensures the backend can predict the winner before calling resolve_race
   */
  static calculateWinner(params: {
    players: Player[];
    serverSeed: Buffer;
    slotHash: Buffer;
    raceId: number;
    totalPot: BN;
  }): PublicKey {
    // 1. Combine entropy sources (same as contract)
    const raceIdBuffer = Buffer.alloc(8);
    raceIdBuffer.writeBigUInt64LE(BigInt(params.raceId));

    const entropyData = Buffer.concat([
      params.serverSeed,
      params.slotHash,
      raceIdBuffer,
    ]);

    // 2. Generate final random value (same as contract)
    const finalHash = keccak_256(entropyData);
    const randomValue = new BN(finalHash.slice(0, 8), 'le');

    // 3. Select winner using weighted random (same as contract)
    const winnerTicket = randomValue.mod(params.totalPot);
    let cumulative = new BN(0);

    for (const player of params.players) {
      cumulative = cumulative.add(player.betAmount);

      if (cumulative.gt(winnerTicket)) {
        return player.pubkey;
      }
    }

    throw new Error('Winner not found - should never happen');
  }

  /**
   * Get slot hash from SlotHashes sysvar data
   * Replicates the contract's get_slot_hash function
   */
  static async getSlotHashFromSysvar(
    slotHashesData: Buffer,
    targetSlot: number
  ): Promise<Buffer> {
    // SlotHashes format: 8-byte header + array of (slot: u64, hash: [u8; 32])
    const numEntries = Math.min(Math.floor((slotHashesData.length - 8) / 40), 512);

    for (let i = 0; i < numEntries; i++) {
      const offset = 8 + i * 40;
      const slot = slotHashesData.readBigUInt64LE(offset);

      if (Number(slot) === targetSlot) {
        const hash = slotHashesData.slice(offset + 8, offset + 40);
        return hash;
      }
    }

    throw new Error(`Slot hash not found for slot ${targetSlot}`);
  }
}

