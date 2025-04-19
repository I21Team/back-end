import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from '../common/interfaces';
import { Role } from 'src/auth/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(): Promise<User[]> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('Utilisateur')
      .select('*');

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    return data;
  }

  async findOne(id: number): Promise<User> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('Utilisateur')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return data;
  }

  async findByEmail(email: string): Promise<User> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('Utilisateur')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }

    return data;
  }

 

  async create(createUserDto: CreateUserDto): Promise<User> {
    const supabase = this.supabaseService.getClient();
  
    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: createUserDto.email,
      password: createUserDto.password,
      email_confirm: true,
    });
  
    if (authError) {
      throw new Error(`Error creating auth user: ${authError.message}`);
    }
  
    // 2. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // 10 = salt rounds
  
    // 3. Insérer l'utilisateur dans la table "Utilisateur"
    const { data, error } = await supabase
      .from('Utilisateur')
      .insert([{
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role || Role.ADMIN,
      }])
      .select()
      .single();
  
    if (error) {
      throw new Error(`Error creating user profile: ${error.message}`);
    }
  
    return data;
  }
  

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const supabase = this.supabaseService.getClient();
    
    // Update user profile
    const { data, error } = await supabase
      .from('Utilisateur')
      .update({
        name: updateUserDto.name,
        role: updateUserDto.role,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return data;
  }

  async remove(id: number): Promise<void> {
    const supabase = this.supabaseService.getClient();
    
    // Get user email first
    const { data: userData } = await supabase
      .from('Utilisateur')
      .select('email')
      .eq('id', id)
      .single();

    if (userData?.email) {
      // Delete auth user
      const { data: user } = await supabase.auth.admin.listUsers();
      const authUser = (user.users as { email: string; id: string }[]).find(u => u.email === userData.email);
      
      if (authUser?.id) {
        await supabase.auth.admin.deleteUser(authUser.id);
      }
    }
    
    // Delete user profile
    const { error } = await supabase
      .from('Utilisateur')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}