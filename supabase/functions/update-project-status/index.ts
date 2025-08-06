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

    // Get the request body from n8n
    const { projectId, status, results, error } = await req.json()

    if (!projectId) {
      throw new Error('Project ID is required')
    }

    // Prepare update data
    const updateData: any = {
      status: status || 'completed',
      updated_at: new Date().toISOString()
    }

    // Add results if provided
    if (results) {
      updateData.results = results
    }

    // Update project status and results
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`)
    }

    // Log the update
    console.log(`Project ${projectId} updated to status: ${status}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Project status updated successfully',
        projectId: projectId,
        status: status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error updating project status:', error)
    
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