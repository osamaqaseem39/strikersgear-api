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
import { CartService } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addItem(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartService.addItem(createCartItemDto);
  }

  @Get()
  findAll(@Query('sessionId') sessionId: string) {
    return this.cartService.findAll(sessionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartItemDto: UpdateCartItemDto) {
    return this.cartService.update(id, updateCartItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }

  @Delete()
  clearCart(@Query('sessionId') sessionId: string) {
    return this.cartService.clearCart(sessionId);
  }
}
