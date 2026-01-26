export class CreateStockDto {
  product: string; // ObjectId
  size: string; // ObjectId
  stockQty: number;
}

export class UpdateStockDto {
  stockQty?: number;
}
