import { Main } from "../../src/Main";

export const handler = async (event, env) => {
  const main = new Main(env);
  const controller = main.controller;

  const req = {
    body: event.body,
    path: event.path,
    method: event.httpMethod,
  };
  let responseStatus = 201;
  let responseBody;

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
    headers: { "Content-Type": "application/json" },
    body: responseBody,
  };
};
