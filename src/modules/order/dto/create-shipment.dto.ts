import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty()
  @IsString()
  carrier!: string;

  @ApiProperty()
  @IsString()
  trackingNumber!: string;
}
