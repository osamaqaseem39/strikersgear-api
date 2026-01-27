import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SizesService } from './sizes.service';
import { CreateSizeTypeDto, CreateSizeDto } from './dto/size.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('sizes')
export class SizesController {
  constructor(private readonly sizesService: SizesService) {}

  // Size Types
  @Post('types')
  createSizeType(@Body() createSizeTypeDto: CreateSizeTypeDto) {
    return this.sizesService.createSizeType(createSizeTypeDto);
  }

  @Public()
  @Get('types')
  findAllSizeTypes() {
    return this.sizesService.findAllSizeTypes();
  }

  @Public()
  @Get('types/:id')
  findOneSizeType(@Param('id') id: string) {
    return this.sizesService.findOneSizeType(id);
  }

  // Sizes
  @Post()
  createSize(@Body() createSizeDto: CreateSizeDto) {
    return this.sizesService.createSize(createSizeDto);
  }

  @Public()
  @Get()
  findAllSizes(@Query('sizeTypeId') sizeTypeId?: string) {
    return this.sizesService.findAllSizes(sizeTypeId);
  }

  @Public()
  @Get(':id')
  findOneSize(@Param('id') id: string) {
    return this.sizesService.findOneSize(id);
  }

  @Patch(':id')
  updateSize(@Param('id') id: string, @Body() updateSizeDto: Partial<CreateSizeDto>) {
    return this.sizesService.updateSize(id, updateSizeDto);
  }

  @Delete(':id')
  removeSize(@Param('id') id: string) {
    return this.sizesService.removeSize(id);
  }
}
