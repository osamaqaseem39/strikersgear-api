import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SizesService } from './sizes.service';
import { SizesController } from './sizes.controller';
import { SizeType, SizeTypeSchema } from '../../schemas/size-type.schema';
import { Size, SizeSchema } from '../../schemas/size.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SizeType.name, schema: SizeTypeSchema },
      { name: Size.name, schema: SizeSchema },
    ]),
  ],
  controllers: [SizesController],
  providers: [SizesService],
  exports: [SizesService],
})
export class SizesModule {}
