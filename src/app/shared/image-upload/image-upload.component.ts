import { Component, inject, input, output, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';

export type ContentTypeModel = 'console' | 'game' | 'accessory';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  private api = inject(ApiService);

  contentTypeModel = input.required<ContentTypeModel>();
  objectId = input.required<number>();
  uploaded = output<void>();

  protected uploading = signal(false);
  protected error = signal('');

  protected onFileSelected(files: FileList | null): void {
    if (!files?.length) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('image', file);
    formData.append('content_type_model', this.contentTypeModel());
    formData.append('object_id', String(this.objectId()));

    this.uploading.set(true);
    this.error.set('');

    this.api.upload('images', formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.uploaded.emit();
      },
      error: (err) => {
        this.uploading.set(false);
        if (err.status === 400) {
          this.error.set('Formato de imagen no soportado');
        } else {
          this.error.set('Error al subir la imagen');
        }
      },
    });
  }
}
