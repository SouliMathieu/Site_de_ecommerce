import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'vendeur@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Un mot de passe robuste123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Aïcha Traoré' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;
}
