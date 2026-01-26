import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SizeDocument = Size & Document;

@Schema({ timestamps: true })
export class Size {
  @Prop({ type: Types.ObjectId, ref: 'SizeType', required: true })
  sizeType: Types.ObjectId;

  @Prop({ required: true })
  label: string; // 7, 42, S, M, L, Free

  @Prop({ default: 0 })
  sortOrder: number;
}

export const SizeSchema = SchemaFactory.createForClass(Size);

// Indexes
SizeSchema.index({ sizeType: 1, label: 1 }, { unique: true });
