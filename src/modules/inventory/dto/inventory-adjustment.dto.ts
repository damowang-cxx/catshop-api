import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class InventoryAdjustmentDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty()
  @IsInt()
  delta!: number;

  @ApiProperty()
  @IsString()
  reason!: string;
}
