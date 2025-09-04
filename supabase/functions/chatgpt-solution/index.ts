import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem } = await req.json();

    if (!problem || problem.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Problem description is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Generating solution for problem:', problem);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert problem solver. Analyze the user's problem and provide 3 different types of responses:
            1. A main solution (practical steps to solve the problem)
            2. An insight (deeper understanding or alternative perspective)
            3. An action step (immediate next step they can take)
            
            Format your response as a JSON array with objects containing:
            - type: "solution", "insight", or "action"
            - content: the actual advice/solution
            
            Keep each response concise but actionable. Be helpful, practical, and encouraging.`
          },
          {
            role: 'user',
            content: `Please help me solve this problem: ${problem}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);
    
    const aiResponse = data.choices[0].message.content;
    
    // Try to parse as JSON, if it fails, create a fallback structure
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (parseError) {
      console.log('Failed to parse JSON, creating fallback structure');
      // If AI didn't return proper JSON, create a structured response
      suggestions = [
        {
          type: 'solution',
          content: aiResponse
        }
      ];
    }

    // Ensure we have the right structure and add IDs and timestamps
    const formattedSuggestions = suggestions.map((suggestion: any, index: number) => ({
      id: `suggestion-${Date.now()}-${index}`,
      type: suggestion.type || 'solution',
      content: suggestion.content || suggestion,
      timestamp: new Date()
    }));

    console.log('Formatted suggestions:', formattedSuggestions);

    return new Response(JSON.stringify({ suggestions: formattedSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chatgpt-solution function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate solution',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});