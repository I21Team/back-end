import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/interfaces';
import { Role } from 'src/auth/role.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}