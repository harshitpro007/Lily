
import { SERVER } from '@config/environment';
import { CURRENCY } from '@modules/subscription/v1/subscriptionConstant';
import StripeModule from 'stripe';
console.log('***************************',SERVER.STRIPE_SECRET);
let Stripe:any;
export class StripePayement {
  init() {
    Stripe= new StripeModule(SERVER.STRIPE_SECRET);
  }

  async createCustomer(params: { email: string, name: string }) {
    try {
      return await Stripe.customers.create({
          email: params.email,
          name: params.name
      });     
    }catch(error) {
      throw error;
    }
  }

  async checkSessionCreation(params: any) {
    try {
      return await Stripe.checkout.sessions.create(params);     
    }catch(error) {
      throw error;
    }
  }

  async invoices(invoice: string) {
    try {
      return await Stripe.invoices.retrieve(invoice);  
    }catch(error) {
      throw error;
    }
  }

  async webHookConstructEvents(payload: any,signature:any) {
    try {
      return await Stripe.webhooks.constructEvent(payload, signature, SERVER.STRIPE_WEBHOOK_SECRET); 
    }catch(error) {
      throw error;
    }
  }

  async createPlan(params:{amount:string,currency:string,interval:string,product:string}) {
    try {
      return await Stripe.plans.create({
        amount: params.amount,
        currency: CURRENCY.USD,
        interval: params.interval,
        product: params.product,
      }); 
    }catch(error) {
      throw error;
    }
  }

  async createPrice(params:{amount:string,currency:string,interval:string,product?:string}) {
    try {
      return await Stripe.plans.create({
        unit_amount: params.amount,
        currency: CURRENCY.USD,
        recurring: {
          interval: params.interval,
        },
        product_data: {
          name: params.product,
        }
      }); 
    }catch(error) {
      throw error;
    }
  }

  async getpaymentMethods (paymentMethodId:string) {
    try {
      return await Stripe.paymentMethods.retrieve(
        paymentMethodId
      );
    }
    catch(error) {
      throw error;
    }
  }
}

export const stripe = new StripePayement();