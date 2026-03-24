import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../password.util';

export class CreateAdminUserDto {
  @ApiProperty()
  @IsString()
  email!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;

  @ApiProperty()
  @IsString()
  roleId!: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INVITED', 'DISABLED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INVITED', 'DISABLED'])
  status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
}
