// Shared TypeScript types matching Prisma models

export type Company = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  companyId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Client = {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Estimate = {
  id: string;
  companyId: string;
  clientId: string;
  title: string;
  description: string | null;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Job = {
  id: string;
  companyId: string;
  clientId: string;
  estimateId: string | null;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Appointment = {
  id: string;
  companyId: string;
  jobId: string | null;
  clientId: string | null;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  recurrenceRule: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Invoice = {
  id: string;
  companyId: string;
  jobId: string | null;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

