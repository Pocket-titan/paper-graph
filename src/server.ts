import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import _ from "lodash";
import { parseUrl, stringifyUrl } from "query-string";
import { EvaluateParameters, InterpretParameters } from "./types";
import fetch from "node-fetch";
import AcademicApi from "./api";
import api_key from "./api_key";

const port = 4004;
const endpoint = "https://api.labs.cognitive.microsoft.com/academic/v1.0/";
const root = "/api";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const postify = (parameters: object) =>
  Object.entries(parameters)
    .map(
      ([key, value]: [string, string | number]) =>
        `${key}=${value.toString().split(" ").join("%20")}`
    )
    .join("&");

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
      attributes: "Ti,Ty,AA.AuN,CC",
      // orderby: "CC:desc",
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

  res.json({
    results: json.entities.map(({ Ti }: { Ti: string }) => ({
      title: Ti,
    })),
  });
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
