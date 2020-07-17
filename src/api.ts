import { stringify } from "querystring";

type Source = {
  Ty: string;
  U: string;
};

type InvertedAbstract = {
  IndexLength: number;
  InvertedIndex: { [key: string]: number[] };
};

type EntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface Entity {
  Id?: number;
  Ty?: EntityType;
  logprob?: number;
  prob?: number;
  // Paper attributes
  "AA.AfId"?: number;
  "AA.AfN"?: string;
  "AA.AuId"?: number;
  "AA.AuN"?: string;
  "AA.DAuN"?: string;
  "AA.DAfN"?: string;
  "AA.S"?: number;
  AW?: string[];
  BT?: string;
  BV?: string;
  "C.CId"?: number;
  "C.CN"?: string;
  CC?: number;
  CitCon?: { [Id: string]: string[] };
  D?: Date;
  DN?: string;
  DOI?: string;
  ECC?: number;
  "F.DFN"?: string;
  "F.FId"?: number;
  "F.FN"?: string;
  FamId: number;
  FP?: string;
  I?: string;
  IA?: InvertedAbstract;
  "J.JId"?: number;
  "J.JN"?: string;
  LP?: string;
  PB?: string;
  Pt?: string;
  RId?: number[];
  S?: Source[];
  Ti?: string;
  V?: string;
  VFN?: string;
  VSN?: string;
  W?: string[];
  Y?: number;
  // Author attributes
  AuN?: string;
  // CC?: number;
  DAuN?: string;
  // ECC?: number;
  "LKA.AfId"?: number;
  "LKA.AfN"?: string;
  PC?: number;
  // Affiliation attributes
  AfN?: string;
  // CC?: number;
  DAfN?: string;
  // ECC?: number;
  // PC?: number;
}

enum Service {
  Evaluate = "evaluate",
  CalcHistogram = "calchistogram",
  Interpret = "interpret",
  Similarity = "similarity",
}

enum Method {
  GET = "GET",
  POST = "POST",
}

type PostParameters = {
  body: string;
};

const isPostParameters = (parameters: object): parameters is PostParameters => {
  return typeof (parameters as PostParameters).body === "string";
};

type StringifyableParameters = {
  [key: string]: string | number;
};

interface EvaluateResponse {
  expr: string;
  entities: Entity[];
  aborted: boolean;
}

class AcademicApi {
  private api_key: string;
  private endpoint: string;
  // private endpoint = 'https://api.labs.cognitive.microsoft.com/academic/v1.0';
  // private endpoint = 'localhost:4000/api';

  constructor({ api_key, endpoint }: { api_key: string; endpoint: string }) {
    this.api_key = api_key;
    this.endpoint = endpoint;
  }

  private async fetch_api(
    service: Service,
    parameters: object,
    method: Method = isPostParameters(parameters) ? Method.POST : Method.GET
  ) {
    // very hacky
    if (!globalThis.fetch) {
      globalThis.fetch = (await import("node-fetch")) as any;
    }

    let url: string;
    let options: object;

    switch (method) {
      case Method.POST:
        url = `${this.endpoint}/${service}`;
        options = {
          method,
          headers: {
            "Ocp-Apim-Subscription-Key": this.api_key,
            "Content-type": "application/x-www-form-urlencoded",
          },
          body: (parameters as PostParameters).body,
        };
        break;
      case Method.GET:
        url = `${this.endpoint}/${service}?${stringify(
          parameters as StringifyableParameters
        )}`;
        options = {
          method,
          headers: {
            "Ocp-Apim-Subscription-Key": this.api_key,
          },
        };
        break;
    }

    let response = await fetch(url, options);
    let json = await response.json();
    return json;
  }

  public async evaluate(
    parameters:
      | {
          expr: string;
          model?: string;
          count?: number;
          offset?: number;
          orderby?: string;
          attributes?: string;
        }
      | { body: string }
  ) {
    let result: {
      expr: string;
      entities: Entity[];
      timed_out: boolean;
    } = await this.fetch_api(Service.Evaluate, parameters);
    return result;
  }

  public async interpret(
    parameters:
      | {
          query: string;
          complete?: boolean;
          count?: number;
          offset?: number;
          timout?: number;
          model?: string;
        }
      | { body: string }
  ) {
    let result: {
      query: string;
      interpretations: {
        logprob: number;
        parse: string;
        rules: { name: string; output: { type: string; value: string } }[];
      }[];
      timed_out_count: number;
      timed_out: boolean;
    } = await this.fetch_api(Service.Interpret, parameters);
    return result;
  }
}

export default AcademicApi;
