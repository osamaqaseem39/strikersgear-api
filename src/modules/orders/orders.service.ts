import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import {
  OrderItem,
  OrderItemDocument,
} from '../../schemas/order-item.schema';
import { CartItem, CartItemDocument } from '../../schemas/cart-item.schema';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { StockService } from '../stock/stock.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name)
    private orderItemModel: Model<OrderItemDocument>,
    @InjectModel(CartItem.name)
    private cartItemModel: Model<CartItemDocument>,
    private stockService: StockService,
    private cartService: CartService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Get cart items
    const cartItems = await this.cartItemModel
      .find({ sessionId: createOrderDto.sessionId })
      .populate('product')
      .exec();

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      const stock = await this.stockService.findByProductAndSize(
        cartItem.product.toString(),
        cartItem.size.toString(),
      );

      if (!stock || stock.stockQty < cartItem.quantity) {
        throw new Error(
          `Insufficient stock for product ${cartItem.product.toString()}`,
        );
      }

      const product = cartItem.product as any;
      totalAmount += product.price * cartItem.quantity;
    }

    // Create order
    const order = new this.orderModel({
      ...createOrderDto,
      totalAmount,
    });
    const savedOrder = await order.save();

    // Create order items and deduct stock
    for (const cartItem of cartItems) {
      const product = cartItem.product as any;
      const orderItem = new this.orderItemModel({
        order: savedOrder._id,
        product: cartItem.product,
        size: cartItem.size,
        price: product.price,
        quantity: cartItem.quantity,
      });
      await orderItem.save();

      // Deduct stock
      await this.stockService.deductStock(
        cartItem.product.toString(),
        cartItem.size.toString(),
        cartItem.quantity,
      );
    }

    // Clear cart
    await this.cartService.clearCart(createOrderDto.sessionId);

    return this.orderModel
      .findById(savedOrder._id)
      .populate({
        path: 'orderItems',
        populate: { path: 'product size' },
      })
      .exec();
  }

  async findAll(status?: string): Promise<Order[]> {
    const query = status ? { status } : {};
    return this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) return null;

    const orderItems = await this.orderItemModel
      .find({ order: id })
      .populate('product')
      .populate('size')
      .exec();

    return {
      ...order.toObject(),
      orderItems,
    } as any;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.orderItemModel.deleteMany({ order: id }).exec();
    await this.orderModel.findByIdAndDelete(id).exec();
  }
}
