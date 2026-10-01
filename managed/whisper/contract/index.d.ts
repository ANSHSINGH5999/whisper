import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum ReportStatus { OPEN = 0,
                           ACKNOWLEDGED = 1,
                           RESOLVED = 2,
                           DISMISSED = 3
}

export type Report = { round: bigint; body: string; status: ReportStatus };

export type Witnesses<PS> = {
  secretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  memberPath(context: __compactRuntime.WitnessContext<Ledger, PS>,
             commitment_0: Uint8Array): [PS, { leaf: Uint8Array,
                                               path: { sibling: { field: bigint
                                                                },
                                                       goes_left: boolean
                                                     }[]
                                             }];
}

export type ImpureCircuits<PS> = {
  submitReport(context: __compactRuntime.CircuitContext<PS>,
               body_0: string,
               slot_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  addMember(context: __compactRuntime.CircuitContext<PS>,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setStatus(context: __compactRuntime.CircuitContext<PS>,
            id_0: bigint,
            status_0: ReportStatus): __compactRuntime.CircuitResults<PS, []>;
  newRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  submitReport(context: __compactRuntime.CircuitContext<PS>,
               body_0: string,
               slot_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  addMember(context: __compactRuntime.CircuitContext<PS>,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setStatus(context: __compactRuntime.CircuitContext<PS>,
            id_0: bigint,
            status_0: ReportStatus): __compactRuntime.CircuitResults<PS, []>;
  newRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  maxReportsPerRound(): bigint;
  adminKey(sk_0: Uint8Array): Uint8Array;
  memberCommitment(sk_0: Uint8Array): Uint8Array;
  nullifier(sk_0: Uint8Array, rnd_0: bigint, slot_0: bigint): Uint8Array;
}

export type Circuits<PS> = {
  maxReportsPerRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint>;
  adminKey(context: __compactRuntime.CircuitContext<PS>, sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  memberCommitment(context: __compactRuntime.CircuitContext<PS>,
                   sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  nullifier(context: __compactRuntime.CircuitContext<PS>,
            sk_0: Uint8Array,
            rnd_0: bigint,
            slot_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  submitReport(context: __compactRuntime.CircuitContext<PS>,
               body_0: string,
               slot_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  addMember(context: __compactRuntime.CircuitContext<PS>,
            commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setStatus(context: __compactRuntime.CircuitContext<PS>,
            id_0: bigint,
            status_0: ReportStatus): __compactRuntime.CircuitResults<PS, []>;
  newRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly orgName: string;
  readonly admin: Uint8Array;
  members: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined;
    history(): Iterator<__compactRuntime.MerkleTreeDigest>
  };
  readonly memberCount: bigint;
  readonly round: bigint;
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  reports: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Report;
    [Symbol.iterator](): Iterator<[bigint, Report]>
  };
  readonly reportCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>, name_0: string): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
