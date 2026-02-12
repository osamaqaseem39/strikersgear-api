import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ProductsService {
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private cacheService: CacheService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    const savedProduct = await product.save();
    
    // Invalidate products cache
    await this.cacheService.del(CacheService.getProductKey());
    await this.cacheService.del(CacheService.getProductKey(undefined, undefined, true));
    
    return savedProduct;
  }

  async findAll(categoryId?: string, activeOnly = false): Promise<Product[]> {
    const cacheKey = CacheService.getProductKey(undefined, categoryId, activeOnly);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const query: any = {};
        if (categoryId) query.category = categoryId;
        if (activeOnly) query.isActive = true;

        return this.productModel
          .find(query)
          .populate('category')
          .populate('brand')
          .sort({ createdAt: -1 })
          .exec();
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = CacheService.getProductKey(id);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.productModel
          .findById(id)
          .populate('category')
          .populate('brand')
          .exec();
      },
      this.CACHE_TTL,
    );
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('category')
      .populate('brand')
      .exec();
    
    // Invalidate cache for this product and product lists
    await this.cacheService.del(CacheService.getProductKey(id));
    await this.cacheService.del(CacheService.getProductKey());
    await this.cacheService.del(CacheService.getProductKey(undefined, undefined, true));
    
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
    
    // Invalidate cache
    await this.cacheService.del(CacheService.getProductKey(id));
    await this.cacheService.del(CacheService.getProductKey());
    await this.cacheService.del(CacheService.getProductKey(undefined, undefined, true));
  }

  async addImage(id: string, imageUrl: string): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { $push: { images: imageUrl } },
        { new: true },
      )
      .exec();
    
    // Invalidate cache
    await this.cacheService.del(CacheService.getProductKey(id));
    
    return updatedProduct;
  }

  async removeImage(id: string, imageUrl: string): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { $pull: { images: imageUrl } },
        { new: true },
      )
      .exec();
    
    // Invalidate cache
    await this.cacheService.del(CacheService.getProductKey(id));
    
    return updatedProduct;
  }
}
