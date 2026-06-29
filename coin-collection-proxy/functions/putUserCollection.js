import { decrypt } from "./auth";
import { Main } from "../../src/Main";
import { AuthenticationError } from "../../src/coin-collection-exception/CoinCollectionError";

export const handler = async (event, env) => {
  let responseStatus = 200;
  let responseBody;
  const main = new Main(env);
  const controller = main.userController;
  const collection = JSON.parse(event.body);
  const cookie = event.headers.get("Cookie") || null;
  const decrypted = await decrypt(cookie, env.SERVER_KEY);
  const { lookupKey, exp } = JSON.parse(decrypted);
  if (Date.now() > exp)
    throw new AuthenticationError(
      "Session Expired, Please Log In",
      "coin-collection-proxy/putUserCollection",
    );
  const req = {
    body: JSON.stringify({ collection, lookupKey }),
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
  await controller.getAuthDataByKey(req, res);

  body = JSON.parse(req.body);
  req.body = JSON.stringify({ ...body, id: responseBody.id });
  await controller.updateUserData(req, res);

  return {
    statusCode: responseStatus,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(responseBody),
  };
};
