import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../../schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class BannersService {
  private readonly CACHE_TTL = 600; // 10 minutes (banners change less frequently)

  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    private cacheService: CacheService,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = new this.bannerModel(createBannerDto);
    const savedBanner = await banner.save();
    
    // Invalidate banners cache
    await this.cacheService.del(CacheService.getBannerKey());
    await this.cacheService.del(CacheService.getBannerKey(undefined, true));
    
    return savedBanner;
  }

  async findAll(activeOnly = false): Promise<Banner[]> {
    const cacheKey = CacheService.getBannerKey(undefined, activeOnly);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const query = activeOnly ? { isActive: true } : {};
        return this.bannerModel
          .find(query)
          .sort({ sortOrder: 1, createdAt: -1 })
          .exec();
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<Banner> {
    const cacheKey = CacheService.getBannerKey(id);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.bannerModel.findById(id).exec();
      },
      this.CACHE_TTL,
    );
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const updatedBanner = await this.bannerModel
      .findByIdAndUpdate(id, updateBannerDto, { new: true })
      .exec();
    
    // Invalidate cache
    await this.cacheService.del(CacheService.getBannerKey(id));
    await this.cacheService.del(CacheService.getBannerKey());
    await this.cacheService.del(CacheService.getBannerKey(undefined, true));
    
    return updatedBanner;
  }

  async remove(id: string): Promise<void> {
    await this.bannerModel.findByIdAndDelete(id).exec();
    
    // Invalidate cache
    await this.cacheService.del(CacheService.getBannerKey(id));
    await this.cacheService.del(CacheService.getBannerKey());
    await this.cacheService.del(CacheService.getBannerKey(undefined, true));
  }
}

