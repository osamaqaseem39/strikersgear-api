import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../../schemas/brand.schema';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = new this.brandModel(createBrandDto);
    return brand.save();
  }

  async findAll(activeOnly = false): Promise<Brand[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.brandModel.find(query).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Brand> {
    return this.brandModel.findById(id).exec();
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    return this.brandModel
      .findByIdAndUpdate(id, updateBrandDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.brandModel.findByIdAndDelete(id).exec();
  }
}
