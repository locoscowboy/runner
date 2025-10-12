'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useProgram, getRacePDA, getEscrowPDA } from '@/lib/solana/program';
import { solToLamports, lamportsToSol } from '@/lib/utils/format';
import { MIN_BET_LAMPORTS, MAX_BET_LAMPORTS } from '@/lib/utils/constants';

interface Props {
  raceId: number;
}

export function BettingInput({ raceId }: Props) {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePlaceBet() {
    if (!publicKey || !program || !amount) return;

    try {
      setLoading(true);

      const lamports = solToLamports(parseFloat(amount));

      if (lamports < MIN_BET_LAMPORTS || lamports > MAX_BET_LAMPORTS) {
        alert(`Bet must be between ${lamportsToSol(MIN_BET_LAMPORTS)} and ${lamportsToSol(MAX_BET_LAMPORTS)} SOL`);
        return;
      }

      const racePDA = getRacePDA(raceId);
      const escrowPDA = getEscrowPDA(raceId);

      const tx = await program.methods
        .placeBet(new BN(lamports))
        .accounts({
          race: racePDA,
          escrow: escrowPDA,
          player: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Bet placed! TX:', tx);
      setAmount('');
      
      // Show success message
      alert('Bet placed successfully!');
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function setPresetAmount(value: number) {
    setAmount(value.toString());
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Place Your Bet</h3>

      <div className="space-y-4">
        {/* Amount input */}
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            step="0.01"
            min={lamportsToSol(MIN_BET_LAMPORTS)}
            max={lamportsToSol(MAX_BET_LAMPORTS)}
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2">
          {[0.01, 0.05, 0.1, 0.5, 1].map((value) => (
            <button
              key={value}
              onClick={() => setPresetAmount(value)}
              className="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors"
            >
              {value} SOL
            </button>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={handlePlaceBet}
          disabled={!publicKey || !amount || loading}
          className="w-full px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-md font-semibold transition-colors"
        >
          {loading ? 'Placing Bet...' : !publicKey ? 'Connect Wallet' : 'Place Bet'}
        </button>

        <div className="text-xs text-muted-foreground text-center">
          Min: {lamportsToSol(MIN_BET_LAMPORTS)} SOL • Max: {lamportsToSol(MAX_BET_LAMPORTS)} SOL
        </div>
      </div>
    </div>
  );
}

