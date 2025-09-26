import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`Received ${req.method} request to admin-panel`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    if (req.method === 'POST') {
      const body = await req.json();
      const { action, userId, updates } = body;

      console.log(`Admin action: ${action} for user: ${userId}`);

      if (action === 'updateUser' && userId && updates) {
        // Validate that we have valid updates
        if (typeof updates !== 'object' || Object.keys(updates).length === 0) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invalid updates provided' 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        console.log(`Updating user ${userId} with:`, updates);
        
        const { data, error } = await supabaseClient
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select();

        if (error) {
          console.error('Update error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        console.log('User updated successfully:', data);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data,
            message: 'User updated successfully' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      } else if (action === 'banUser' && userId) {
        console.log(`Banning user: ${userId}`);
        
        const { data, error } = await supabaseClient
          .from('profiles')
          .update({ ban: 1 })
          .eq('id', userId)
          .select();

        if (error) {
          console.error('Ban error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        console.log('User banned successfully:', data);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data,
            message: 'User banned successfully' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      } else if (action === 'unbanUser' && userId) {
        console.log(`Unbanning user: ${userId}`);
        
        const { data, error } = await supabaseClient
          .from('profiles')
          .update({ ban: 0 })
          .eq('id', userId)
          .select();

        if (error) {
          console.error('Unban error:', error);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }

        console.log('User unbanned successfully:', data);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data,
            message: 'User unbanned successfully'  
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      } else if (action === 'resetBoosters') {
        console.log('Resetting all boosters');
        
        const { data, error } = await supabaseClient
          .from('profiles')
          .update({ grow1: 1, booster_expires_at: null })
          .neq('id', '00000000-0000-0000-0000-000000000000') // Update all records
          .select();

        if (error) {
          console.error('Reset boosters error:', error);
          throw error;
        }

        console.log(`Reset boosters for ${data?.length || 0} users`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Reset boosters for ${data?.length || 0} users`,
            count: data?.length || 0
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );

      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action or missing parameters' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

    } else if (req.method === 'GET') {
      // GET request - return admin panel statistics
      const { data: profilesData, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('id, reg, grow, bone, v_bdog_earned, ban, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: profilesError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      const totalUsers = profilesData?.length || 0;
      const bannedUsers = profilesData?.filter(p => p.ban === 1).length || 0;
      const activeUsers = totalUsers - bannedUsers;

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            profiles: profilesData,
            stats: {
              totalUsers,
              activeUsers,
              bannedUsers
            }
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405 
        }
      );
    }

  } catch (error: any) {
    console.error('Admin panel function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});