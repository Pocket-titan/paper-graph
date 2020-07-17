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
const endpoint = "https://api.labs.cognitive.microsoft.com/academic/v1.0";
const root = "/api";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// const api = new AcademicApi({ api_key, endpoint });

app.get(`${root}/evaluate`, async (req, res) => {
  let parameters = parseUrl(req.originalUrl);
  let query = _.pick(parameters.query, [
    "expr",
    "model",
    "count",
    "offset",
    "orderBy",
    "attributes",
  ]);

  console.log("query", query);

  if (!query.expr) {
    throw new Error();
  }

  let url = stringifyUrl({ url: endpoint, query });
  let response = await fetch(url, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": api_key,
    },
  });
  res.send(response);
});

app.get(`${root}/interpret`, async (req, res) => {});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
