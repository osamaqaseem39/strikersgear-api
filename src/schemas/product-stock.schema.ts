import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductStockDocument = ProductStock & Document;

@Schema({ timestamps: true })
export class ProductStock {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Size', required: true })
  size: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  stockQty: number;
}

export const ProductStockSchema = SchemaFactory.createForClass(ProductStock);

// Indexes - critical for stock queries
ProductStockSchema.index({ product: 1, size: 1 }, { unique: true });
ProductStockSchema.index({ product: 1 });
ProductStockSchema.index({ stockQty: 1 });
