import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        ...createClientDto,
        companyId,
      },
    });
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
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.client.delete({
      where: { id },
    });
  }
}

