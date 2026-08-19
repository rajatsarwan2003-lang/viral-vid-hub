-- Storage access for admins on the private videos + media buckets
CREATE POLICY "Admins can read videos bucket" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload videos bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update videos bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete videos bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read media bucket" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload media bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update media bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete media bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));