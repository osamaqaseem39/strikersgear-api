export class CreateCartItemDto {
  sessionId: string;
  product: string; // ObjectId
  size: string; // ObjectId
  quantity: number;
}

export class UpdateCartItemDto {
  quantity: number;
}
