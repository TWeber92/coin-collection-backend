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

  // 1. Look up the user by email (controller writes through res)
  await controller.getUserByEmail(req, res);

  // 2. Generate PIN
  const pin = generatePin();

  // 3. Email the PIN
  await sendEmail(req.body.email, pin, env);

  // 4. Attach the PIN to req.body so the controller can store it
  req.body.pin = pin;

  // 5. Store the PIN
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