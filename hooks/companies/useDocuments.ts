import { Document, DocumentType } from '@/types';
import { supabase } from '@/utils/supabase';
import { deleteFile, getStoragePathFromPublicUrl, STORAGE_BUCKETS } from '@/utils/uploadUtils';
import { useCallback, useEffect, useState } from 'react';

export function useDocuments(userId?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (type?: DocumentType) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_application_snapshot', false)
        .order('uploaded_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_application_snapshot', false)
        .order('uploaded_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error refreshing documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId, fetchDocuments]);

  const addDocument = useCallback(async (documentData: Partial<Document>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select();

      if (error) {
        throw error;
      }

      await refreshDocuments();

      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding document:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [refreshDocuments]);

  const updateDocument = useCallback(async (
    documentId: string,
    documentData: Partial<Pick<Document, 'name' | 'type'>>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const payload = Object.fromEntries(
        Object.entries(documentData).filter(([, value]) => value !== undefined)
      );

      const { data, error } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', documentId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentId ? { ...document, ...data } : document
        )
      );

      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating document:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setError(null);
      const targetDocument = documents.find((document) => document.id === documentId);
      const storagePath = getStoragePathFromPublicUrl(
        STORAGE_BUCKETS.DOCUMENTS,
        targetDocument?.file_url
      );

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      if (storagePath) {
        try {
          await deleteFile(STORAGE_BUCKETS.DOCUMENTS, storagePath);
        } catch (storageError) {
          console.error('Error deleting document file:', storageError);
        }
      }

      await refreshDocuments();

      return { error: null };
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message);
      return { error: err };
    }
  }, [documents, refreshDocuments]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}
