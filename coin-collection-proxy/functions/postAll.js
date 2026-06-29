import {
  AuthenticationError,
  AuthorizationError,
} from "../../src/coin-collection-exception/CoinCollectionError";
import { Main } from "../../src/Main";
import { decrypt } from "./auth";

export const handler = async (event, env) => {
  let responseStatus = 200;
  let responseBody;
  const main = new Main(env);
  const controller = main.controller;
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
  const cookie = event.headers.get("Cookie") || "";
  const decrypted = await decrypt(cookie, env.SERVER_KEY);
  const { lookupKey, exp } = JSON.parse(decrypted);
  if (Date.now() > exp)
    throw new AuthenticationError(
      "Cookie Expired",
      "coin-collection-proxy/postAll",
    );
  const { coins } = JSON.parse(event.body);
  const req = {
    body: JSON.stringify({ coins, lookupKey }),
    path: event.path,
    method: event.httpMethod,
  };
  const id = await main.authController.getAuthdataByKey(req, res);
  req.body = JSON.stringify({ id });
  const user = await main.userController.getUserById(req, res);
  if (
    !user.roles.includes("admin") &&
    !user.permissions.includes("write:postAll")
  )
    throw new AuthorizationError();
  // {
  //   const body = JSON.parse(responseBody);
  //   res.status(403).json({
  //     ...body.data,
  //     message: `User: ${body.id} is not authorized`,
  //     name: "AuthorizationError",
  //     context: "coin-collection-proxy/postAll",
  //   });
  //   return handleReturn();
  // }
  await controller.postAllStateCoins(req, res);
  return handleReturn();
};
function handleReturn() {
  return {
    statusCode: responseStatus,
    headers: { "Content-Type": "application/json" },
    body: responseBody,
  };
}
