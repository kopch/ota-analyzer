import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the request body
    const { projectId, timestamp } = await req.json()

    if (!projectId) {
      throw new Error('Project ID is required')
    }

    // Verify the project exists and get its details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found')
    }

    // Get the n8n webhook URL from environment
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL')
    if (!n8nWebhookUrl) {
      throw new Error('N8N webhook URL not configured')
    }

    // Prepare the payload for n8n
    const n8nPayload = {
      projectId: project.id,
      userId: project.user_id,
      projectName: project.name,
      otaUrls: project.ota_urls || [],
      analysisOptions: project.analysis_options || [],
      timestamp: timestamp || new Date().toISOString(),
      webhookUrl: `${supabaseUrl}/functions/v1/update-project-status`
    }

    // Trigger n8n workflow
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`Failed to trigger n8n workflow: ${n8nResponse.statusText}`)
    }

    // Update project status to processing
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      throw new Error(`Failed to update project status: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analysis triggered successfully',
        projectId: projectId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error triggering analysis:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 