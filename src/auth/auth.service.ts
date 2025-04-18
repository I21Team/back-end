import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create new user
    const newUser = await this.prisma.utilisateur.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role,
      },
    });

    // Generate JWT token
    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.utilisateur.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    // If user doesn't exist or password doesn't match
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}