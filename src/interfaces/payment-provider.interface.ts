export interface IPaymentProvider {
    createCustomer(email: string): Promise<string>;
    attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;
    updateSubscription(
        subscriptionId: string,
        newPriceId: string
    ): Promise<{ subscriptionId: string; clientSecret: string | null }>;
    createSubscription(
        customerId: string,
        userId: string,
        paymentMethodId: string,
        priceId: string
    ): Promise<{
        subscriptionId: string;
        clientSecret: string | null;
        subscriptionStatus: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        latestInvoiceId: string | null;
    }>;
    cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<void>;
    createPaymentIntent(
        customerId: string,
        price: number,
        destinationAccountId?: string
    ): Promise<{ clientSecret: string; paymentIntentId: string }>;
    handleWebHook(signature: string, body: string): Promise<void>;
}
