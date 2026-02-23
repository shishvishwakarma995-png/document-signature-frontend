export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  owner_id: string;
  filename: string;
  original_name: string;
  file_url: string;
  status: 'uploaded' | 'pending' | 'signed' | 'rejected';
  created_at: string;
}

export interface Signature {
  id: string;
  document_id: string;
  x: number;
  y: number;
  page: number;
  status: 'pending' | 'signed' | 'rejected';
}