import { createServer } from "node:https";
import { readFileSync } from "node:fs";
import worker from "./coin-collection-proxy/functions/index";

const env = {
  OORT_ACCESS_KEY: process.env.OORT_ACCESS_KEY,
  OORT_SECRET_KEY: process.env.OORT_SECRET_KEY,
  OORT_BUCKET: process.env.OORT_BUCKET,
};

const PORT = 3000;

const options = {
  key: readFileSync("./certs/key.pem"),
  cert: readFileSync("./certs/cert.pem"),
};

const server = createServer(options, async (req, res) => {
  const url = `https://${req.headers.host}${req.url}`;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);

  const init = { method: req.method, headers: req.headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Buffer.concat(chunks);
  }

  const request = new Request(url, init);
  const response = await worker.fetch(request, env);

  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
});

server.listen(PORT, () => {
  console.log(`Listening on https://localhost:${PORT}`);
});