import { createServer } from "node:https";
import { readFileSync } from "node:fs";

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

const server = createServer(options, (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from the local HTTPS server\n");
});

server.listen(PORT, () => {
  console.log(`Listening on https://localhost:${PORT}`);
});