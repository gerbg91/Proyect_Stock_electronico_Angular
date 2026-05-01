import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import type { RecordModel } from 'pocketbase';
import { PbService } from '../../services/pb';

@Component({
  selector: 'app-stock-home',
  imports: [CommonModule],
  templateUrl: './stock-home.html',
  styleUrl: './stock-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockHomeComponent {
  private readonly pbService = inject(PbService);
  private readonly router = inject(Router);

  readonly collectionName = 'stock';
  readonly componentes = signal<StockRecord[]>([]);
  readonly loading = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    void this.loadStock();
  }

  async loadStock(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const records = await this.pbService.pb.collection(this.collectionName).getFullList<StockRecord>({
        sort: 'componente'
      });
      this.componentes.set(records);
    } catch (error) {
      console.error('Error al cargar el stock:', error);
      this.errorMessage.set('No se pudo cargar el stock. Revisa la conexión con PocketBase.');
    } finally {
      this.loading.set(false);
    }
  }

  goToStockEditor(): void {
    this.router.navigate(['/stock/editar']);
  }

  goToItemEditor(itemId: string): void {
    this.router.navigate(['/stock/editar'], {
      queryParams: { editId: itemId }
    });
  }

  async deleteItem(item: StockRecord): Promise<void> {
    if (this.deletingId() || this.loading()) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${item.componente}"?`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(item.id);
    this.errorMessage.set(null);

    try {
      await this.pbService.pb.collection(this.collectionName).delete(item.id);
      await this.loadStock();
    } catch (error) {
      console.error('Error al eliminar desde parrilla:', error);
      this.errorMessage.set('No se pudo eliminar el registro desde la parrilla.');
    } finally {
      this.deletingId.set(null);
    }
  }

  logOut(): void {
    this.pbService.pb.authStore.clear();
    this.router.navigate(['/login']);
  }
}

type StockRecord = RecordModel & {
  componente: string;
  cantidad: number;
};
