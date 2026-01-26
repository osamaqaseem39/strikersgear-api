import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductStock,
  ProductStockDocument,
} from '../../schemas/product-stock.schema';
import { CreateStockDto, UpdateStockDto } from './dto/stock.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(ProductStock.name)
    private stockModel: Model<ProductStockDocument>,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<ProductStock> {
    // Check if stock already exists
    const existing = await this.stockModel.findOne({
      product: createStockDto.product,
      size: createStockDto.size,
    });

    if (existing) {
      existing.stockQty = createStockDto.stockQty;
      return existing.save();
    }

    const stock = new this.stockModel(createStockDto);
    return stock.save();
  }

  async findAll(productId?: string): Promise<ProductStock[]> {
    const query = productId ? { product: productId } : {};
    return this.stockModel
      .find(query)
      .populate('product')
      .populate('size')
      .exec();
  }

  async findOne(id: string): Promise<ProductStock> {
    return this.stockModel
      .findById(id)
      .populate('product')
      .populate('size')
      .exec();
  }

  async findByProductAndSize(
    productId: string,
    sizeId: string,
  ): Promise<ProductStock> {
    return this.stockModel
      .findOne({ product: productId, size: sizeId })
      .populate('product')
      .populate('size')
      .exec();
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<ProductStock> {
    return this.stockModel
      .findByIdAndUpdate(id, updateStockDto, { new: true })
      .populate('product')
      .populate('size')
      .exec();
  }

  async updateStock(
    productId: string,
    sizeId: string,
    quantity: number,
  ): Promise<ProductStock> {
    return this.stockModel
      .findOneAndUpdate(
        { product: productId, size: sizeId },
        { stockQty: quantity },
        { new: true, upsert: true },
      )
      .populate('product')
      .populate('size')
      .exec();
  }

  async deductStock(
    productId: string,
    sizeId: string,
    quantity: number,
  ): Promise<boolean> {
    const stock = await this.stockModel.findOne({
      product: productId,
      size: sizeId,
    });

    if (!stock || stock.stockQty < quantity) {
      return false;
    }

    stock.stockQty -= quantity;
    await stock.save();
    return true;
  }

  async remove(id: string): Promise<void> {
    await this.stockModel.findByIdAndDelete(id).exec();
  }
}
