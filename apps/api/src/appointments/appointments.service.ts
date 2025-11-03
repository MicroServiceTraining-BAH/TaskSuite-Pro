import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createAppointmentDto: CreateAppointmentDto) {
    const { repeatWeekly = false, weeksToRepeat = 4, ...appointmentData } = createAppointmentDto;

    if (repeatWeekly) {
      // Create multiple appointments for weekly recurrence
      const appointments = [];
      const startDate = new Date(appointmentData.startTime);
      const endDate = new Date(appointmentData.endTime);
      const duration = endDate.getTime() - startDate.getTime();

      for (let week = 0; week < weeksToRepeat; week++) {
        const weekOffset = week * 7 * 24 * 60 * 60 * 1000;
        const weekStartTime = new Date(startDate.getTime() + weekOffset);
        const weekEndTime = new Date(endDate.getTime() + weekOffset);

        // Store RFC5545 rule for first appointment, null for others
        const recurrenceRule = week === 0 ? "FREQ=WEEKLY;COUNT=" + weeksToRepeat : null;

        appointments.push(
          this.prisma.appointment.create({
            data: {
              ...appointmentData,
              companyId,
              startTime: weekStartTime,
              endTime: weekEndTime,
              recurrenceRule,
            },
          })
        );
      }

      return Promise.all(appointments);
    } else {
      // Single appointment
      return this.prisma.appointment.create({
        data: {
          ...appointmentData,
          companyId,
        },
      });
    }
  }

  async findAll(companyId: string) {
    return this.prisma.appointment.findMany({
      where: { companyId },
      include: { job: true, client: true },
      orderBy: { startTime: "asc" },
    });
  }

  async findOne(id: string, companyId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, companyId },
      include: { job: true, client: true },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, companyId: string, updateAppointmentDto: UpdateAppointmentDto) {
    await this.findOne(id, companyId);
    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}

