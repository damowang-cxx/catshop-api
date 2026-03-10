import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateReturnDto {
  @ApiProperty()
  @IsString()
  reason!: string;
}
