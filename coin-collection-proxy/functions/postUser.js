import { getHMAC, encrypt } from "./auth";
import { Main } from "../../src/Main";
import { AuthenticationError } from "../../src/coin-collection-exception/CoinCollectionError";

export const handler = async (event, env) => {
  let responseStatus = 201;
  let responseBody;
  const main = new Main(env);
  const userController = main.userController;
  const authController = main.authController;
  const { email, password, collection } = JSON.parse(event.body);
  const uuid = crypto.randomUUID();
  const lookupKey = await getHMAC(email, password, env.SERVER_KEY);
  const payload = JSON.stringify({
    lookupKey,
    exp: Date.now() + 86400000,
  });
  const authToken = await encrypt(payload, env.SERVER_KEY);
  const req = {
    body: JSON.stringify({
      email,
      collection,
      sub: uuid,
      lookupKey,
      path: "data",
    }),
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
  if (responseStatus === 200)
    throw new AuthenticationError("User already exists", "signup/postUser");

  await authController.postAuthData(req, res);
  const recover = await getHMAC(email, "", env.SERVER_KEY);
  req.body = JSON.stringify({
    email,
    collection,
    sub: recover,
    lookupKey: uuid,
    path: "data",
  });
  await authController.postAuthData(req, res);

  const body = JSON.parse(req.body);
  body.sub = uuid;
  req.body = JSON.stringify(body);
  await userController.postUserData(req, res);

  return {
    statusCode: responseStatus,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `auth=${authToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
    },
    body: JSON.stringify(responseBody),
  };
};
