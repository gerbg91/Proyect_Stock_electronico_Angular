export class StockItem {
  constructor(
    public readonly componente: string,
    public readonly cantidad: number
  ) {}

  static fromValues(componente: string, cantidad: number): StockItem {
    return new StockItem(componente.trim(), cantidad);
  }

  toPocketBasePayload(): StockItemPayload {
    return {
      componente: this.componente,
      cantidad: this.cantidad
    };
  }
}

export type StockItemPayload = {
  componente: string;
  cantidad: number;
};
