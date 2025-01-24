-- Direct approach to ensure admin user exists with correct role
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- First, ensure the user exists in auth.users
    INSERT INTO auth.users (
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role
    )
    VALUES (
        'admin@healthconnect.com',
        crypt('admin@2025', gen_salt('bf')),
        now(),
        '{"provider": "email"}',
        '{"role": "admin"}',
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO 
    UPDATE SET encrypted_password = crypt('admin@2025', gen_salt('bf'))
    RETURNING id INTO v_user_id;

    -- Directly insert/update the profile with admin role
    INSERT INTO public.profiles (
        id,
        role,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        'admin',
        now(),
        now()
    )
    ON CONFLICT (id) DO 
    UPDATE SET 
        role = 'admin',
        updated_at = now();

END $$;
