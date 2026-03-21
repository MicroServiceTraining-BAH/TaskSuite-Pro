import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SignupDto } from "./dto/signup.dto";

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

  async signup(signupDto: SignupDto) {
    const normalizedEmail = signupDto.email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // Create company and owner user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: signupDto.companyName.trim(),
        },
      });

      // Create owner user
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: signupDto.name?.trim(),
          password: hashedPassword,
          companyId: company.id,
          role: "owner",
        },
        include: { company: true },
      });

      // Seed a basic chart of accounts for the new company
      await tx.account.createMany({
        data: [
          { companyId: company.id, name: 'Service Revenue', type: 'income', code: '4000' },
          { companyId: company.id, name: 'Other Income', type: 'income', code: '4100' },
          { companyId: company.id, name: 'Office Supplies', type: 'expense', code: '5000' },
          { companyId: company.id, name: 'Equipment', type: 'expense', code: '5100' },
          { companyId: company.id, name: 'Vehicle Expenses', type: 'expense', code: '5200' },
          { companyId: company.id, name: 'Payroll', type: 'expense', code: '5300' },
          { companyId: company.id, name: 'Marketing', type: 'expense', code: '5400' },
          { companyId: company.id, name: 'Cash', type: 'asset', code: '1000' },
          { companyId: company.id, name: 'Accounts Receivable', type: 'asset', code: '1100' },
          { companyId: company.id, name: 'Accounts Payable', type: 'liability', code: '2000' },
        ],
      });

      return { company, user };
    });

    const payload = {
      sub: result.user.id,
      email: result.user.email,
      companyId: result.user.companyId,
      role: result.user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        companyId: result.user.companyId,
        companyName: result.user.company.name,
        role: result.user.role,
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
          companyName: client.company.name,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Login failed");
    }
  }

  async getCompany(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
    });
  }

  async getClientCompany(clientId: string) {
    return this.prisma.client.findUnique({
      where: { id: clientId },
      include: { company: true },
    });
  }
}

