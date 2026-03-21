import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SignupDto } from "./dto/signup.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Sign up as a new company owner (creates company and owner account)" })
  @ApiResponse({ status: 201, description: "Company and owner account created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "User already exists" })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post("register")
  @ApiOperation({ summary: "Register a new company user (requires existing company)" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login as company user" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile" })
  async getProfile(@Request() req: any) {
    try {
      // If it's a company user, fetch company info
      if (req.user?.companyId && req.user?.type !== "client") {
        const company = await this.authService.getCompany(req.user.companyId);
        return {
          ...req.user,
          companyName: company?.name,
        };
      }
      // For clients, fetch their company info
      if (req.user?.clientId) {
        const clientInfo = await this.authService.getClientCompany(req.user.clientId);
        return {
          ...req.user,
          companyName: clientInfo?.company?.name,
        };
      }
      return req.user;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return req.user;
    }
  }

  @Post("client/login")
  @ApiOperation({ summary: "Login as client (customer)" })
  @ApiResponse({ status: 200, description: "Client login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async clientLogin(@Body() loginDto: LoginDto) {
    return this.authService.clientLogin(loginDto.email, loginDto.password);
  }
}

