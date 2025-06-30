
-- Update admin users with the specified passwords
UPDATE public.portal_users 
SET password_hash = 'admin@rv' 
WHERE username = 'Sangeeta';

UPDATE public.portal_users 
SET password_hash = 'BOOKWORM' 
WHERE username = 'Shruti';

-- If the users don't exist, insert them
INSERT INTO public.portal_users (username, password_hash, role, full_name, email) 
SELECT 'Sangeeta', 'admin@rv', 'admin', 'Sangeeta', 'sangeeta@rvassociates.com'
WHERE NOT EXISTS (SELECT 1 FROM public.portal_users WHERE username = 'Sangeeta');

INSERT INTO public.portal_users (username, password_hash, role, full_name, email) 
SELECT 'Shruti', 'BOOKWORM', 'admin', 'Shruti', 'shruti@rvassociates.com'
WHERE NOT EXISTS (SELECT 1 FROM public.portal_users WHERE username = 'Shruti');
