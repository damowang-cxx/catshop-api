import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class GoogleAuthorizeQueryDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  state!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  nonce!: string;
}

export class GoogleCallbackDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(2048)
  code!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  nonce!: string;
}
