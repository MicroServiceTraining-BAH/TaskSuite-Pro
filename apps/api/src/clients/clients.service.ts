import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createClientDto: CreateClientDto) {
    try {
      return await this.prisma.client.create({
        data: {
          ...createClientDto,
          companyId,
        },
      });
    } catch (error: any) {
      // Handle unique constraint violations (e.g., email already exists)
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new BadRequestException(
          `A client with this ${field} already exists. Please use a different ${field}.`
        );
      }
      throw error;
    }
  }

  async findAll(companyId: string) {
    return this.prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: string, companyId: string, updateClientDto: UpdateClientDto) {
    await this.findOne(id, companyId);
    
    // Remove companyId if it's in the DTO (shouldn't be updatable)
    const updateData: any = { ...updateClientDto };
    delete updateData.companyId;
    
    try {
      return await this.prisma.client.update({
        where: { id },
        data: updateData,
      });
    } catch (error: any) {
      // Handle unique constraint violations (e.g., email already exists)
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new BadRequestException(
          `A client with this ${field} already exists. Please use a different ${field}.`
        );
      }
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.client.delete({
      where: { id },
    });
  }
}

