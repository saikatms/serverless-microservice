import { CreatePaymentSessionInput } from "../models/dto/CreatePaymentSessionInput";
import Stripe from "stripe";

export const STRIPE_SECRET_KEY =
  "sk_test_51NuBSaSJmsZmiMlG8OJiVDgcNhX0r9P7y4LvQEVJSd5xiZMm1UgyuF3UTYZoJJ6OuvpQ2HHZ4enfV4demBBVEfzJ00IbJs1o7Z"; //process.env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51NuBSaSJmsZmiMlGG7B8MBLTHCDiKjsmXbRXi8nMXvgWUr15uYMfs0LG3nPl7rCSBvwhAbx1I66UHcV2n70Kyl8b00KfNz0RGw"; //process.env.STRIPE_PUBLISHABLE_KEY;
// STRIPE_SECRET_KEY=pk_test_51NuBSaSJmsZmiMlGG7B8MBLTHCDiKjsmXbRXi8nMXvgWUr15uYMfs0LG3nPl7rCSBvwhAbx1I66UHcV2n70Kyl8b00KfNz0RGw;
// STRIPE_PUBLISHABLE_KEY=sk_test_51NuBSaSJmsZmiMlG8OJiVDgcNhX0r9P7y4LvQEVJSd5xiZMm1UgyuF3UTYZoJJ6OuvpQ2HHZ4enfV4demBBVEfzJ00IbJs1o7Z
export const APPLICATION_FEE = (totalAmount: number) => {
  const appFee = 1.5; // application fee in %
  return (totalAmount / 100) * appFee;
};

export const STRIPE_FEE = (totalAmount: number) => {
  const perTransaction = 2.9; // 2.9 % per transaction
  const fixCost = 0.29; // 29 cents
  const stripeCost = (totalAmount / 100) * perTransaction;
  return stripeCost + fixCost;
};

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

export const CreatePaymentSession = async ({
  email,
  phone,
  amount,
  customerId,
}: CreatePaymentSessionInput) => {
  let currentCustomerId: string;

  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    currentCustomerId = customer.id;
  } else {
    const customer = await stripe.customers.create({
      email,
    });
    currentCustomerId = customer.id;
  }

  const { client_secret, id } = await stripe.paymentIntents.create({
    customer: currentCustomerId,
    payment_method_types: ["card"],
    amount: parseInt(`${amount * 100}`),
    currency: "usd",
  });

  return {
    secret: client_secret,
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    paymentId: id,
    customerId: currentCustomerId,
  };
};

export const RetrivePayment = async (paymentId: string) => {
  return stripe.paymentIntents.retrieve(paymentId);
};
