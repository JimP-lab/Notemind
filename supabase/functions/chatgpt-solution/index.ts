// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// In some environments (local TypeScript checks) `process` may be unknown; declare
declare const process: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NOTE: To enable OpenAI-powered suggestions, set the environment variable
// OPENAI_API_KEY in your Supabase project (or local env) to your OpenAI API key.
// This code will use the key to call the Chat Completions API and expects the
// model to return a JSON array of suggestion objects like:
// [{"type":"solution","content":"..."}, ...]
// If the key is not present or the OpenAI call fails, the function falls back
// to the built-in `generateTailoredSuggestions` logic below.

async function callOpenAIForSuggestions(problem: string) {
  try {
    // Access environment variable in a way that works in Deno and local Node (for testing)
    const apiKey = (globalThis as any)?.Deno?.env?.get?.('OPENAI_API_KEY') ?? (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : undefined);
    if (!apiKey) return null;

    const promptSystem = `You are an assistant that generates 3 helpful suggestion objects for a user's problem. Respond ONLY with valid JSON: an array of objects with the fields: type (one of \"solution\", \"insight\", \"action\"), and content (a concise helpful suggestion). Example: [{"type":"solution","content":"..."},{"type":"insight","content":"..."},{"type":"action","content":"..."}]`;
    const promptUser = `Problem: ${problem}\n\nGenerate 3 useful suggestions (solution, insight, action) tailored to the problem.`;

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: promptUser }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.error('OpenAI response error', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) return null;

    // Try to parse the assistant content as JSON. If it isn't valid JSON,
    // attempt to extract a JSON substring.
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // Attempt to find a JSON array inside the text
      const m = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch (_) {
          parsed = null;
        }
      }
    }

  if (!Array.isArray(parsed)) return null;

    // Normalize parsed items to expected shape
    const normalized = parsed.map((item: any) => ({
      type: (item.type || 'solution'),
      content: (item.content || String(item)).trim()
    }));

    return normalized;
  } catch (e) {
    console.error('Error calling OpenAI:', e);
    return null;
  }
}

