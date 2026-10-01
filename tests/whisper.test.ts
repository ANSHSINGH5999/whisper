import {
  type CircuitContext,
  CostModel,
  QueryContext,
  createConstructorContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { Contract, ReportStatus, ledger, pureCircuits } from '../managed/whisper/contract/index.js';
import { type WhisperPrivateState, freeSlots, randomSecret, witnesses } from '../src/utils/contract';

setNetworkId('undeployed');

/** Runs circuits locally against an in-memory ledger, switching between users' private keys. */
class WhisperSimulator {
  readonly contract = new Contract<WhisperPrivateState>(witnesses);
  ctx: CircuitContext<WhisperPrivateState>;

  constructor(adminSk: Uint8Array, name = 'Acme Corp') {
    const { currentPrivateState, currentContractState, currentZswapLocalState } = this.contract.initialState(
      createConstructorContext({ secretKey: adminSk }, '0'.repeat(64)),
      name,
    );
    this.ctx = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(currentContractState.data, sampleContractAddress()),
    };
  }

  as(sk: Uint8Array) {
    this.ctx.currentPrivateState = { secretKey: sk };
    return this;
  }

  get ledger() {
    return ledger(this.ctx.currentQueryContext.state);
  }

  private run<R>(r: { context: CircuitContext<WhisperPrivateState>; result: R }): R {
    this.ctx = r.context;
    return r.result;
  }

  addMember = (c: Uint8Array) => this.run(this.contract.impureCircuits.addMember(this.ctx, c));
  submitReport = (body: string, slot = 0n) => this.run(this.contract.impureCircuits.submitReport(this.ctx, body, slot));
  setStatus = (id: bigint, s: ReportStatus) => this.run(this.contract.impureCircuits.setStatus(this.ctx, id, s));
  newRound = () => this.run(this.contract.impureCircuits.newRound(this.ctx));
}

describe('Whisper contract', () => {
  let adminSk: Uint8Array, aliceSk: Uint8Array, bobSk: Uint8Array, sim: WhisperSimulator;

  beforeEach(() => {
    [adminSk, aliceSk, bobSk] = [randomSecret(), randomSecret(), randomSecret()];
    sim = new WhisperSimulator(adminSk);
    sim.addMember(pureCircuits.memberCommitment(aliceSk));
    sim.addMember(pureCircuits.memberCommitment(bobSk));
  });

  it('initialises with the org name and only a hash of the admin key', () => {
    const fresh = new WhisperSimulator(adminSk, 'Fresh Org');
    expect(fresh.ledger.orgName).toBe('Fresh Org');
    expect(fresh.ledger.admin).toEqual(pureCircuits.adminKey(adminSk));
    expect(fresh.ledger.admin).not.toEqual(adminSk);
    expect(fresh.ledger.memberCount).toBe(0n);
    expect(fresh.ledger.reportCount).toBe(0n);
  });

  it('lets a registered member file a report without recording who they are', () => {
    const id = sim.as(aliceSk).submitReport('Safety logs are being falsified');
    const l = sim.ledger;
    expect(id).toBe(0n);
    expect(l.reportCount).toBe(1n);
    expect(l.reports.lookup(0n)).toEqual({ round: 0n, body: 'Safety logs are being falsified', status: ReportStatus.OPEN });
    // The only per-reporter value on-chain is the nullifier, which is not the commitment.
    expect(l.nullifiers.size()).toBe(1n);
    expect(l.nullifiers.member(pureCircuits.memberCommitment(aliceSk))).toBe(false);
    expect(l.nullifiers.member(pureCircuits.nullifier(aliceSk, 0n, 0n))).toBe(true);
  });

  it('rejects reports from someone who is not a member', () => {
    expect(() => sim.as(randomSecret()).submitReport('spam')).toThrow(/not registered/);
  });

  it('rejects reusing a slot in the same round, allows it after a new round', () => {
    sim.as(aliceSk).submitReport('first');
    expect(() => sim.as(aliceSk).submitReport('again', 0n)).toThrow(/already used/);
    sim.as(aliceSk).submitReport('second', 1n);
    expect(freeSlots(sim.ledger, aliceSk)).toEqual([2]);
    sim.as(adminSk).newRound();
    expect(freeSlots(sim.ledger, aliceSk)).toEqual([0, 1, 2]);
    expect(sim.as(aliceSk).submitReport('new round', 0n)).toBe(2n);
  });

  it('caps reports per member per round', () => {
    expect(() => sim.as(aliceSk).submitReport('x', 3n)).toThrow(/out of range/);
  });

  it('keeps members independent: one member using a slot does not consume another', () => {
    sim.as(aliceSk).submitReport('from alice');
    expect(freeSlots(sim.ledger, bobSk)).toEqual([0, 1, 2]);
    expect(sim.as(bobSk).submitReport('from bob')).toBe(1n);
  });

  it('only the admin can add members, triage reports or start a round', () => {
    sim.as(aliceSk).submitReport('report');
    expect(() => sim.as(aliceSk).addMember(pureCircuits.memberCommitment(randomSecret()))).toThrow(/Only the admin/);
    expect(() => sim.as(bobSk).setStatus(0n, ReportStatus.DISMISSED)).toThrow(/Only the admin/);
    expect(() => sim.as(bobSk).newRound()).toThrow(/Only the admin/);
  });

  it('lets the admin update a report status but not invent reports', () => {
    sim.as(aliceSk).submitReport('report');
    sim.as(adminSk).setStatus(0n, ReportStatus.ACKNOWLEDGED);
    expect(sim.ledger.reports.lookup(0n).status).toBe(ReportStatus.ACKNOWLEDGED);
    expect(sim.ledger.reports.lookup(0n).body).toBe('report');
    expect(() => sim.as(adminSk).setStatus(9n, ReportStatus.RESOLVED)).toThrow(/Unknown report/);
  });

  it('derives unlinkable values: nullifiers differ per slot and round, and from the commitment', () => {
    const values = [
      pureCircuits.memberCommitment(aliceSk),
      pureCircuits.adminKey(aliceSk),
      pureCircuits.nullifier(aliceSk, 0n, 0n),
      pureCircuits.nullifier(aliceSk, 0n, 1n),
      pureCircuits.nullifier(aliceSk, 1n, 0n),
    ].map(toHex);
    expect(new Set(values).size).toBe(values.length);
  });
});
