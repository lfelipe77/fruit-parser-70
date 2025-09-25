import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Running raffle lifecycle jobs...");

    // Mark funded raffles
    const { error: fundedError } = await supabase.rpc("job_mark_funded");
    if (fundedError) {
      console.error("Error marking funded raffles:", fundedError);
      throw fundedError;
    }

    // Assign next draw
    const { error: drawError } = await supabase.rpc("job_assign_next_draw");
    if (drawError) {
      console.error("Error assigning next draw:", drawError);
      throw drawError;
    }

    console.log("Raffle lifecycle jobs completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Raffle lifecycle jobs completed successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error in assign-next-draw function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as any).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});