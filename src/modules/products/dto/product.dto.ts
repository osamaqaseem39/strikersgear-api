export class CreateProductDto {
  category: string; // ObjectId
  brand?: string; // ObjectId (optional)
  name: string;
  description?: string;
  price: number;
  images?: string[];
  isActive?: boolean;
}

export class UpdateProductDto {
  category?: string;
  brand?: string;
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  isActive?: boolean;
}
