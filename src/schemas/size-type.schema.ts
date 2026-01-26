import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SizeTypeDocument = SizeType & Document;

@Schema({ timestamps: true })
export class SizeType {
  @Prop({ required: true })
  name: string; // UK, EU, Alpha, Free
}

export const SizeTypeSchema = SchemaFactory.createForClass(SizeType);
