import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum Role {
  ADMIN = 'ADMIN',
  SALEMANAGER = 'SALEMANAGER',
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}