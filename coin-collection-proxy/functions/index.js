import { handler as getCoin } from "./getCoin.js";
import { handler as postAll } from "./postAll.js";
import { handler as getUser } from "./getUser.js";
import { handler as postUser } from "./postUser.js";
import { handler as putCollection } from "./putUserCollection.js";

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "http://localhost:5500",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const event = {
      path: url.pathname,
      httpMethod: request.method,
      queryStringParameters: Object.fromEntries(url.searchParams),
      body: request.method === "POST" ? await request.text() : null,
    };
    const routerMap = {
      "GET:/api/coin": async () => await getCoin(event, env),
      "POST:/api/login": async () => await getUser(event, env),
      "POST:/api/signup": async () => await postUser(event, env),
      "POST:/api/coins": async () => await postAll(event, env),
      "PUT/api/user/collection": async () => await putCollection(event, env),
    };
    const router = routerMap[`${request.method}:${url.pathname}`];
    if (!router) {
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    }
    const response = await router();
    const responseHeaders = {
      ...response.headers,
      ...corsHeaders,
    };

    try {
      const response = await router();
      return new Response(response.body, {
        status: response.statusCode || 200,
        headers: { ...response.headers, ...corsHeaders },
      });
    } catch (error) {
      return new Response(JSON.stringify(error), {
        status: error.status || 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
