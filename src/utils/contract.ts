import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import {
  Contract,
  ReportStatus,
  ledger as parseLedger,
  pureCircuits,
  type Ledger,
} from '../../managed/whisper/contract/index.js';

export { ReportStatus, parseLedger, pureCircuits, type Ledger };

/** Everything sensitive lives here, on the user's device only. */
export type WhisperPrivateState = {
  readonly secretKey: Uint8Array;
};

export const whisperPrivateStateId = 'whisperPrivateState';

export const witnesses = {
  secretKey: ({ privateState }: WitnessContext<Ledger, WhisperPrivateState>): [WhisperPrivateState, Uint8Array] => [
    privateState,
    privateState.secretKey,
  ],
  memberPath: ({ ledger, privateState }: WitnessContext<Ledger, WhisperPrivateState>, commitment: Uint8Array) => {
    const path = ledger.members.findPathForLeaf(commitment);
    if (!path) throw new Error('Your key is not registered in this organisation yet');
    return [privateState, path] as [WhisperPrivateState, typeof path];
  },
};

export type WhisperContract = Contract<WhisperPrivateState>;
export type WhisperCircuitKeys = Exclude<keyof WhisperContract['impureCircuits'], number | symbol>;
export type WhisperProviders = MidnightProviders<WhisperCircuitKeys, typeof whisperPrivateStateId, WhisperPrivateState>;
export type DeployedWhisper = FoundContract<WhisperContract>;

export const CompiledWhisper = CompiledContract.make<WhisperContract>('Whisper', Contract<WhisperPrivateState>).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets('./managed/whisper'),
);

export const MAX_REPORTS_PER_ROUND = Number(pureCircuits.maxReportsPerRound());

export const randomSecret = (): Uint8Array => crypto.getRandomValues(new Uint8Array(32));

/** The value a member hands to the admin. Reveals nothing about the secret. */
export const commitmentHex = (sk: Uint8Array): string => toHex(pureCircuits.memberCommitment(sk));

/** Slots this secret has not yet spent in the current round (checked locally, nothing sent). */
export const freeSlots = (state: Ledger, sk: Uint8Array): number[] =>
  Array.from({ length: MAX_REPORTS_PER_ROUND }, (_, slot) => slot).filter(
    (slot) => !state.nullifiers.member(pureCircuits.nullifier(sk, state.round, BigInt(slot))),
  );

export const statusLabel: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'Open',
  [ReportStatus.ACKNOWLEDGED]: 'Acknowledged',
  [ReportStatus.RESOLVED]: 'Resolved',
  [ReportStatus.DISMISSED]: 'Dismissed',
};
