import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartItem, CartItemDocument } from '../../schemas/cart-item.schema';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { StockService } from '../stock/stock.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItemDocument>,
    private stockService: StockService,
  ) {}

  async addItem(createCartItemDto: CreateCartItemDto): Promise<CartItem> {
    // Check stock availability
    const stock = await this.stockService.findByProductAndSize(
      createCartItemDto.product,
      createCartItemDto.size,
    );

    if (!stock || stock.stockQty < createCartItemDto.quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if item already exists in cart
    const existing = await this.cartItemModel.findOne({
      sessionId: createCartItemDto.sessionId,
      product: createCartItemDto.product,
      size: createCartItemDto.size,
    });

    if (existing) {
      existing.quantity += createCartItemDto.quantity;
      if (existing.quantity > stock.stockQty) {
        throw new Error('Insufficient stock');
      }
      return existing.save();
    }

    const cartItem = new this.cartItemModel(createCartItemDto);
    return cartItem.save();
  }

  async findAll(sessionId: string): Promise<CartItem[]> {
    return this.cartItemModel
      .find({ sessionId })
      .populate('product')
      .populate('size')
      .exec();
  }

  async findOne(id: string): Promise<CartItem> {
    return this.cartItemModel
      .findById(id)
      .populate('product')
      .populate('size')
      .exec();
  }

  async update(id: string, updateCartItemDto: UpdateCartItemDto): Promise<CartItem> {
    const cartItem = await this.cartItemModel.findById(id);
    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Check stock availability
    const stock = await this.stockService.findByProductAndSize(
      cartItem.product.toString(),
      cartItem.size.toString(),
    );

    if (!stock || stock.stockQty < updateCartItemDto.quantity) {
      throw new Error('Insufficient stock');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    return cartItem.save();
  }

  async remove(id: string): Promise<void> {
    await this.cartItemModel.findByIdAndDelete(id).exec();
  }

  async clearCart(sessionId: string): Promise<void> {
    await this.cartItemModel.deleteMany({ sessionId }).exec();
  }
}
