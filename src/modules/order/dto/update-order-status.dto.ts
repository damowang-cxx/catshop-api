import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status!: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}
