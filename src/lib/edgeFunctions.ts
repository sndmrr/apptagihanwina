import { supabase } from '@/integrations/supabase/client';

interface EdgeFunctionPayload {
  action: string;
  [key: string]: any;
}

export async function invokeEdgeFunction(payload: EdgeFunctionPayload) {
  console.log('Invoking edge function with payload:', payload);

  try {
    // Get current session to get access token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    // Call Vercel Edge Function
    const response = await fetch('/api/manage-users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract error message with details if available
      const errorMsg = data.error || `HTTP ${response.status}`;
      const error = new Error(errorMsg);
      (error as any).detail = data.detail;
      throw error;
    }

    console.log('Edge function response:', data);
    return { data, error: null };

  } catch (error: any) {
    console.error('Edge function error:', error);
    return { 
      data: null, 
      error: {
        message: error.message,
        detail: error.detail
      }
    };
  }
}

// Helper functions for specific actions
export async function createUser(fullName: string, username: string, password: string, role: 'admin' | 'mitra') {
  return invokeEdgeFunction({
    action: 'create',
    fullName,
    username,
    password,
    role,
  });
}

export async function deleteUser(userId: string) {
  return invokeEdgeFunction({
    action: 'delete',
    userId,
  });
}

export async function updateUser(userId: string, fullName: string, username: string, password?: string, role?: string) {
  return invokeEdgeFunction({
    action: 'update',
    userId,
    fullName,
    username,
    ...(password && { password }),
    ...(role && { role }),
  });
}

export async function approveRegistration(registrationId: string, fullName: string, username: string, password: string, role?: string) {
  return invokeEdgeFunction({
    action: 'approve_registration',
    registrationId,
    fullName,
    username,
    password,
    role: role || 'mitra',
  });
}
