import { handler as getCoin } from "./getCoin.js";
import { handler as postAll } from "./postAll.js";

export default {
  async fetch(request, env) {
    console.log(env);

    const url = new URL(request.url);
    const event = {
      path: url.pathname,
      httpMethod: request.method,
      queryStringParameters: Object.fromEntries(url.searchParams),
      body: request.method === "POST" ? await request.text() : null,
    };
    const routerMap = {
      "GET:/api/coin": async () => await getCoin(event, env),
      "POST:/api/coins": async () => await postAll(event, env),
    };
    const router = routerMap[`${request.method}:${url.pathname}`];
    if (!router) {
      return new Response("Not Found", { status: 404 });
    }
    const response = await router();
    return new Response(response.body, {
      status: response.statusCode,
      headers: response.headers,
    });
  },
};
