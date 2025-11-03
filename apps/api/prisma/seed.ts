import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Hash password for seeded users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create companies
  const cleaningCo = await prisma.company.create({
    data: {
      name: "CleaningCo",
      users: {
        create: {
          email: "owner@cleaningco.com",
          name: "CleaningCo Owner",
          password: hashedPassword,
          role: "owner",
        },
      },
    },
  });

  const flooringCo = await prisma.company.create({
    data: {
      name: "FlooringCo",
      users: {
        create: {
          email: "owner@flooringco.com",
          name: "FlooringCo Owner",
          password: hashedPassword,
          role: "owner",
        },
      },
    },
  });

  console.log("✅ Created companies:", cleaningCo.name, flooringCo.name);

  // Create clients for CleaningCo (one with portal access for testing)
  const client1 = await prisma.client.create({
    data: {
      companyId: cleaningCo.id,
      name: "John Smith",
      email: "john.smith@example.com",
      password: hashedPassword, // Enable portal access
      hasPortalAccess: true,
      phone: "+1-555-0101",
      address: "123 Main St, City, State 12345",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      companyId: cleaningCo.id,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: hashedPassword, // Enable portal access
      hasPortalAccess: true,
      phone: "+1-555-0102",
      address: "456 Oak Ave, City, State 12345",
    },
  });

  // Create clients for FlooringCo
  const client3 = await prisma.client.create({
    data: {
      companyId: flooringCo.id,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      password: hashedPassword, // Enable portal access
      hasPortalAccess: true,
      phone: "+1-555-0103",
      address: "789 Pine Rd, City, State 12345",
    },
  });

  console.log("✅ Created clients");

  // Create estimates for CleaningCo
  const estimate1 = await prisma.estimate.create({
    data: {
      companyId: cleaningCo.id,
      clientId: client1.id,
      title: "Kitchen Deep Clean Estimate",
      description: "Full kitchen deep cleaning service",
      amount: 250.0,
      status: "draft",
    },
  });

  const estimate2 = await prisma.estimate.create({
    data: {
      companyId: cleaningCo.id,
      clientId: client2.id,
      title: "Office Cleaning Estimate",
      description: "Weekly office cleaning service",
      amount: 500.0,
      status: "accepted",
    },
  });

  console.log("✅ Created estimates");

  // Create jobs (convert estimate2 to job)
  const job1 = await prisma.job.create({
    data: {
      companyId: cleaningCo.id,
      clientId: client2.id,
      estimateId: estimate2.id,
      title: "Office Cleaning",
      description: "Weekly office cleaning service",
      status: "in_progress",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: flooringCo.id,
      clientId: client3.id,
      title: "Living Room Floor Installation",
      description: "Install new hardwood flooring",
      status: "pending",
    },
  });

  console.log("✅ Created jobs");

  // Create appointments
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointment1 = await prisma.appointment.create({
    data: {
      companyId: cleaningCo.id,
      jobId: job1.id,
      clientId: client2.id,
      title: "Office Cleaning Appointment",
      description: "Weekly cleaning service",
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 hours
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      companyId: flooringCo.id,
      clientId: client3.id,
      title: "Floor Installation Consultation",
      description: "Initial consultation for flooring project",
      startTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), // +1 day
      endTime: new Date(tomorrow.getTime() + 25 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Created appointments");

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      companyId: cleaningCo.id,
      jobId: job1.id,
      clientId: client2.id,
      invoiceNumber: "INV-2024-001",
      amount: 500.0,
      status: "pending",
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      companyId: flooringCo.id,
      clientId: client3.id,
      invoiceNumber: "INV-2024-002",
      amount: 3500.0,
      status: "paid",
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      paidAt: now,
    },
  });

  console.log("✅ Created invoices");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

