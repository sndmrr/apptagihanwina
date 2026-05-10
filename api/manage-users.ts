import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type',
  'Access-Control-Allow-Credentials': 'true',
};

const createErrorResponse = (message: string, detail?: any, status = 400) => {
  return {
    statusCode: status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: message,
      ...(detail !== undefined && { detail })
    })
  };
};

export default async (req: VercelRequest, res: VercelResponse) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Client-Info, apikey, Content-Type');
    return res.status(204).send('');
  }

  // Set CORS headers on all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('No authorization header');
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client for JWT verification
    const supabaseClient = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Invalid token:', userError);
      res.status(401).json({ error: 'Invalid token' });
      return;
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
      res.status(403).json({ error: 'Unauthorized: Admin access required' });
      return;
    }

    console.log('Admin verified:', user.id);

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    const body = req.body;
    console.log('Request body:', body);
    const { action, fullName, username, password, role, userId, registrationId, canEditData, canDeleteData, canLunasData } = body;

    console.log('Action requested:', action);

    if (action === 'create') {
      // Validate required fields
      if (!fullName || !username || !password || !role) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      console.log('Creating user:', username);

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${username}@syakirdigital.local`,
        password: password,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError);
        res.status(400).json({
          error: authError?.message || 'Failed to create user',
          detail: { authError, authData }
        });
        return;
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
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        res.status(400).json({
          error: 'Failed to create profile',
          detail: profileError
        });
        return;
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
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        res.status(400).json({
          error: 'Failed to create role',
          detail: roleCreateError
        });
        return;
      }

      console.log('Role created for user:', authData.user.id);

      res.status(200).json({
        success: true,
        message: 'User created successfully',
        userId: authData.user.id
      });
      return;

    } else if (action === 'approve_registration') {
      if (!registrationId || !fullName || !username || !password) {
        res.status(400).json({ error: 'Missing required approval fields' });
        return;
      }

      console.log('Approving registration:', registrationId);

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${username}@syakirdigital.local`,
        password: password,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user for registration:', authError);
        res.status(400).json({
          error: authError?.message || 'Failed to create user',
          detail: { authError, authData }
        });
        return;
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          username: username,
          created_by: user.id,
        });

      if (profileError) {
        console.error('Error creating profile for registration:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        res.status(400).json({
          error: 'Failed to create profile for registration',
          detail: profileError
        });
        return;
      }

      const { error: roleCreateError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role || 'mitra',
        });

      if (roleCreateError) {
        console.error('Error creating role for registration:', roleCreateError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        res.status(400).json({
          error: 'Failed to create role for registration',
          detail: roleCreateError
        });
        return;
      }

      const { error: updateError } = await supabaseAdmin
        .from('pending_registrations')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', registrationId);

      if (updateError) {
        console.error('Error updating registration status:', updateError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        res.status(400).json({ error: 'Failed to update registration status' });
        return;
      }

      res.status(200).json({ success: true, message: 'Registration approved and user created' });
      return;

    } else if (action === 'delete') {
      if (!userId) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }

      console.log('Deleting user:', userId);

      // Delete tagihan records
      console.log('Deleting tagihan records for user:', userId);
      const { error: tagihanError } = await supabaseAdmin
        .from('tagihan')
        .delete()
        .eq('user_id', userId);

      if (tagihanError) {
        console.error('Error deleting tagihan:', tagihanError);
        res.status(400).json({ error: 'Failed to delete user tagihan' });
        return;
      }

      // Delete profit settings
      const { error: profitError } = await supabaseAdmin
        .from('profit_settings')
        .delete()
        .eq('user_id', userId);

      if (profitError) {
        console.error('Error deleting profit settings:', profitError);
      }

      // Delete user roles
      const { error: roleDeleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleDeleteError) {
        console.error('Error deleting user roles:', roleDeleteError);
      }

      // Delete profile
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileDeleteError) {
        console.error('Error deleting profile:', profileDeleteError);
      }

      // Delete auth user
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError);
        res.status(400).json({ error: 'Failed to delete user' });
        return;
      }

      console.log('User deleted successfully:', userId);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
      return;

    } else if (action === 'update') {
      if (!userId) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }

      console.log('Updating user:', userId);

      // Update auth user password if provided
      if (password) {
        const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password: password }
        );

        if (passwordError) {
          console.error('Error updating password:', passwordError);
          res.status(400).json({ error: 'Failed to update password' });
          return;
        }
      }

      // Update profile
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
        })
        .eq('user_id', userId);

      if (profileUpdateError) {
        console.error('Error updating profile:', profileUpdateError);
        res.status(400).json({ error: 'Failed to update profile' });
        return;
      }

      // Update role if provided
      if (role) {
        const { error: roleUpdateError } = await supabaseAdmin
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);

        if (roleUpdateError) {
          console.error('Error updating role:', roleUpdateError);
          res.status(400).json({ error: 'Failed to update role' });
          return;
        }
      }

      console.log('User updated successfully:', userId);
      res.status(200).json({ success: true, message: 'User updated successfully' });
      return;

    } else {
      res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      detail: error.message
    });
  }
};
