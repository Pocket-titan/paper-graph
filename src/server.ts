import express from "express";
import { parse } from "querystring";
import fetch from "node-fetch";
import AcademicApi from "./api";
import api_key from "./api_key";
const app = express();
const port = 4004;

const endpoint = "https://api.labs.cognitive.microsoft.com/academic/v1.0";

const api = new AcademicApi({ api_key, endpoint });

app.get("/api", (req, res) => {
  let parameters = parse(req.originalUrl);
  console.log("parameters", parameters);
});

app.listen(port, async () => {
  let res = await api.interpret({ query: "albert einstein" });
  console.log("res", res);
  console.log(`Example app listening at http://localhost:${port}`);
});