// Generate tailored suggestions based on problem analysis
function generateTailoredSuggestions(problem: string) {
  const lowerProblem = problem.toLowerCase();
  
  // Categorize the problem type
  const categories = {
    timeManagement: ['time', 'schedule', 'busy', 'deadline', 'procrastination', 'productivity', 'organize'],
    relationships: ['relationship', 'friends', 'family', 'partner', 'conflict', 'communication', 'social'],
    career: ['job', 'career', 'work', 'boss', 'interview', 'promotion', 'salary', 'workplace'],
    health: ['health', 'fitness', 'exercise', 'diet', 'stress', 'anxiety', 'sleep', 'mental'],
    finance: ['money', 'budget', 'debt', 'savings', 'investment', 'expense', 'financial'],
    learning: ['learn', 'study', 'skill', 'education', 'course', 'knowledge', 'improve'],
    technology: ['computer', 'software', 'app', 'technical', 'digital', 'online', 'internet'],
    personal: ['confidence', 'motivation', 'habit', 'goal', 'self-improvement', 'personal growth']
  };

  let categoryMatch = 'general';
  for (const [category, keywords] of Object.entries(categories) as Array<[keyof typeof categories, string[]]>) {
    if (keywords.some(keyword => lowerProblem.includes(keyword))) {
      categoryMatch = category as string;
      break;
    }
  }

  // Generate suggestions based on category
  const suggestionTemplates = {
    timeManagement: [
      {
        type: 'solution',
        content: 'Create a priority matrix to identify urgent vs important tasks. Use time-blocking to dedicate specific hours to key activities, and eliminate or delegate low-priority items.'
      },
      {
        type: 'insight',
        content: 'Time management is really energy management. Your productivity peaks at different times - identify when you\'re most focused and schedule your hardest tasks then.'
      },
      {
        type: 'action',
        content: 'Right now, write down your top 3 priorities for tomorrow and block out 2-hour focused work sessions for each one.'
      }
    ],
    relationships: [
      {
        type: 'solution',
        content: 'Practice active listening by reflecting back what the other person says before responding. Set clear boundaries and communicate your needs directly but kindly.'
      },
      {
        type: 'insight',
        content: 'Most relationship conflicts stem from unmet expectations that were never clearly communicated. Focus on understanding rather than being understood.'
      },
      {
        type: 'action',
        content: 'Schedule a calm conversation to discuss the issue. Start with "I feel..." statements instead of "You always..." accusations.'
      }
    ],
    career: [
      {
        type: 'solution',
        content: 'Document your achievements and quantify your impact with numbers. Network within your industry and seek mentorship from someone in your desired position.'
      },
      {
        type: 'insight',
        content: 'Career growth often comes from solving problems others avoid. Look for pain points in your organization and position yourself as the solution.'
      },
      {
        type: 'action',
        content: 'Update your LinkedIn profile today and reach out to one person in your field for a 15-minute informational interview this week.'
      }
    ],
    health: [
      {
        type: 'solution',
        content: 'Start with small, sustainable changes like a 10-minute daily walk or adding one vegetable to each meal. Focus on consistency over perfection.'
      },
      {
        type: 'insight',
        content: 'Health is a system, not a goal. Your physical, mental, and emotional well-being are interconnected - improving one area naturally benefits the others.'
      },
      {
        type: 'action',
        content: 'Choose one healthy habit to start tomorrow - even if it\'s just drinking one extra glass of water. Track it for 7 days.'
      }
    ],
    finance: [
      {
        type: 'solution',
        content: 'Track all expenses for a month to understand spending patterns. Create a budget with the 50/30/20 rule: 50% needs, 30% wants, 20% savings and debt repayment.'
      },
      {
        type: 'insight',
        content: 'Wealth building is about behavior, not income. People with modest incomes who save consistently often outperform high earners who spend everything.'
      },
      {
        type: 'action',
        content: 'Open a separate savings account today and set up an automatic transfer of even $25 per week. Start building the habit immediately.'
      }
    ],
    learning: [
      {
        type: 'solution',
        content: 'Use the Feynman Technique: explain the concept in simple terms as if teaching a child. Practice spaced repetition and connect new information to what you already know.'
      },
      {
        type: 'insight',
        content: 'Learning is most effective when it\'s active and applied. Instead of just consuming information, immediately find ways to use or teach what you\'ve learned.'
      },
      {
        type: 'action',
        content: 'Dedicate 15 minutes today to practice one specific skill. Set a timer and focus on deliberate practice rather than passive consumption.'
      }
    ],
    technology: [
      {
        type: 'solution',
        content: 'Break the technical problem into smaller components. Search for each specific error message or issue separately, and check official documentation first.'
      },
      {
        type: 'insight',
        content: 'Most technical problems have been solved before. The key is asking the right questions and understanding the underlying concepts, not just copying solutions.'
      },
      {
        type: 'action',
        content: 'Write down the exact error message or describe the specific behavior you\'re seeing. Search for this exact phrase in forums or documentation.'
      }
    ],
    personal: [
      {
        type: 'solution',
        content: 'Set small, achievable goals to build momentum. Celebrate small wins and focus on progress, not perfection. Surround yourself with supportive people who believe in your growth.'
      },
      {
        type: 'insight',
        content: 'Personal growth happens outside your comfort zone, but not in your panic zone. Find the sweet spot where you\'re challenged but not overwhelmed.'
      },
      {
        type: 'action',
        content: 'Identify one small action you can take today that aligns with who you want to become. Do it, then acknowledge yourself for taking that step.'
      }
    ],
    general: [
      {
        type: 'solution',
        content: 'Break the problem into smaller, manageable parts. Focus on what you can control and take one concrete action step, even if it\'s small.'
      },
      {
        type: 'insight',
        content: 'Every problem contains the seeds of its own solution. Sometimes the challenge is exactly what you need to grow and develop new capabilities.'
      },
      {
        type: 'action',
        content: 'Write down three possible approaches to this problem. Choose the simplest one and take the first step today.'
      }
    ]
  };

  // Type-safe access into suggestionTemplates
  const key = categoryMatch as keyof typeof suggestionTemplates;
  return suggestionTemplates[key] ?? suggestionTemplates.general;
}

serve(async (req: Request) => {
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

    console.log('Generating tailored solution for problem:', problem.slice(0, 50));

    // First attempt: call OpenAI if available
    let suggestions = await callOpenAIForSuggestions(problem);

    // If OpenAI not configured or returned invalid data, fall back to the local generator
    if (!suggestions || suggestions.length === 0) {
      suggestions = generateTailoredSuggestions(problem);
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in chatgpt-solution function:', msg);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate solution',
        details: msg
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});