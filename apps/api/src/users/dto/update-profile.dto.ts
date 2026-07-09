import { ApiPropertyOptional } from '@nestjs/swagger';
import { SUPPORTED_CURRENCY_CODES } from '@vente/shared';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Aïcha Traoré' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'XOF', enum: SUPPORTED_CURRENCY_CODES })
  @IsOptional()
  @IsIn(SUPPORTED_CURRENCY_CODES)
  currency?: string;
}
