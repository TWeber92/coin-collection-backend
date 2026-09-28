import { RateLimitError } from "../../src/coin-collection-exception/CoinCollectionError";
import { Main } from "../../src/Main";
import { sendEmail } from "./mailer";

export const handler = async (event, env) => {
  let responseStatus = 200;
  let responseBody;
  let responseHeaders = { "Content-Type": "application/json" };

  const main = new Main(env);
  const controller = main.userController;

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
    setHeader: (name, value) => {
      responseHeaders[name] = value;
    },
  };
  console.log("rate limiter present:", !!env.PIN_RATE_LIMITER);
  if (env.PIN_RATE_LIMITER) {
    //weed out local env
    const ip = req.headers["cf-connecting-ip"] || "unknown";
    const key = `${ip}:${req.path}`;
    console.log("rate limit key:", ip);
    const { success, limit, remaining, reset } =
      await env.PIN_RATE_LIMITER.limit({ key });
    console.log(success, limit, remaining, reset);
    if (!success)
      throw new RateLimitError("Too many requests. Try again later.");
  }

  await controller.getEmailIndex(req, res);
  const index = JSON.parse(responseBody);
  req.body.index = index;
  const pin = generatePin();
  await sendEmail(req.body.email, pin, env);
  req.body.pin = pin;
  await controller.putTempPin(req, res);

  return {
    statusCode: responseStatus,
    headers: responseHeaders,
    body: responseBody,
  };
};

function generatePin() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (100000 + (array[0] % 900000)).toString();
}
