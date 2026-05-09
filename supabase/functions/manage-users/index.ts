import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    // Get the JWT token from the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with anon key for JWT verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Invalid token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || roleData.role !== 'admin') {
      console.error('User is not admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified:', user.id);

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    const body = await req.json();
    const { action, fullName, username, password, role, userId, canEditData, canDeleteData, canLunasData } = body;

    console.log('Action requested:', action);

    if (action === 'create') {
      // Validate required fields
      if (!fullName || !username || !password || !role) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Creating user:', username);

      // Create auth user with admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${username}@syakirdigital.local`,
        password: password,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError);
        return new Response(
          JSON.stringify({ error: authError?.message || 'Failed to create user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Auth user created:', authData.user.id);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          username: username,
          created_by: user.id,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Cleanup: delete the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return new Response(
          JSON.stringify({ error: 'Failed to create profile' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Profile created for user:', authData.user.id);

      // Create role
      const { error: roleCreateError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role,
        });

      if (roleCreateError) {
        console.error('Error creating role:', roleCreateError);
        // Cleanup: delete the auth user (cascade will delete profile)
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return new Response(
          JSON.stringify({ error: 'Failed to create role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Role created for user:', authData.user.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User created successfully',
          userId: authData.user.id 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'delete') {
      // Validate required fields
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Deleting user:', userId);

      // Delete related records first to avoid foreign key constraints
      // Using service role client to bypass RLS policies

      // 1. Delete all tagihan records
      console.log('Deleting tagihan records for user:', userId);
      const { error: tagihanError } = await supabaseAdmin
        .from('tagihan')
        .delete()
        .eq('user_id', userId);

      if (tagihanError) {
        console.error('Error deleting tagihan:', tagihanError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete tagihan records' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Tagihan records deleted');

      // 2. Delete settings record
      console.log('Deleting settings for user:', userId);
      const { error: settingsError } = await supabaseAdmin
        .from('settings')
        .delete()
        .eq('user_id', userId);

      if (settingsError) {
        console.error('Error deleting settings:', settingsError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete settings' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Settings deleted');

      // 3. Delete user_roles record
      console.log('Deleting user_roles for user:', userId);
      const { error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error deleting user_roles:', rolesError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user roles' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('User roles deleted');

      // 4. Delete profiles record
      console.log('Deleting profile for user:', userId);
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete profile' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Profile deleted');

      // 5. Finally, delete the auth user
      console.log('Deleting auth user:', userId);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error('Error deleting auth user:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to delete auth user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User deleted successfully:', userId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User deleted successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'update') {
      // Validate required fields
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Updating user:', userId);

      // Update profile (username, full_name, and permissions)
      const updateData: any = {};
      if (username) updateData.username = username;
      if (fullName) updateData.full_name = fullName;
      if (canEditData !== undefined) updateData.can_edit_data = canEditData;
      if (canDeleteData !== undefined) updateData.can_delete_data = canDeleteData;
      if (canLunasData !== undefined) updateData.can_lunas_data = canLunasData;

      if (Object.keys(updateData).length > 0) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('user_id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          return new Response(
            JSON.stringify({ error: 'Failed to update profile' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('Profile updated for user:', userId);
      }

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: password }
        );

        if (passwordError) {
          console.error('Error updating password:', passwordError);
          return new Response(
            JSON.stringify({ error: 'Failed to update password' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('Password updated for user:', userId);
      }

      // Update role if provided
      if (role) {
        const { error: roleUpdateError } = await supabaseAdmin
          .from('user_roles')
          .update({ role: role })
          .eq('user_id', userId);

        if (roleUpdateError) {
          console.error('Error updating role:', roleUpdateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update role' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.log('Role updated for user:', userId);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User updated successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
