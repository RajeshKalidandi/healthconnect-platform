-- First, let's just focus on creating/updating the admin user without modifying existing constraints
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Delete existing admin user if exists
    DELETE FROM auth.users WHERE email = 'admin@healthconnect.com';
    
    -- Create new admin user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@healthconnect.com',
        crypt('admin@2025', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"role":"admin"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_user_id;

    -- Insert or update admin profile without modifying existing constraints
    INSERT INTO public.profiles (id, role, first_name, last_name)
    VALUES (
        admin_user_id, 
        'admin',
        'Admin',
        'User'
    )
    ON CONFLICT (id) DO UPDATE SET 
        role = 'admin',
        updated_at = NOW();

END
$$;
