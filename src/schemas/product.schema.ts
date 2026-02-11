import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brand: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  slug: string;

  @Prop()
  shortDescription: string;

  @Prop()
  sizeInfo?: string;

  @Prop()
  description: string;

  @Prop()
  sizeChart?: string;

  @Prop()
  discountPercentage?: number;

  @Prop([
    {
      name: { type: String },
      value: { type: String },
    },
  ])
  attributes?: { name: string; value: string }[];

  @Prop([String])
  features?: string[];

  @Prop()
  featuredImage: string;

  @Prop([String])
  gallery: string[];

  @Prop([String])
  images: string[];

  // Extended commerce fields used by the landing app
  @Prop()
  originalPrice?: number;

  @Prop()
  salePrice?: number;

  @Prop()
  isSale?: boolean;

  @Prop()
  isNew?: boolean;

  @Prop()
  rating?: number;

  @Prop()
  reviews?: number;

  @Prop([String])
  availableSizes?: string[];

  @Prop([String])
  colors?: string[];

  @Prop()
  sizeChartImageUrl?: string;

  @Prop([String])
  bodyType?: string[];

  @Prop([String])
  tags?: string[];

  @Prop({ enum: ['draft', 'published', 'archived'], default: 'published' })
  status?: 'draft' | 'published' | 'archived';

  @Prop()
  inStock?: boolean;

  @Prop()
  stockQuantity?: number;

  @Prop()
  stockCount?: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
