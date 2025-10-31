import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@blinkdotnew/sdk";

const blink = createClient({
  projectId: "vibe-report-chat-analyzer-gmlij3as",
});

// Type helpers
interface StripeEvent {
  type: string;
  data?: {
    object?: {
      id?: string;
      metadata?: {
        user_id?: string;
        tokens?: string;
      };
      customer_email?: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    // Get webhook secret from environment
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Webhook not configured", { status: 500 });
    }

    // Verify webhook signature using async function (required in Deno)
    const { WebhookSignature } = await import("npm:stripe@13.0.0");

    let event: StripeEvent;
    try {
      event = await WebhookSignature.verifyHeaderAsync(
        body,
        signature,
        webhookSecret
      ) as unknown as StripeEvent;
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return new Response("Signature verification failed", { status: 401 });
    }

    console.log(`Processing event: ${event.type}`);

    // Handle checkout.session.completed event
    if (
      event.type === "checkout.session.completed" &&
      event.data?.object?.metadata
    ) {
      const metadata = event.data.object.metadata;
      const userId = metadata.user_id;
      const tokensToAdd = parseInt(metadata.tokens || "0", 10);

      if (!userId || tokensToAdd <= 0) {
        console.error("Invalid metadata:", metadata);
        return new Response("Invalid metadata", { status: 400 });
      }

      try {
        // Get current user credits
        const users = await blink.db.users?.list({
          where: { id: userId },
        });

        if (!users || users.length === 0) {
          console.error(`User not found: ${userId}`);
          return new Response("User not found", { status: 404 });
        }

        const user = users[0];
        const currentCredits = Number(user.credits) || 0;
        const newCredits = currentCredits + tokensToAdd;

        // Update user credits
        await blink.db.users?.update(userId, {
          credits: newCredits,
        });

        console.log(
          `Successfully added ${tokensToAdd} credits to user ${userId}. New balance: ${newCredits}`
        );

        return new Response(
          JSON.stringify({
            success: true,
            userId,
            creditsAdded: tokensToAdd,
            newBalance: newCredits,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Failed to update user credits:", error);
        return new Response("Failed to process payment", { status: 500 });
      }
    }

    // Handle payment_intent.succeeded (backup event)
    if (
      event.type === "payment_intent.succeeded" &&
      event.data?.object?.metadata
    ) {
      const metadata = event.data.object.metadata;
      const userId = metadata.user_id;
      const tokensToAdd = parseInt(metadata.tokens || "0", 10);

      if (!userId || tokensToAdd <= 0) {
        console.log("Skipping payment_intent event - missing metadata");
        return new Response("Event processed", { status: 200 });
      }

      try {
        const users = await blink.db.users?.list({
          where: { id: userId },
        });

        if (!users || users.length === 0) {
          console.log(`User not found for payment_intent: ${userId}`);
          return new Response("Event processed", { status: 200 });
        }

        const user = users[0];
        const currentCredits = Number(user.credits) || 0;
        const newCredits = currentCredits + tokensToAdd;

        await blink.db.users?.update(userId, {
          credits: newCredits,
        });

        console.log(
          `Payment confirmed: Added ${tokensToAdd} credits to user ${userId}`
        );

        return new Response(
          JSON.stringify({
            success: true,
            userId,
            creditsAdded: tokensToAdd,
            newBalance: newCredits,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Failed to process payment_intent:", error);
        return new Response("Event processed", { status: 200 });
      }
    }

    // For other events, just acknowledge receipt
    return new Response(
      JSON.stringify({ received: true, eventType: event.type }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
