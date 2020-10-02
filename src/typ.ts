export type Id = number;

export type Node = {
  id: Id;
};

export type Link = {
  source: Id;
  target: Id;
  value: number;
};

export type Graph = {
  nodes: Node[];
  links: Link[];
};

// still trying to make this work

type EntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Entity = {
  Id: number;
  Ty: EntityType;
};

type EntityMap<T> = {
  0: Paper;
  1: Author;
  2: Journal;
  3: ConferenceSeries;
  4: ConferenceInstance;
  5: Affiliation;
  6: FieldOfStudy;
}[T extends EntityType ? T : T extends Entity ? T["Ty"] : never];

type InvertedAbstract = {
  IndexLength: number;
  InvertedIndex: { [word: string]: number[] }[];
};

type Source = {
  Ty: "1" | "2" | "3" | "4" | "5" | "6" | "7";
  U: string;
};

type Paper = Entity & {
  Ty: 0;
  AA?: {
    AfId?: number;
    AfN?: string;
    AuId?: number;
    AuN?: string;
    DAuN?: string;
    DAfN?: string;
    S?: number;
  };
  AW?: string[];
  BT?: string;
  BV?: string;
  C?: {
    CId?: number;
    CN?: string;
  };
  CC?: number;
  CitCon?: { [Id: number]: string[] }[];
  D?: Date;
  DN?: string;
  DOI?: string;
  ECC?: number;
  F?: {
    DFN?: string;
    FId?: number;
    FN?: string;
  };
  FamId?: number;
  FP?: string;
  I?: string;
  IA?: InvertedAbstract;
  J?: {
    JId?: number;
    JN?: string;
  };
  LP?: string;
  PB?: string;
  Pt?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
  RId?: Id[];
  S?: Source[];
  Ti?: string;
  V?: string;
  VFN?: string;
  VSN?: string;
  W?: string[];
  Y?: number;
};

type Author = Entity & {
  Ty: 1;
};

type Journal = Entity & {
  Ty: 2;
};

type ConferenceSeries = Entity & {
  Ty: 3;
};

type ConferenceInstance = Entity & {
  Ty: 4;
};

type Affiliation = Entity & {
  Ty: 5;
};

type FieldOfStudy = Entity & {
  Ty: 6;
};

type Attribute<T = unknown> = T extends EntityType
  ? keyof EntityMap<T>
  : T extends Entity
  ? keyof EntityMap<T["Ty"]>
  : keyof Entity;

type X<A extends Entity, B extends keyof A> = {
  [K in B]: A[K] extends object ? { [L in keyof A[K]]: A[K][L] } : A[K];
};

type AA = X<Paper, "Ti" | "S">;

type EvaluateParameters = {
  expr: string;
  model?: string;
};

type PostParameters = {
  body: string;
};

const evaluate = async <A extends EvaluateParameters | PostParameters>(
  parameters: A
): Promise<{
  expr: string;
  entities: Entity[];
  aborted: boolean;
}> => {
  let result = await fetch(, { method:  });
};
