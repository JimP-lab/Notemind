import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[USE-CREDIT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get current credits
    const { data: credits, error } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      logStep("ERROR fetching credits", { error: error.message });
      throw error;
    }

    // Check if user has unlimited credits
    if (credits.is_unlimited) {
      logStep("User has unlimited credits");
      return new Response(JSON.stringify({ 
        success: true, 
        credits_remaining: credits.credits_remaining,
        is_unlimited: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if user has credits remaining
    if (credits.credits_remaining <= 0) {
      logStep("No credits remaining");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No credits remaining",
        credits_remaining: 0,
        is_unlimited: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Use a credit
    const { data: updatedCredits, error: updateError } = await supabaseClient
      .from('user_credits')
      .update({ 
        credits_remaining: credits.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      logStep("ERROR updating credits", { error: updateError.message });
      throw updateError;
    }

    logStep("Credit used successfully", { newCredits: updatedCredits.credits_remaining });
    return new Response(JSON.stringify({ 
      success: true, 
      credits_remaining: updatedCredits.credits_remaining,
      is_unlimited: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in use-credit", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});