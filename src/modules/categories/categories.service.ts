import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import {
  CategorySizeType,
  CategorySizeTypeDocument,
} from '../../schemas/category-size-type.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CategoriesService {
  private readonly CACHE_TTL = 600; // 10 minutes (categories change less frequently)

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(CategorySizeType.name)
    private categorySizeTypeModel: Model<CategorySizeTypeDocument>,
    private cacheService: CacheService,
  ) {}

  /**
   * Generate a URL-friendly slug from the category name.
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

    while (await this.categoryModel.exists({ slug })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
      if (counter > 100) break;
    }

    return slug;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const payload: CreateCategoryDto = {
        ...createCategoryDto,
        parent: createCategoryDto.parent || null,
      };

      // Auto-generate slug if not provided
      if (!payload.slug && payload.name) {
        const baseSlug = this.generateSlug(payload.name);
        payload.slug = await this.getUniqueSlug(baseSlug);
      }

      const category = new this.categoryModel(payload);
      const savedCategory = await category.save();

      // Invalidate categories cache (best-effort, errors are swallowed in CacheService)
      await this.cacheService.del(CacheService.getCategoryKey());
      await this.cacheService.del(
        CacheService.getCategoryKey(undefined, true),
      );

      return savedCategory;
    } catch (error: any) {
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        throw new BadRequestException(
          `A category with this ${field} already exists.`,
        );
      }
      throw error;
    }
  }

  async findAll(activeOnly = false): Promise<Category[]> {
    const cacheKey = CacheService.getCategoryKey(undefined, activeOnly);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const query = activeOnly ? { isActive: true } : {};
        return this.categoryModel
          .find(query)
          .populate('parent', 'name slug')
          .sort({ name: 1 })
          .exec();
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<Category> {
    const cacheKey = CacheService.getCategoryKey(id);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.categoryModel
          .findById(id)
          .populate('parent', 'name slug')
          .exec();
      },
      this.CACHE_TTL,
    );
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const payload: UpdateCategoryDto = {
        ...updateCategoryDto,
        parent:
          updateCategoryDto.parent === ''
            ? null
            : updateCategoryDto.parent ?? undefined,
      };

      // If name is updated but slug is empty, regenerate slug
      if (!payload.slug && payload.name) {
        const baseSlug = this.generateSlug(payload.name);
        payload.slug = await this.getUniqueSlug(baseSlug);
      }

      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, payload, { new: true })
        .exec();

      if (!updatedCategory) {
        throw new BadRequestException('Category not found');
      }

      // Invalidate cache
      await this.cacheService.del(CacheService.getCategoryKey(id));
      await this.cacheService.del(CacheService.getCategoryKey());
      await this.cacheService.del(
        CacheService.getCategoryKey(undefined, true),
      );

      return updatedCategory;
    } catch (error: any) {
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        throw new BadRequestException(
          `A category with this ${field} already exists.`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
    
    // Invalidate cache
    await this.cacheService.del(CacheService.getCategoryKey(id));
    await this.cacheService.del(CacheService.getCategoryKey());
    await this.cacheService.del(CacheService.getCategoryKey(undefined, true));
  }

  async addSizeType(categoryId: string, sizeTypeId: string): Promise<void> {
    const existing = await this.categorySizeTypeModel.findOne({
      category: categoryId,
      sizeType: sizeTypeId,
    });
    if (!existing) {
      const categorySizeType = new this.categorySizeTypeModel({
        category: categoryId,
        sizeType: sizeTypeId,
      });
      await categorySizeType.save();
    }
  }

  async getSizeTypes(categoryId: string): Promise<any[]> {
    return this.categorySizeTypeModel
      .find({ category: categoryId })
      .populate('sizeType')
      .exec();
  }
}
