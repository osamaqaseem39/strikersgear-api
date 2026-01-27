export class CreateProductDto {
  category: string; // ObjectId
  brand?: string; // ObjectId (optional)
  name: string;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  gallery?: string[];
  price: number;
  images?: string[];
  isActive?: boolean;
}

export class UpdateProductDto {
  category?: string;
  brand?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  featuredImage?: string;
  gallery?: string[];
  price?: number;
  images?: string[];
  isActive?: boolean;
}
