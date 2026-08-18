CREATE POLICY "Admins can read storage files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('videos','media') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload storage files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('videos','media') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update storage files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('videos','media') AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id IN ('videos','media') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete storage files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('videos','media') AND public.has_role(auth.uid(), 'admin'));