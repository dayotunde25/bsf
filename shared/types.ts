export interface Media {
  id: string;
  uploaderId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  eventType: string;
  session: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  session?: string;
  bio?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
