import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SizeType, SizeTypeDocument } from '../../schemas/size-type.schema';
import { Size, SizeDocument } from '../../schemas/size.schema';
import { CreateSizeTypeDto, CreateSizeDto } from './dto/size.dto';

@Injectable()
export class SizesService {
  constructor(
    @InjectModel(SizeType.name) private sizeTypeModel: Model<SizeTypeDocument>,
    @InjectModel(Size.name) private sizeModel: Model<SizeDocument>,
  ) {}

  // Size Types
  async createSizeType(createSizeTypeDto: CreateSizeTypeDto): Promise<SizeType> {
    const sizeType = new this.sizeTypeModel(createSizeTypeDto);
    return sizeType.save();
  }

  async findAllSizeTypes(): Promise<SizeType[]> {
    return this.sizeTypeModel.find().exec();
  }

  async findOneSizeType(id: string): Promise<SizeType> {
    return this.sizeTypeModel.findById(id).exec();
  }

  // Sizes
  async createSize(createSizeDto: CreateSizeDto): Promise<Size> {
    const size = new this.sizeModel(createSizeDto);
    return size.save();
  }

  async findAllSizes(sizeTypeId?: string): Promise<Size[]> {
    const query = sizeTypeId ? { sizeType: sizeTypeId } : {};
    return this.sizeModel.find(query).sort({ sortOrder: 1, label: 1 }).exec();
  }

  async findOneSize(id: string): Promise<Size> {
    return this.sizeModel.findById(id).populate('sizeType').exec();
  }

  async updateSize(id: string, updateSizeDto: Partial<CreateSizeDto>): Promise<Size> {
    return this.sizeModel
      .findByIdAndUpdate(id, updateSizeDto, { new: true })
      .exec();
  }

  async removeSize(id: string): Promise<void> {
    await this.sizeModel.findByIdAndDelete(id).exec();
  }
}
