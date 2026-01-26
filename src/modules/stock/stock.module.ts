import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import {
  ProductStock,
  ProductStockSchema,
} from '../../schemas/product-stock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductStock.name, schema: ProductStockSchema },
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
