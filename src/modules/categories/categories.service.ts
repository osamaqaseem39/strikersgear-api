import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import {
  CategorySizeType,
  CategorySizeTypeDocument,
} from '../../schemas/category-size-type.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(CategorySizeType.name)
    private categorySizeTypeModel: Model<CategorySizeTypeDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async findAll(activeOnly = false): Promise<Category[]> {
    const query = activeOnly ? { isActive: true } : {};
    return this.categoryModel.find(query).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryModel.findById(id).exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
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
