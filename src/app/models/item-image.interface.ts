export interface ItemImage {
  id: number;
  image: string;
  uploaded_at: string;
}

export interface ImageUploadRequest {
  image: File;
  content_type_model: 'game' | 'console' | 'accessory';
  object_id: number;
}
