-- Private storage bucket for KYC documents (ID photo + selfie).
-- Users can only write/read their own files, under a `${user_id}/...` path prefix.
-- No public policy — review happens via the service role (see /api/admin/kyc).

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "kyc_docs_insert_own" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "kyc_docs_select_own" ON storage.objects FOR SELECT USING (
  bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text
);
