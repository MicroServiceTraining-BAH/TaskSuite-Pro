import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    console.log("🔍 Validating user:", normalizedEmail);
    
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    if (!user) {
      console.log("❌ User not found:", normalizedEmail);
      return null;
    }

    console.log("✅ User found:", user.email);
    const passwordMatches = await bcrypt.compare(password, user.password);
    console.log("🔐 Password match:", passwordMatches);

    if (passwordMatches) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
        companyName: user.company.name,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        companyId: registerDto.companyId,
        role: registerDto.role || "user",
      },
      include: { company: true },
    });

    const { password: _, ...userWithoutPassword } = user;

    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: user.companyId,
        companyName: user.company.name,
        role: user.role,
      },
    };
  }

  async validateClient(email: string, password: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    console.log("🔍 Validating client:", normalizedEmail);
    
    const client = await this.prisma.client.findUnique({
      where: { email: normalizedEmail },
      include: { company: true },
    });

    if (!client) {
      console.log("❌ Client not found:", normalizedEmail);
      return null;
    }

    console.log("✅ Client found:", client.email, "hasPortalAccess:", client.hasPortalAccess, "hasPassword:", !!client.password);

    if (!client.hasPortalAccess) {
      console.log("❌ Portal access not enabled");
      return null;
    }

    if (!client.password) {
      console.log("❌ No password set");
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, client.password);
    console.log("🔐 Password match:", passwordMatches);
    
    if (!passwordMatches) {
      return null;
    }

    const { password: _, ...result } = client;
    return result;
  }

  async clientLogin(email: string, password: string) {
    try {
      const client = await this.validateClient(email, password);
      if (!client) {
        throw new UnauthorizedException("Invalid credentials or portal access not enabled");
      }

      const payload = {
        sub: client.id,
        email: client.email,
        clientId: client.id,
        companyId: client.companyId,
        type: "client",
      };

      return {
        access_token: this.jwtService.sign(payload),
        client: {
          id: client.id,
          email: client.email,
          name: client.name,
          companyId: client.companyId,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Login failed");
    }
  }
}

