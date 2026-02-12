import { Injectable, BadRequestException } from '@nestjs/common';
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

  /**
   * Generate a URL-friendly slug from the product name.
   */
  private generateSlug(name: string): string {
    return name
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Ensure the slug is unique by appending a numeric suffix if needed.
   */
  private async getUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.productModel.exists({ slug })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
      if (counter > 100) break;
    }

    return slug;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const payload: CreateProductDto = { ...createProductDto };

      // Auto-generate slug from name if not provided
      if (!payload.slug && payload.name) {
        const baseSlug = this.generateSlug(payload.name);
        payload.slug = await this.getUniqueSlug(baseSlug);
      }

      const product = new this.productModel(payload);
      const savedProduct = await product.save();

      // Invalidate products cache (best-effort, errors are swallowed in CacheService)
      await this.cacheService.del(CacheService.getProductKey());
      await this.cacheService.del(
        CacheService.getProductKey(undefined, undefined, true),
      );

      return savedProduct;
    } catch (error: any) {
      // Handle duplicate key errors (e.g., slug already exists)
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        throw new BadRequestException(
          `A product with this ${field} already exists.`,
        );
      }
      // Handle validation errors
      if (error?.name === 'ValidationError') {
        const messages = Object.values(error.errors || {}).map(
          (e: any) => e.message,
        );
        throw new BadRequestException(
          messages.join(', ') || 'Validation failed',
        );
      }
      throw error;
    }
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
    try {
      const payload: UpdateProductDto = { ...updateProductDto };

      // If name is updated but slug is empty, regenerate slug
      if (!payload.slug && payload.name) {
        const baseSlug = this.generateSlug(payload.name);
        payload.slug = await this.getUniqueSlug(baseSlug);
      }

      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, payload, { new: true })
        .populate('category')
        .populate('brand')
        .exec();

      if (!updatedProduct) {
        throw new BadRequestException('Product not found');
      }

      // Invalidate cache for this product and product lists
      await this.cacheService.del(CacheService.getProductKey(id));
      await this.cacheService.del(CacheService.getProductKey());
      await this.cacheService.del(
        CacheService.getProductKey(undefined, undefined, true),
      );

      return updatedProduct;
    } catch (error: any) {
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        throw new BadRequestException(
          `A product with this ${field} already exists.`,
        );
      }
      if (error?.name === 'ValidationError') {
        const messages = Object.values(error.errors || {}).map(
          (e: any) => e.message,
        );
        throw new BadRequestException(
          messages.join(', ') || 'Validation failed',
        );
      }
      throw error;
    }
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
