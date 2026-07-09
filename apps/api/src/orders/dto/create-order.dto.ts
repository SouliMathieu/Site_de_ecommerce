import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class OrderItemInput {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Fatou Zongo' })
  @IsString()
  @MinLength(2)
  customerName!: string;

  @ApiProperty({ example: '+22670000000' })
  @IsString()
  customerPhone!: string;

  @ApiProperty({ example: 'Ouagadougou, Secteur 15' })
  @IsString()
  @MinLength(3)
  address!: string;

  @ApiProperty({ type: [OrderItemInput] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items!: OrderItemInput[];
}
