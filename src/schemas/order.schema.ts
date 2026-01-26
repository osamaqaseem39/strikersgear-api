import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: 'COD' })
  paymentMethod: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'pending' })
  status: string; // pending, confirmed, shipped, cancelled
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ status: 1 });
OrderSchema.index({ phone: 1 });
OrderSchema.index({ createdAt: -1 });
