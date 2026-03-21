import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { EmailService } from "../email/email.service";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService
  ) {}

  async create(createUserDto: CreateUserDto, companyId: string) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        role: createUserDto.role,
        companyId: companyId,
      },
      include: {
        company: true,
      },
    });

    // Send welcome email with credentials (don't wait for it)
    const loginUrl = this.configService.get<string>("WEB_URL") || "http://localhost:3000/login";
    this.emailService
      .sendTeamMemberWelcome(
        user.email,
        user.name || "Team Member",
        user.company.name,
        createUserDto.password, // Send the plain password before hashing
        loginUrl
      )
      .catch((error) => {
        console.error("Failed to send welcome email:", error);
        // Don't throw - email failure shouldn't break user creation
      });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
    });
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, companyId: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id, companyId);
    
    const updateData: any = { ...updateUserDto };
    
    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      // Remove password from update if not provided
      delete updateData.password;
    }
    
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

