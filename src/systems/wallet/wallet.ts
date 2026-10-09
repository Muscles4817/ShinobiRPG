import { err, ok, type Result } from '@/core';

/** Currency is "ryo". Kept as its own tiny system so economy rules have one home. */
export interface Wallet {
  readonly ryo: number;
}

export function earn(wallet: Wallet, amount: number): Wallet {
  return { ryo: wallet.ryo + Math.max(0, Math.round(amount)) };
}

export function spend(wallet: Wallet, amount: number): Result<Wallet> {
  if (amount > wallet.ryo) return err(`You need ${amount} ryo but only have ${wallet.ryo}.`);
  return ok({ ryo: wallet.ryo - amount });
}

/** Takes up to `amount`, never going below zero (fines, theft, hospital bills). */
export function deduct(wallet: Wallet, amount: number): Wallet {
  return { ryo: Math.max(0, wallet.ryo - amount) };
}
