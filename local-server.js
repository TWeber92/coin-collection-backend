// import { createServer } from "node:https";
// import { readFileSync } from "node:fs";

// const PORT = 3000;

// const options = {
//   key: readFileSync("./certs/key.pem"),
//   cert: readFileSync("./certs/cert.pem"),
// };

// const server = createServer(options, (req, res) => {
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end("Hello from the local HTTPS server\n");
// });

// server.listen(PORT, () => {
//   console.log(`Listening on https://localhost:${PORT}`);
// });