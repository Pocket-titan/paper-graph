import { create } from "lodash";

type EntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Entity = {
  /**
   * @description Entity ID
   */
  Id: number;
  /**
   * @description Entity type
   */
  Ty: EntityType;
};

type EntityNameMap<T> = {
  0: "Paper";
  1: "Author";
  2: "Journal";
  3: "Conference Series";
  4: "Conference Instance";
  5: "Affiliation";
  6: "Field of Study";
}[T extends EntityType ? T : T extends Entity ? T["Ty"] : never];

type Unpack<A> = A extends Array<infer E> ? E : A;

type Author = Entity & {
  Ty: 1;
  /**
   * @description Author normalized name
   */
  AuN: string;
  /**
   * @description Author total citation count
   */
  CC: number;
  /**
   * @description Author display name
   */
  DAuN: string;
  /**
   * @description Author total estimated citation count
   */
  ECC: number;
  /**
   * @description Entity ID of the last known affiliation found for the author
   */
  "LKA.AfId": number;
  /**
   * @description Normalized name of the last known affiliation found for the author
   */
  "LKA.AfN": string;
  /**
   * @description Author total publication count
   */
  PC: number;
};

type Paper = Entity & {
  [key: string]: string | number;
};

export type EvaluateParameters = {
  expr: string;
  model?: string;
  count?: number;
  offset?: number;
  orderby?: string;
  attributes?: string;
};

export type EvaluateResponse = {
  expr: string;
  entities: Entity[];
  timed_out: boolean;
};

export type InterpretParameters = {
  query: string;
  complete?: boolean;
  count?: number;
  offset?: number;
  timout?: number;
  model?: string;
};

const createTypeGuard = <T>(parse: (val: any) => T | null) => (
  value: unknown
): value is T => {
  return parse(value) !== null;
};

// kinda weak TODO
const isInterpretParameters = createTypeGuard(
  (x: any): InterpretParameters | null => {
    return x?.query &&
      typeof x?.query === "string" &&
      Object.entries(x).every(
        ([key, value]) =>
          key in ["query", "complete", "count", "offset", "timeout", "model"]
      )
      ? (x as InterpretParameters)
      : null;
  }
);

type Rule = {
  name: string;
  output: {
    type: string;
    value: string;
  };
};

type Interpretation = {
  logprob: number;
  parse: string;
  rules: Rule[];
};

export type InterpretResponse = {
  query: string;
  interpretations: Interpretation[];
  timed_out_count: number;
  timed_out: boolean;
};

export default {};
