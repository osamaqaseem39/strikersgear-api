export class CreateProductDto {
  category: string; // ObjectId
  brand?: string; // ObjectId (optional)
  name: string;
  shortDescription?: string;
  sizeInfo?: string;
  description?: string;
  sizeChart?: string;
  featuredImage?: string;
  gallery?: string[];
  price: number;
  images?: string[];
  isActive?: boolean;
  discountPercentage?: number;
  attributes?: { name: string; value: string }[];
  features?: string[];
}

export class UpdateProductDto {
  category?: string;
  brand?: string;
  name?: string;
  shortDescription?: string;
  sizeInfo?: string;
  description?: string;
  sizeChart?: string;
  featuredImage?: string;
  gallery?: string[];
  price?: number;
  images?: string[];
  isActive?: boolean;
  discountPercentage?: number;
  attributes?: { name: string; value: string }[];
  features?: string[];
}
