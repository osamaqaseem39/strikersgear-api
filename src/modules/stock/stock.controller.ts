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
import { StockService } from './stock.service';
import { CreateStockDto, UpdateStockDto } from './dto/stock.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Public()
  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.stockService.findAll(productId);
  }

  @Public()
  @Get('product/:productId/size/:sizeId')
  findByProductAndSize(
    @Param('productId') productId: string,
    @Param('sizeId') sizeId: string,
  ) {
    return this.stockService.findByProductAndSize(productId, sizeId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(id, updateStockDto);
  }

  @Patch('product/:productId/size/:sizeId')
  updateStock(
    @Param('productId') productId: string,
    @Param('sizeId') sizeId: string,
    @Body() body: { quantity: number },
  ) {
    return this.stockService.updateStock(productId, sizeId, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}
