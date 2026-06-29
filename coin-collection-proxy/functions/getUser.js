import { getHMAC, encrypt } from "./auth";
import { Main } from "../../src/Main";

export const handler = async (event, env) => {
  let responseStatus = 200;
  let responseBody;
  const main = new Main(env);
  const authController = main.authController;
  const userController = main.userController;
  const { email, password } = JSON.parse(event.body);
  const lookupKey = await getHMAC(email, password, env.SERVER_KEY);
  const payload = JSON.stringify({
    lookupKey,
    exp: Date.now() + 86400000,
  });
  const authToken = await encrypt(payload, env.SERVER_KEY);
  const req = {
    body: JSON.stringify({ email, lookupKey }),
    method: event.httpMethod,
    path: event.path,
  };
  const res = {
    status: (code) => {
      responseStatus = code;
      return {
        json: (data) => {
          responseBody = data;
        },
      };
    },
  };
  await authController.getAuthDataByKey(req, res);

  const body = JSON.parse(req.body);
  req.body = JSON.stringify({ ...body, id: responseBody.id });
  await userController.getUserById(req, res);

  return {
    statusCode: responseStatus,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `auth=${authToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
    },
    body: JSON.stringify(responseBody),
  };
};
