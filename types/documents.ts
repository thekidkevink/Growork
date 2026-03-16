import { DocumentType } from './enums';

export interface Document {
  id: string;
  user_id: string;
  type: DocumentType;
  name: string | null;
  file_url: string;
  uploaded_at: string;
} 