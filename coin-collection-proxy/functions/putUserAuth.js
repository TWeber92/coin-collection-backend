import { getHMAC } from "./auth";
import { Main } from "../../src/Main";
import { AuthenticationError } from "../../src/coin-collection-exception/CoinCollectionError";

export const handler = async (event, env) => {
  let responseStatus = 200;
  let responseBody;
  const main = new Main(env);
  const authController = main.authController;
  const { email, password, pin } = JSON.parse(event.body);
  const eHMAC = await getHMAC(email, "", env.SERVER_KEY);
  const lookupKey = await getHMAC(email, password, env.SERVER_KEY);
  const req = {
    body: JSON.stringify({ value: eHMAC, path: "data" }),
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
  //use ehmac as value to get recovery
  await authController.getAuthDataByValue(req, res);
  const uuid = responseBody.id;
  //use ehmac as key to get pin
  req.body = JSON.stringify({ lookupKey: eHMAC, path: "temp" });
  await authController.getAuthDataByKey(req, res);
  if (Date.now() > responseBody.exp)
    throw new AuthenticationError(
      "PIN Expired",
      "coin-collection-proxy/putUserAuth",
    );
  if (responseBody.pin !== pin)
    throw new AuthenticationError(
      "PIN Does Not Match",
      "coin-collection-proxy/putUserAuth",
    );
  //use lookupKey and uuid to set new credential
  req.body = JSON.stringify({ lookupKey, sub: uuid, path: "data" });
  await authController.postAuthData(req, res);
  //use ehmac to delete temp entry
  req.body = JSON.stringify({ lookupKey: eHMAC, path: "temp" });
  await authController.deleteTempData(req, res);

  return {
    statusCode: responseStatus,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(responseBody),
  };
};
