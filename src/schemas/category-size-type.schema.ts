import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategorySizeTypeDocument = CategorySizeType & Document;

@Schema({ timestamps: true })
export class CategorySizeType {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SizeType', required: true })
  sizeType: Types.ObjectId;
}

export const CategorySizeTypeSchema = SchemaFactory.createForClass(CategorySizeType);

// Indexes - ensure unique combination
CategorySizeTypeSchema.index({ category: 1, sizeType: 1 }, { unique: true });
