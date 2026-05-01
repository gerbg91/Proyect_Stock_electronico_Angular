import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientResponseError, type RecordModel } from 'pocketbase';
import { StockItem, type StockItemPayload } from '../../models/stock-item';
import { PbService } from '../../services/pb';

@Component({
  selector: 'app-stock',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockComponent {
  private readonly pbService = inject(PbService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly collectionName = 'stock';
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isEditing = computed(() => this.editingId() !== null);

  readonly stockForm = this.formBuilder.nonNullable.group({
    componente: ['', [Validators.required, Validators.maxLength(120)]],
    cantidad: [0, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    void this.initializePage();
  }

  async initializePage(): Promise<void> {
    const editId = this.route.snapshot.queryParamMap.get('editId');
    if (!editId) {
      return;
    }

    this.errorMessage.set(null);

    try {
      const item = await this.pbService.pb.collection(this.collectionName).getOne<StockRecord>(editId);
      this.startEdit(item);
    } catch (error) {
      console.error('Error al cargar el componente:', error);
      this.errorMessage.set(this.getPocketBaseErrorMessage(error, 'No se pudo cargar el componente a editar.'));
    }
  }

  async submitForm(): Promise<void> {
    if (this.stockForm.invalid || this.saving()) {
      this.stockForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const value = this.stockForm.getRawValue();
    const stockItem = StockItem.fromValues(value.componente, value.cantidad);
    const payload: StockItemPayload = stockItem.toPocketBasePayload();

    try {
      const currentEditingId = this.editingId();
      if (currentEditingId) {
        await this.pbService.pb.collection(this.collectionName).update(currentEditingId, payload);
        this.successMessage.set('Registro actualizado correctamente.');
      } else {
        await this.pbService.pb.collection(this.collectionName).create(payload);
        this.successMessage.set('Componente agregado correctamente.');
        this.resetForm();
      }
    } catch (error) {
      console.error('Error al guardar el registro:', error);
      this.errorMessage.set(this.getPocketBaseErrorMessage(error, 'No se pudo guardar el registro.'));
    } finally {
      this.saving.set(false);
    }
  }

  startEdit(item: StockRecord): void {
    this.editingId.set(item.id);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.stockForm.setValue({
      componente: item.componente,
      cantidad: item.cantidad
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.errorMessage.set(null);
    this.stockForm.reset({
      componente: '',
      cantidad: 0
    });
  }

  goToStockGrid(): void {
    this.router.navigate(['/stock']);
  }

  logOut() {
    this.pbService.pb.authStore.clear();
    this.router.navigate(['/login']);
  }

  private getPocketBaseErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ClientResponseError) {
      const details = Object.values(error.data ?? {})
        .map((value) => {
          if (value && typeof value === 'object' && 'message' in value) {
            return String((value as { message: string }).message);
          }
          return null;
        })
        .filter((message): message is string => Boolean(message));

      if (details.length > 0) {
        return `${fallback} ${details.join(' ')}`;
      }

      if (error.message) {
        return `${fallback} ${error.message}`;
      }
    }

    return `${fallback} Intentalo de nuevo.`;
  }
}
type StockRecord = RecordModel & StockItemPayload;