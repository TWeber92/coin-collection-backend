import { getHMAC, encrypt } from "./auth";
import { Main } from "../../src/Main";
import { EmailError } from "../../src/coin-collection-exception/CoinCollectionError";

export const handler = async (event, env) => {
  let responseStatus = 201;
  let responseBody;
  const main = new Main(env);
  const controller = main.userController;
  const { email } = JSON.parse(event.body);
  const pin = crypto.randomInt(100000, 1000000).toString();
  const exp = Date.now() + 900000;
  const lookupKey = await getHMAC(email, env.SERVER_KEY);
  const req = {
    body: JSON.stringify({ value: lookupKey, path: "data" }),
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
  //using ehmac as value to get uuid, confirming users in the system
  await controller.getAuthDataByValue(req, res);
  //using ehmac, pin, exp -> ehmac:pin+exp as temp recovery placeholder
  req.body = JSON.stringify({ lookupKey, sub: { pin, exp }, path: "temp" });
  await controller.postAuthTempData(req, res);
  //send temp recovery pin
  await sendEmail(email, pin, env);
  return {
    statusCode: responseStatus,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(responseBody),
  };
};
async function sendEmail(to, pin, env) {
  try {
    const mailer = await WorkerMailer.connect({
      credentials: {
        username: env.EMAIL_ADMIN,
        password: env.EMAIL_PASS,
      },
      authType: "plain",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
    });
    await mailer.send({
      from: { name: "Coin Collection", email: env.EMAIL_ADMIN },
      to: { email: to },
      subject: "Your Password Reset PIN",
      html: `<p>Your PIN: <strong>${pin}</strong></p><p>Expires in 15 minutes.</p>`,
    });
  } catch (error) {
    throw new EmailError(error);
  }
}
