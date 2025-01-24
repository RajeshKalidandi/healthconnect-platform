-- Direct SQL to create admin user and profile
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- First try to find existing admin user
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@healthconnect.com';
    
    IF v_user_id IS NULL THEN
        -- Create new admin user if doesn't exist
        v_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role,
            created_at,
            updated_at
        )
        VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@healthconnect.com',
            crypt('admin@2025', gen_salt('bf')),
            now(),
            '{"provider": "email"}',
            '{"role": "admin"}',
            'authenticated',
            'authenticated',
            now(),
            now()
        );
    ELSE
        -- Update existing admin user's password
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('admin@2025', gen_salt('bf')),
            updated_at = now(),
            raw_user_meta_data = '{"role": "admin"}'
        WHERE id = v_user_id;
    END IF;

    -- Now handle the profile
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
