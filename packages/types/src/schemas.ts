import { z } from "zod";

// Company schemas
export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCompanySchema = z.object({
  name: z.string().min(1),
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  companyId: z.string(),
  role: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
  companyId: z.string(),
  role: z.string().default("user"),
});

export const UpdateUserSchema = CreateUserSchema.partial();

// Client schemas
export const ClientSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

// Estimate schemas
export const EstimateSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  clientId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  amount: z.number().nonnegative(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateEstimateSchema = z.object({
  clientId: z.string(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  amount: z.number().nonnegative(),
  status: z.string().default("draft"),
});

export const UpdateEstimateSchema = CreateEstimateSchema.partial();

export const ConvertEstimateToJobSchema = z.object({
  estimateId: z.string(),
});

// Job schemas
export const JobSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  clientId: z.string(),
  estimateId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateJobSchema = z.object({
  clientId: z.string(),
  estimateId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.string().default("pending"),
});

export const UpdateJobSchema = CreateJobSchema.partial();

// Appointment schemas
export const AppointmentSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  jobId: z.string().nullable(),
  clientId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  startTime: z.date(),
  endTime: z.date(),
  recurrenceRule: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateAppointmentSchema = z.object({
  jobId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  startTime: z.date(),
  endTime: z.date(),
  repeatWeekly: z.boolean().default(false),
  weeksToRepeat: z.number().int().positive().default(4),
});

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial();

// Invoice schemas
export const InvoiceSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  jobId: z.string().nullable(),
  clientId: z.string(),
  invoiceNumber: z.string(),
  amount: z.number().nonnegative(),
  status: z.string(),
  dueDate: z.date().nullable(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateInvoiceSchema = z.object({
  jobId: z.string().optional().nullable(),
  clientId: z.string(),
  invoiceNumber: z.string().min(1),
  amount: z.number().nonnegative(),
  dueDate: z.date().optional().nullable(),
  status: z.string().default("pending"),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();

export const MarkInvoicePaidSchema = z.object({
  invoiceId: z.string(),
});

