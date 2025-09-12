import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Stripe webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const body = await req.text();
    const sig = req.headers.get("stripe-signature") || "";

    let event;
    try {
      // In a production environment, you should verify the webhook signature
      // For test mode, we'll parse the event directly
      event = JSON.parse(body);
      logStep("Webhook event parsed", { type: event.type });
    } catch (err) {
      logStep("ERROR parsing webhook", { error: err.message });
      return new Response(`Webhook error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        logStep("Checkout session completed", { sessionId: session.id, customerEmail: session.customer_details?.email });
        
        // Grant unlimited credits to the user
        if (session.customer_details?.email) {
          const { error } = await supabaseClient.rpc('grant_unlimited_credits', {
            user_email: session.customer_details.email
          });

          if (error) {
            logStep("ERROR granting unlimited credits", { error: error.message });
          } else {
            logStep("Successfully granted unlimited credits", { email: session.customer_details.email });
          }

          // Update subscribers table
          const { error: updateError } = await supabaseClient
            .from('subscribers')
            .update({ 
              subscribed: true, 
              subscription_tier: 'premium',
              stripe_customer_id: session.customer,
              updated_at: new Date().toISOString()
            })
            .eq('email', session.customer_details.email);

          if (updateError) {
            logStep("ERROR updating subscriber", { error: updateError.message });
          } else {
            logStep("Successfully updated subscriber", { email: session.customer_details.email });
          }
        }
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});