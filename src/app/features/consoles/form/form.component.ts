import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConsoleService } from '../console.service';
import { MissingComponentService } from '../../../core/missing-component.service';
import { ApiService } from '../../../core/api.service';
import { ImageUploadComponent } from '../../../shared/image-upload/image-upload.component';
import { ItemStatus, ItemStatusLabels } from '../../../models/item-status.enum';
import { Platform, PlatformLabels } from '../../../models/platform.enum';
import { Protective, ProtectiveLabels } from '../../../models/protective.enum';
import { Store, StoreLabels } from '../../../models/store.enum';
import type { MissingComponent } from '../../../models/missing-component.interface';
import type { ConsoleWrite } from '../../../models/console.interface';
import type { ItemImage } from '../../../models/item-image.interface';

@Component({
  selector: 'app-console-form',
  imports: [ReactiveFormsModule, RouterLink, ImageUploadComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class ConsoleFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consoleService = inject(ConsoleService);
  private missingComponentService = inject(MissingComponentService);
  private api = inject(ApiService);

  protected id = 0;
  protected isEdit = signal(false);
  protected submitting = signal(false);
  protected error = signal('');
  protected availableComponents = signal<MissingComponent[]>([]);
  protected selectedComponentIds = signal<number[]>([]);
  protected images = signal<ItemImage[]>([]);
  protected deletingImageId = signal<number | null>(null);
  protected componentsDisabled = signal(false);
  protected uploadingImage = signal(false);

  protected readonly statuses = Object.values(ItemStatus);
  protected readonly statusLabels = ItemStatusLabels;
  protected readonly platforms = Object.values(Platform);
  protected readonly platformLabels = PlatformLabels;
  protected readonly stores = Object.values(Store);
  protected readonly storeLabels = StoreLabels;
  protected readonly protectives = Object.values(Protective);
  protected readonly protectiveLabels = ProtectiveLabels;

  protected form = this.fb.group({
    name: ['', Validators.required],
    edition: [''],
    model: [''],
    platform: [''],
    region: [''],
    status: [ItemStatus.GOOD, Validators.required],
    price: [0 as number | null],
    total_price: [0 as number | null],
    acquisition_date: [''],
    store: [''],
    protective: [Protective.NONE],
    description: [''],
    complete: [false],
  });

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.missingComponentService.getList().subscribe({
      next: (components) => this.availableComponents.set(components),
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.id = Number(paramId);
      this.isEdit.set(true);
      this.loadItem();
    }

    this.subs.push(
      this.form.get('complete')!.valueChanges.subscribe((val) => {
        if (val) { this.selectedComponentIds.set([]); this.componentsDisabled.set(true); }
        else { this.syncComponentsDisabled(); }
      }),
    );

    this.subs.push(
      this.form.get('status')!.valueChanges.subscribe((val) => {
        if (val === ItemStatus.SEALED) { this.selectedComponentIds.set([]); this.componentsDisabled.set(true); }
        else { this.syncComponentsDisabled(); }
      }),
    );

    // Si hay precio del artículo y el total está vacío, se copia: no hubo gastos añadidos.
    this.subs.push(
      this.form.get('price')!.valueChanges.subscribe(() => {
        const total = this.form.get('total_price');
        if (!total?.value) total?.setValue(this.form.get('price')?.value ?? null, { emitEvent: false });
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private syncComponentsDisabled(): void {
    const complete = this.form.get('complete')?.value;
    const status = this.form.get('status')?.value;
    const disabled = !!complete || status === ItemStatus.SEALED;
    this.componentsDisabled.set(disabled);
    if (disabled) this.selectedComponentIds.set([]);
  }

  private buildData(): ConsoleWrite {
    return {
      name: this.form.value.name!,
      edition: this.form.value.edition || '',
      model: this.form.value.model || null,
      platform: (this.form.value.platform as never) || null,
      region: this.form.value.region || '',
      status: (this.form.value.status as never) || ItemStatus.GOOD,
      description: this.form.value.description || null,
      price: this.form.value.price || null,
      total_price: this.form.value.total_price || this.form.value.price || null,
      acquisition_date: this.form.value.acquisition_date || null,
      store: this.form.value.store || '-',
      protective: (this.form.value.protective as never) || Protective.NONE,
      complete: this.form.value.complete || false,
      missing_component_ids: this.selectedComponentIds(),
    };
  }

  private loadItem(): void {
    this.consoleService.getById(this.id).subscribe({
      next: (console) => {
        this.form.patchValue({
          name: console.name, edition: console.edition || '', model: console.model || '',
          platform: console.platform || '',
          region: console.region, status: console.status,
          price: console.price ? Number(console.price) : null,
          total_price: console.total_price ? Number(console.total_price) : (console.price ? Number(console.price) : null),
          acquisition_date: console.acquisition_date || '', description: console.description || '',
          store: console.store === '-' ? '' : console.store,
          protective: console.protective || Protective.NONE,
          complete: console.complete,
        });
        this.selectedComponentIds.set(console.missing_components.map((c) => c.id));
        this.images.set(console.images);
        this.syncComponentsDisabled();
      },
      error: () => this.error.set('Error al cargar la consola'),
    });
  }

  protected loadImages(): void {
    if (!this.id) return;
    this.consoleService.getById(this.id).subscribe({ next: (item) => this.images.set(item.images) });
  }

  protected deleteImage(imageId: number): void {
    if (!confirm('¿Eliminar esta imagen?')) return;
    this.deletingImageId.set(imageId);
    this.api.delete('images', imageId).subscribe({
      next: () => { this.images.update((imgs) => imgs.filter((i) => i.id !== imageId)); this.deletingImageId.set(null); },
      error: () => { this.deletingImageId.set(null); this.error.set('Error al eliminar la imagen'); },
    });
  }

  protected onImageUploaded(): void { this.loadImages(); }

  protected onCreateUpload(files: FileList | null): void {
    if (!files?.length) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.uploadingImage.set(true);
    this.error.set('');

    this.consoleService.create(this.buildData()).subscribe({
      next: (result) => {
        const formData = new FormData();
        formData.append('image', files[0]);
        formData.append('content_type_model', 'console');
        formData.append('object_id', String(result.id));

        this.api.upload('images', formData).subscribe({
          next: () => this.router.navigate(['/consoles', result.id, 'edit']),
          error: () => this.router.navigate(['/consoles', result.id, 'edit']),
        });
      },
      error: () => {
        this.uploadingImage.set(false);
        this.error.set('Error al guardar');
      },
    });
  }

  protected toggleComponent(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedComponentIds.update((ids) => checked ? [...ids, id] : ids.filter((i) => i !== id));
  }

  protected onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.submitting.set(true);
    this.error.set('');

    const request = this.isEdit()
      ? this.consoleService.update(this.id, this.buildData())
      : this.consoleService.create(this.buildData());

    request.subscribe({
      next: (result) => {
        this.submitting.set(false);
        if (this.isEdit()) {
          this.router.navigate(['/consoles', result.id]);
        } else {
          this.id = result.id;
          this.isEdit.set(true);
          window.history.replaceState({}, '', `/consoles/${result.id}/edit`);
          this.loadItem();
        }
      },
      error: () => { this.submitting.set(false); this.error.set('Error al guardar la consola'); },
    });
  }
}
