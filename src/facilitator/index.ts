export * from "./facilitator";

import { Hono } from "hono";
import { logger } from "hono/logger";

import { SignerWallet } from "../shared/wallet";
import { PaymentNeededDetails } from "../shared/types";
import { settle, verify } from "./facilitator";
import { paymentNeededDetailsFromObj } from "../shared/types/convert";
import { decodePayment } from "../shared/sign";

type VerifyRequest = {
  payload: string;
  details: PaymentNeededDetails;
};

type SettleRequest = {
  payload: string;
  details: PaymentNeededDetails;
};

export function makeServer(wallet: SignerWallet): Hono {
  const app = new Hono();
  app.use("*", logger());

  app.post("/verify", async (c) => {
    // TODO: add zod validation
    const req: VerifyRequest = await c.req.json();

    const paymentDetails = paymentNeededDetailsFromObj(req.details);
    const payload = decodePayment(req.payload);

    const valid = await verify(wallet, payload, paymentDetails);
    return c.json(valid);
  });

  app.post("/settle", async (c) => {
    // TODO: add zod validation
    const req: SettleRequest = await c.req.json();

    const paymentDetails = paymentNeededDetailsFromObj(req.details);
    const payload = decodePayment(req.payload);

    const res = await settle(wallet, payload, paymentDetails);

    console.log("Payment processed", res);
    return c.json(res);
  });

  return app;
}
