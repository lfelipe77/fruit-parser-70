import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY")!;
const AIRTABLE_BASE = Deno.env.get("AIRTABLE_BASE")!;
const AIRTABLE_TABLE = Deno.env.get("AIRTABLE_TABLE")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function airtableUpsert(records: any[]) {
  const chunks = [];
  for (let i=0; i<records.length; i+=10) chunks.push(records.slice(i,i+10));
  
  for (const c of chunks) {
    const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: c.map((r) => ({ fields: r })) }),
    });
    if (!res.ok) throw new Error(`Airtable error ${res.status}: ${await res.text()}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const body = await req.json();
    // Expect { rows: [{...}] } where fields match your Airtable columns
    await airtableUpsert(body.rows || []);
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response("Internal Error", { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});