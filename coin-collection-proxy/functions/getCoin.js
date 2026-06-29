import { ParameterError } from "../../src/coin-collection-exception/CoinCollectionError";
import { Main } from "../../src/Main";

export const handler = async (event, env) => {
  let responseStatus = 200;
  let responseBody;
  const main = new Main(env);
  const controller = main.controller;
  const stateName = event.queryStringParameters.stateName;
  const req = {
    params: { stateName },
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
  if (!stateName) throw new ParameterError("stateName parameter is required");

  await controller.getCoinByStateName(req, res);
  return {
    statusCode: responseStatus,
    headers: { "Content-Type": "application/json" },
    body: responseBody,
  };
};
function handleReturn() {}
