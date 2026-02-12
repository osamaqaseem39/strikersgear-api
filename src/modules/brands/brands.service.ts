import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../../schemas/brand.schema';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  /**
   * Generate a URL-friendly slug from the brand name.
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

    // Loop until we find a slug that does not exist
    // Limit attempts to avoid infinite loops in worst case
    while (await this.brandModel.exists({ slug })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
      if (counter > 100) break;
    }

    return slug;
  }

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    try {
      const payload: CreateBrandDto = { ...createBrandDto };

      // Auto-generate slug from name if not provided
      if (!payload.slug && payload.name) {
        const baseSlug = this.generateSlug(payload.name);
        payload.slug = await this.getUniqueSlug(baseSlug);
      }

      const brand = new this.brandModel(payload);
      return await brand.save();
    } catch (error: any) {
      // Handle duplicate key errors (e.g., slug already exists)
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        throw new BadRequestException(
          `A brand with this ${field} already exists.`,
        );
      }
      throw error;
    }
  }

  async findAll(activeOnly = false): Promise<Brand[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.brandModel.find(query).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Brand> {
    return this.brandModel.findById(id).exec();
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    try {
      const payload: UpdateBrandDto = { ...updateBrandDto };

      // If name is updated but slug is empty, regenerate slug
      if (!payload.slug && payload.name) {
        const baseSlug = this.generateSlug(payload.name);
        payload.slug = await this.getUniqueSlug(baseSlug);
      }

      const updated = await this.brandModel
        .findByIdAndUpdate(id, payload, { new: true })
        .exec();

      if (!updated) {
        throw new BadRequestException('Brand not found');
      }

      return updated;
    } catch (error: any) {
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';
        throw new BadRequestException(
          `A brand with this ${field} already exists.`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.brandModel.findByIdAndDelete(id).exec();
  }
}
