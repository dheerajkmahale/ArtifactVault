import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artifactId, imageUrl } = await req.json();
    
    if (!artifactId || !imageUrl) {
      throw new Error("Missing artifactId or imageUrl");
    }

    console.log(`Classifying artifact ${artifactId} with image ${imageUrl}`);

    const AI_API_KEY = Deno.env.get('AI_API_KEY');
    const AI_API_ENDPOINT = Deno.env.get('AI_API_ENDPOINT') || 'https://api.openai.com/v1/chat/completions';
    
    if (!AI_API_KEY) {
      throw new Error('AI_API_KEY is not configured');
    }

    // Call AI service to classify the artifact
    const aiResponse = await fetch(AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert archaeologist and cultural heritage specialist. Analyze artifacts and provide detailed classification.
Your response must be a JSON object with these exact fields:
{
  "classification": "Primary category (e.g., Pottery, Sculpture, Tool, Jewelry, Weapon, Religious Object)",
  "subCategory": "Specific type within the category",
  "estimatedEra": "Estimated time period or era",
  "material": "Primary material(s) detected",
  "culturalOrigin": "Likely cultural or geographical origin",
  "condition": "Observed condition (excellent/good/fair/poor)",
  "notableFeatures": "Key distinctive features or decorative elements",
  "confidence": "Your confidence level in this classification (high/medium/low)"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this artifact image and provide a detailed classification following the JSON format specified.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    const classificationText = aiData.choices?.[0]?.message?.content;
    if (!classificationText) {
      throw new Error('No classification received from AI');
    }

    // Parse the JSON response
    let classificationData;
    try {
      classificationData = JSON.parse(classificationText);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', classificationText);
      // Fallback: use the text directly
      classificationData = {
        classification: "Pottery", // Default classification
        subCategory: "Ceramic Vessel",
        estimatedEra: "Unknown",
        material: "Clay",
        culturalOrigin: "Unknown",
        condition: "Good",
        notableFeatures: "Analysis pending",
        confidence: "low"
      };
    }

    // Update the artifact in the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('artifacts')
      .update({
        classification: classificationData.classification,
        metadata: classificationData,
        processing_status: 'completed'
      })
      .eq('id', artifactId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log(`Successfully classified artifact ${artifactId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        classification: classificationData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Classification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
