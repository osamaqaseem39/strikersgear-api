export class CreateOrderDto {
  sessionId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod?: string;
}

export class UpdateOrderDto {
  status?: string; // pending, confirmed, shipped, cancelled
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
}
