import { Main } from "../../src/Main";

export const handler = async (event) => {
  const main = new Main(process);
  const controller = main.controller;
  const stateName = event.queryStringParameters.stateName;
  if (!stateName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "stateName parameter is required" }),
    };
  }
  const req = {
    params: { stateName },
    path: event.path,
    method: event.httpMethod,
  };
  let responseStatus = 200;
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

  await controller.getCoinByStateName(req, res);
  return {
    statusCode: responseStatus,
    headers: { "Content-Type": "application/json" },
    body: responseBody,
  };
};
