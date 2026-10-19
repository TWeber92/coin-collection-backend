import { AuthenticationError } from "../../src/coin-collection-exception/CoinCollectionError";
import { Main } from "../../src/Main";

export const handler = async (event, env) => {
  let responseStatus = 200;
  let responseBody;
  let responseHeaders = { "Content-Type": "application/json" };

  const auth = event.headers.authorization;
  if (!auth) throw new AuthenticationError("Basic auth required", "postCoins");

  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded)
    throw new AuthenticationError("Malformed auth header", "postCoins");

  const [user, pass] = atob(encoded).split(":");
  if (user !== env.EMAIL_ADMIN || pass !== env.EMAIL_PASS)
    throw new AuthenticationError("Invalid credentials", "postCoins");

  const main = new Main(env);
  const controller = main.coinController;

  const req = {
    body: JSON.parse(event.body || "{}"),
    headers: event.headers,
    path: event.path,
    method: event.httpMethod,
  };

  const res = {
    status: (code) => {
      responseStatus = code;
      return {
        json: (data) => {
          responseBody = JSON.stringify(data);
        },
      };
    },
  };

  await controller.postAllStateCoins(req, res);

  return {
    statusCode: responseStatus,
    headers: responseHeaders,
    body: responseBody,
  };
};
