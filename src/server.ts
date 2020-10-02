import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import _ from "lodash";
import { parseUrl, stringifyUrl } from "query-string";
import fetch from "node-fetch";
import api_key from "./api_key";
import { Graph, Node, Link, Id } from "./typ";

const port = 4004;
const endpoint = "https://api.labs.cognitive.microsoft.com/academic/v1.0/";
const root = "/api";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const match_id = (id: string | number) => `Id=${id}`;

const postify = (parameters: object) =>
  Object.entries(parameters)
    .map(
      ([key, value]: [string, string | number]) =>
        `${key}=${value.toString().split(" ").join("%20")}`
    )
    .join("&");

const MAX_DEPTH = 4;

const dredge = async (ids: Id[], graph: Graph, depth = 0): Promise<Graph> => {
  if (ids.length === 0 || depth > MAX_DEPTH) {
    return graph;
  }

  let expr =
    ids.length === 1 ? match_id(ids[0]) : `Or(${ids.map(match_id).join(",")})`;

  let body = postify({
    expr,
    attributes: "Id,CitCon,CC,Ti",
    count: ids.length,
  });

  return graph;
};

app.get(`${root}/evaluate`, async (req, res) => {
  let query = _.chain(req.query)
    .pick(["expr", "model", "count", "offset", "orderBy", "attributes"])
    .mapValues((value) => value?.toString())
    .value();

  let url = stringifyUrl({ url: endpoint + "evaluate?", query });

  let response = await fetch(url, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": api_key,
    },
  });

  res.json(await response.json());
});

app.get(`${root}/results`, async (req, res) => {
  const input = req.query.input?.toString()?.toLowerCase();

  let query = _.mapValues(
    {
      expr: `And(Ty='0', Or(Ti='${input}', Composite(AA.AuN='${input}')))`,
      count: 5,
      attributes: "Id,Ti,CC,CitCon",
    },
    (value) => value?.toString()
  );

  let url = stringifyUrl({ url: endpoint + "evaluate?", query });

  let response = await fetch(url, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": api_key,
    },
  });

  let json = await response.json();

  res.json(json.entities);
});

app.get(`${root}/papers`, async (req, res) => {
  const Id = parseInt(req.query.Id as string, 10);
  console.log("Id", Id);

  let graph: Graph = await dredge([], {});

  res.json(graph);
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
