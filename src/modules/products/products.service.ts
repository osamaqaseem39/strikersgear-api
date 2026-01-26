import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(categoryId?: string, activeOnly = false): Promise<Product[]> {
    const query: any = {};
    if (categoryId) query.category = categoryId;
    if (activeOnly) query.isActive = true;

    return this.productModel
      .find(query)
      .populate('category')
      .populate('brand')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Product> {
    return this.productModel
      .findById(id)
      .populate('category')
      .populate('brand')
      .exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('category')
      .populate('brand')
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
  }

  async addImage(id: string, imageUrl: string): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(
        id,
        { $push: { images: imageUrl } },
        { new: true },
      )
      .exec();
  }

  async removeImage(id: string, imageUrl: string): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(
        id,
        { $pull: { images: imageUrl } },
        { new: true },
      )
      .exec();
  }
}
