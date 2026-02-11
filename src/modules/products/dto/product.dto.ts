export class CreateProductDto {
  category: string; // ObjectId
  brand?: string; // ObjectId (optional)
  name: string;
  slug?: string;
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
  // Extended commerce fields used by the landing app
  originalPrice?: number;
  salePrice?: number;
  isSale?: boolean;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
  availableSizes?: string[];
  colors?: string[];
  sizeChartImageUrl?: string;
  bodyType?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  inStock?: boolean;
  stockQuantity?: number;
  stockCount?: number;
}

export class UpdateProductDto {
  category?: string;
  brand?: string;
  name?: string;
  slug?: string;
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
  originalPrice?: number;
  salePrice?: number;
  isSale?: boolean;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
  availableSizes?: string[];
  colors?: string[];
  sizeChartImageUrl?: string;
  bodyType?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  inStock?: boolean;
  stockQuantity?: number;
  stockCount?: number;
}
