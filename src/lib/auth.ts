import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { db } from "./db";
import * as schema from "../db/schema/auth-schema";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2026-03-25.dahlia" as any, // Cast as any if TS has strict apiVersion type mismatch
});

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000/",
  emailAndPassword: { enabled: true },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock",
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "starter",
            priceId: process.env.STRIPE_PRICE_STARTER_MONTHLY || "price_mock_starter_monthly",
            annualDiscountPriceId: process.env.STRIPE_PRICE_STARTER_YEARLY || "price_mock_starter_yearly",
          },
          {
            name: "professional",
            priceId: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || "price_mock_professional_monthly",
            annualDiscountPriceId: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || "price_mock_professional_yearly",
          },
          {
            name: "firm",
            priceId: process.env.STRIPE_PRICE_FIRM_MONTHLY || "price_mock_firm_monthly",
            annualDiscountPriceId: process.env.STRIPE_PRICE_FIRM_YEARLY || "price_mock_firm_yearly",
          },
        ],
      },
    }),
  ],
});

