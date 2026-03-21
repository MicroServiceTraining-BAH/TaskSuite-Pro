import { PrismaClient, Invoice } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.payment.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.estimateLineItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.account.deleteMany();
  await prisma.invoiceTemplate.deleteMany();
  await prisma.estimateTemplate.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.job.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Hash password for seeded users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create companies
  const cleaningCo = await prisma.company.create({
    data: {
      name: "A&J Cleaning",
      users: {
        create: [
          {
            email: "owner@cleaningco.com",
            name: "CleaningCo Owner",
            password: hashedPassword,
            role: "owner",
          },
          {
            email: "admin@cleaningco.com",
            name: "Admin User",
            password: hashedPassword,
            role: "admin",
          },
          {
            email: "staff@cleaningco.com",
            name: "Staff Member",
            password: hashedPassword,
            role: "user",
          },
        ],
      },
    },
  });

  const flooringCo = await prisma.company.create({
    data: {
      name: "FlooringCo",
      users: {
        create: [
          {
            email: "owner@flooringco.com",
            name: "FlooringCo Owner",
            password: hashedPassword,
            role: "owner",
          },
          {
            email: "admin@flooringco.com",
            name: "Admin User",
            password: hashedPassword,
            role: "admin",
          },
        ],
      },
    },
  });

  console.log("✅ Created companies:", cleaningCo.name, flooringCo.name);

  // Create more clients for CleaningCo
  const cleaningClients = [];
  const clientNames = [
    "John Smith",
    "Jane Doe",
    "Michael Johnson",
    "Sarah Williams",
    "David Brown",
    "Emily Davis",
    "Robert Miller",
    "Jessica Wilson",
    "Christopher Moore",
    "Amanda Taylor",
    "Matthew Anderson",
    "Ashley Thomas",
  ];

  for (let i = 0; i < clientNames.length; i++) {
    const client = await prisma.client.create({
      data: {
        companyId: cleaningCo.id,
        name: clientNames[i],
        email: `${clientNames[i].toLowerCase().replace(/\s+/g, ".")}@example.com`,
        password: i < 3 ? hashedPassword : undefined, // First 3 have portal access
        hasPortalAccess: i < 3,
        phone: `+1-555-${String(1000 + i).padStart(4, "0")}`,
        address: `${i + 1}${i % 2 === 0 ? " Main St" : " Oak Ave"}, City, State ${String(12345 + i).padStart(5, "0")}`,
      },
    });
    cleaningClients.push(client);
  }

  // Create clients for FlooringCo
  const flooringClients = [];
  const flooringClientNames = [
    "Bob Johnson",
    "Alice Smith",
    "Charlie Brown",
    "Diana Prince",
    "Edward Norton",
  ];

  for (let i = 0; i < flooringClientNames.length; i++) {
    const client = await prisma.client.create({
      data: {
        companyId: flooringCo.id,
        name: flooringClientNames[i],
        email: `${flooringClientNames[i].toLowerCase().replace(/\s+/g, ".")}@example.com`,
        password: i < 2 ? hashedPassword : undefined,
        hasPortalAccess: i < 2,
        phone: `+1-555-${String(2000 + i).padStart(4, "0")}`,
        address: `${i + 1}${i % 2 === 0 ? " Pine Rd" : " Elm St"}, City, State ${String(54321 + i).padStart(5, "0")}`,
      },
    });
    flooringClients.push(client);
  }

  console.log(`✅ Created ${cleaningClients.length + flooringClients.length} clients`);

  // Create Tax Rates for both companies
  const cleaningTaxRates = [];
  const taxRatesData = [
    { name: "Sales Tax", rate: 0.08, isDefault: true, description: "Standard 8% sales tax" },
    { name: "City Tax", rate: 0.02, isDefault: false, description: "City tax rate" },
  ];
  
  for (const taxData of taxRatesData) {
    const taxRate = await prisma.taxRate.create({
      data: {
        companyId: cleaningCo.id,
        ...taxData,
      },
    });
    cleaningTaxRates.push(taxRate);
  }

  const flooringTaxRates = [];
  for (const taxData of taxRatesData) {
    const taxRate = await prisma.taxRate.create({
      data: {
        companyId: flooringCo.id,
        ...taxData,
      },
    });
    flooringTaxRates.push(taxRate);
  }

  console.log(`✅ Created ${cleaningTaxRates.length + flooringTaxRates.length} tax rates`);

  // Create Chart of Accounts for both companies
  const cleaningAccounts = [];
  const accountsData = [
    { name: "Service Revenue", type: "income", code: "4000", description: "Revenue from cleaning services" },
    { name: "Installation Revenue", type: "income", code: "4100", description: "Revenue from installations" },
    { name: "Office Supplies", type: "expense", code: "5000", description: "Office supplies and materials" },
    { name: "Equipment", type: "expense", code: "5100", description: "Equipment purchases" },
    { name: "Vehicle Expenses", type: "expense", code: "5200", description: "Vehicle fuel and maintenance" },
    { name: "Payroll", type: "expense", code: "5300", description: "Employee payroll" },
    { name: "Cash", type: "asset", code: "1000", description: "Cash on hand" },
    { name: "Accounts Receivable", type: "asset", code: "1100", description: "Money owed by clients" },
    { name: "Accounts Payable", type: "liability", code: "2000", description: "Money owed to vendors" },
  ];

  for (const accountData of accountsData) {
    const account = await prisma.account.create({
      data: {
        companyId: cleaningCo.id,
        ...accountData,
      },
    });
    cleaningAccounts.push(account);
  }

  const flooringAccounts = [];
  for (const accountData of accountsData) {
    const account = await prisma.account.create({
      data: {
        companyId: flooringCo.id,
        ...accountData,
      },
    });
    flooringAccounts.push(account);
  }

  console.log(`✅ Created ${cleaningAccounts.length + flooringAccounts.length} accounts`);

  // Create Estimate Templates
  const estimateTemplates = [];
  const estimateTemplateData = [
    { name: "Standard Cleaning", title: "Standard Cleaning Service", description: "Regular cleaning service", amount: 150 },
    { name: "Deep Clean", title: "Deep Cleaning Service", description: "Thorough deep cleaning", amount: 300 },
    { name: "Carpet Cleaning", title: "Carpet Cleaning Service", description: "Professional carpet cleaning", amount: 250 },
    { name: "Window Cleaning", title: "Window Cleaning Service", description: "Interior and exterior windows", amount: 200 },
  ];

  for (const templateData of estimateTemplateData) {
    const template = await prisma.estimateTemplate.create({
      data: {
        companyId: cleaningCo.id,
        ...templateData,
      },
    });
    estimateTemplates.push(template);
  }

  const flooringEstimateTemplates = [];
  const flooringTemplateData = [
    { name: "Hardwood Installation", title: "Hardwood Floor Installation", description: "Professional hardwood installation", amount: 5000 },
    { name: "Tile Installation", title: "Tile Floor Installation", description: "Ceramic tile installation", amount: 4000 },
    { name: "Carpet Installation", title: "Carpet Installation", description: "New carpet installation", amount: 3000 },
  ];

  for (const templateData of flooringTemplateData) {
    const template = await prisma.estimateTemplate.create({
      data: {
        companyId: flooringCo.id,
        ...templateData,
      },
    });
    flooringEstimateTemplates.push(template);
  }

  console.log(`✅ Created ${estimateTemplates.length + flooringEstimateTemplates.length} estimate templates`);

  // Create Invoice Templates
  const invoiceTemplates = [];
  const invoiceTemplateData = [
    { name: "Standard Invoice", invoiceNumber: "INV-{YEAR}-{NUM}", amount: 0, dueDateDays: 30 },
    { name: "Net 15", invoiceNumber: "INV-{YEAR}-{NUM}", amount: 0, dueDateDays: 15 },
    { name: "Net 60", invoiceNumber: "INV-{YEAR}-{NUM}", amount: 0, dueDateDays: 60 },
  ];

  for (const templateData of invoiceTemplateData) {
    const template = await prisma.invoiceTemplate.create({
      data: {
        companyId: cleaningCo.id,
        ...templateData,
      },
    });
    invoiceTemplates.push(template);
  }

  console.log(`✅ Created ${invoiceTemplates.length} invoice templates`);

  // Get all users for time entries
  const cleaningUsers = await prisma.user.findMany({
    where: { companyId: cleaningCo.id },
  });
  const flooringUsers = await prisma.user.findMany({
    where: { companyId: flooringCo.id },
  });

  const now = new Date();
  const estimates = [];
  const jobs = [];
  const invoices: Invoice[] = [];
  const appointments = [];

  // Create estimates, jobs, and invoices spanning multiple months (up to 2 years back)
  for (let monthsAgo = 0; monthsAgo < 24; monthsAgo++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    // CleaningCo data
    const estimatesThisMonth = Math.floor(Math.random() * 8) + 3; // 3-10 estimates per month
    const jobsThisMonth = Math.floor(Math.random() * 6) + 2; // 2-7 jobs per month
    const invoicesThisMonth = Math.floor(Math.random() * 7) + 2; // 2-8 invoices per month

    for (let i = 0; i < estimatesThisMonth; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const estimateDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const client = cleaningClients[Math.floor(Math.random() * cleaningClients.length)];
      const amount = Math.floor(Math.random() * 1000) + 150; // $150-$1150
      const statuses = ["draft", "sent", "accepted", "rejected"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Create estimate with line items
      const useLineItems = Math.random() > 0.5;
      let calculatedAmount = amount;
      
      const estimate = await prisma.estimate.create({
        data: {
          companyId: cleaningCo.id,
          clientId: client.id,
          title: `Cleaning Service Estimate ${monthsAgo > 0 ? `(${monthsAgo}mo ago)` : ""}`,
          description: `Professional cleaning service for ${client.name}`,
          amount: calculatedAmount,
          taxRate: cleaningTaxRates[0].rate,
          status: status,
          createdAt: estimateDate,
          lineItems: useLineItems ? {
            create: [
              {
                companyId: cleaningCo.id,
                description: "Standard Cleaning",
                quantity: 1,
                unitPrice: amount * 0.6,
                taxRate: cleaningTaxRates[0].rate,
              },
              {
                companyId: cleaningCo.id,
                description: "Deep Cleaning",
                quantity: 1,
                unitPrice: amount * 0.4,
                taxRate: cleaningTaxRates[0].rate,
              },
            ],
          } : undefined,
        },
      });
      estimates.push(estimate);

      // Convert some accepted estimates to jobs
      if (status === "accepted" && Math.random() > 0.3) {
        const jobDate = new Date(estimateDate);
        jobDate.setDate(jobDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days after estimate

        const jobStatuses = ["pending", "in_progress", "completed", "cancelled"];
        const jobStatus =
          monthsAgo === 0
            ? jobStatuses[Math.floor(Math.random() * 3)] // Recent: pending/in_progress
            : monthsAgo < 3
            ? jobStatuses[Math.floor(Math.random() * 4)] // Last 3 months: any status
            : "completed"; // Older: mostly completed

        const job = await prisma.job.create({
          data: {
            companyId: cleaningCo.id,
            clientId: client.id,
            estimateId: estimate.id,
            title: estimate.title.replace("Estimate", "Job"),
            description: estimate.description,
            status: jobStatus,
            createdAt: jobDate,
          },
        });
        jobs.push(job);

        // Create appointments for jobs
        if (jobStatus !== "cancelled") {
          const appointmentDate = new Date(jobDate);
          appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 14));
          const appointment = await prisma.appointment.create({
            data: {
              companyId: cleaningCo.id,
              jobId: job.id,
              clientId: client.id,
              title: `Service Appointment for ${client.name}`,
              description: `Scheduled cleaning service`,
              startTime: appointmentDate,
              endTime: new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000), // +2 hours
              createdAt: jobDate,
            },
          });
          appointments.push(appointment);
        }

        // Create invoices for completed jobs
        if (jobStatus === "completed" && Math.random() > 0.2) {
          const invoiceDate = new Date(jobDate);
          invoiceDate.setDate(invoiceDate.getDate() + Math.floor(Math.random() * 5) + 1);
          const invoiceStatus = monthsAgo < 2 ? (Math.random() > 0.4 ? "pending" : "paid") : "paid";
          const invoiceAmount = amount * 1.1; // Add 10% markup
          
          const invoice = await prisma.invoice.create({
            data: {
              companyId: cleaningCo.id,
              jobId: job.id,
              clientId: client.id,
              invoiceNumber: `INV-${invoiceDate.getFullYear()}-${String(invoices.length + 1).padStart(4, "0")}`,
              amount: invoiceAmount,
              taxRate: cleaningTaxRates[0].rate,
              status: invoiceStatus,
              dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
              paidAt: invoiceStatus === "paid" ? new Date(invoiceDate.getTime() + Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000) : null,
              createdAt: invoiceDate,
              lineItems: {
                create: [
                  {
                    companyId: cleaningCo.id,
                    description: "Cleaning Service",
                    quantity: 1,
                    unitPrice: invoiceAmount * 0.7,
                    taxRate: cleaningTaxRates[0].rate,
                  },
                  {
                    companyId: cleaningCo.id,
                    description: "Materials & Supplies",
                    quantity: 1,
                    unitPrice: invoiceAmount * 0.3,
                    taxRate: cleaningTaxRates[0].rate,
                  },
                ],
              },
            },
          });
          invoices.push(invoice);

          // Create payments for paid invoices
          if (invoiceStatus === "paid" && Math.random() > 0.3) {
            await prisma.payment.create({
              data: {
                companyId: cleaningCo.id,
                invoiceId: invoice.id,
                amount: invoiceAmount,
                status: "completed",
                paymentMethod: ["stripe", "cash", "check", "bank_transfer"][Math.floor(Math.random() * 4)],
                completedAt: invoice.paidAt || invoiceDate,
                notes: "Payment processed",
              },
            });
          }

          // Create time entries for jobs
          if (Math.random() > 0.4 && cleaningUsers.length > 0) {
            const staffUser = cleaningUsers.find(u => u.role === "user") || cleaningUsers[0];
            const hoursWorked = Math.random() * 4 + 2; // 2-6 hours
            await prisma.timeEntry.create({
              data: {
                companyId: cleaningCo.id,
                jobId: job.id,
                userId: staffUser.id,
                description: `Work on ${job.title}`,
                hours: parseFloat(hoursWorked.toFixed(2)),
                date: jobDate,
                billable: true,
                rate: 25.0, // $25/hour
              },
            });
          }
        }
      }
    }

    // FlooringCo data (less frequent, higher amounts)
    if (monthsAgo % 2 === 0) {
      // Every other month
      for (let i = 0; i < 3; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const estimateDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        const client = flooringClients[Math.floor(Math.random() * flooringClients.length)];
        const amount = Math.floor(Math.random() * 5000) + 2000; // $2000-$7000
        const statuses = ["draft", "sent", "accepted"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const estimate = await prisma.estimate.create({
          data: {
            companyId: flooringCo.id,
            clientId: client.id,
            title: `Flooring Installation Estimate ${monthsAgo > 0 ? `(${monthsAgo}mo ago)` : ""}`,
            description: `Professional flooring installation for ${client.name}`,
            amount: amount,
            status: status,
            createdAt: estimateDate,
          },
        });

        if (status === "accepted") {
          const jobDate = new Date(estimateDate);
          jobDate.setDate(jobDate.getDate() + Math.floor(Math.random() * 14) + 7);
          const jobStatus = monthsAgo < 6 ? (Math.random() > 0.5 ? "completed" : "in_progress") : "completed";

          const job = await prisma.job.create({
            data: {
              companyId: flooringCo.id,
              clientId: client.id,
              estimateId: estimate.id,
              title: estimate.title.replace("Estimate", "Job"),
              description: estimate.description,
              status: jobStatus,
              createdAt: jobDate,
            },
          });

          if (jobStatus === "completed") {
            const invoiceDate = new Date(jobDate);
            invoiceDate.setDate(invoiceDate.getDate() + Math.floor(Math.random() * 5));
            const invoiceRecord = await prisma.invoice.create({
              data: {
                companyId: flooringCo.id,
                jobId: job.id,
                clientId: client.id,
                invoiceNumber: `INV-FLOOR-${invoiceDate.getFullYear()}-${String(invoices.length + 1).padStart(4, "0")}`,
                amount: amount,
                taxRate: flooringTaxRates[0].rate,
                status: "paid",
                dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                paidAt: new Date(invoiceDate.getTime() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
                createdAt: invoiceDate,
                lineItems: {
                  create: [
                    {
                      companyId: flooringCo.id,
                      description: "Flooring Installation",
                      quantity: 1,
                      unitPrice: amount * 0.8,
                      taxRate: flooringTaxRates[0].rate,
                    },
                    {
                      companyId: flooringCo.id,
                      description: "Materials",
                      quantity: 1,
                      unitPrice: amount * 0.2,
                      taxRate: flooringTaxRates[0].rate,
                    },
                  ],
                },
              },
            });
            invoices.push(invoiceRecord);

            // Create payment
            await prisma.payment.create({
              data: {
                companyId: flooringCo.id,
                invoiceId: invoiceRecord.id,
                amount: amount,
                status: "completed",
                paymentMethod: ["stripe", "bank_transfer"][Math.floor(Math.random() * 2)],
                completedAt: invoiceRecord.paidAt || invoiceDate,
                notes: "Payment received",
              },
            });
          }
        }
      }
    }
  }

  // Add some current/recent pending items
  const recentClient = cleaningClients[0];
  await prisma.estimate.create({
    data: {
      companyId: cleaningCo.id,
      clientId: recentClient.id,
      title: "Bathroom Deep Clean Estimate",
      description: "Weekly bathroom cleaning service",
      amount: 180.0,
      status: "sent",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  await prisma.estimate.create({
    data: {
      companyId: cleaningCo.id,
      clientId: cleaningClients[1].id,
      title: "Carpet Cleaning Estimate",
      description: "Deep carpet cleaning service",
      amount: 320.0,
      status: "draft",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // Add upcoming appointments
  for (let i = 1; i <= 5; i++) {
    const appointmentDate = new Date(now);
    appointmentDate.setDate(appointmentDate.getDate() + i);
    const client = cleaningClients[Math.floor(Math.random() * cleaningClients.length)];
    await prisma.appointment.create({
      data: {
        companyId: cleaningCo.id,
        clientId: client.id,
        title: `Upcoming Cleaning Service ${i}`,
        description: `Scheduled service for ${client.name}`,
        startTime: appointmentDate,
        endTime: new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000),
        createdAt: now,
      },
    });
  }

  // Add some unpaid invoices
  for (let i = 0; i < 5; i++) {
    const client = cleaningClients[Math.floor(Math.random() * cleaningClients.length)];
    const invoiceDate = new Date(now);
    invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 30));
    const invoiceAmount = Math.floor(Math.random() * 800) + 200;
    await prisma.invoice.create({
      data: {
        companyId: cleaningCo.id,
        clientId: client.id,
        invoiceNumber: `INV-PENDING-${String(i + 1).padStart(4, "0")}`,
        amount: invoiceAmount,
        taxRate: cleaningTaxRates[0].rate,
        status: "pending",
        dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        createdAt: invoiceDate,
        lineItems: {
          create: [
            {
              companyId: cleaningCo.id,
              description: "Service Charge",
              quantity: 1,
              unitPrice: invoiceAmount,
              taxRate: cleaningTaxRates[0].rate,
            },
          ],
        },
      },
    });
  }

  // Create Expenses
  const expenseCategories = cleaningAccounts.filter(a => a.type === "expense");
  const vendors = ["Office Depot", "Home Depot", "Amazon", "Local Supplier", "Gas Station"];
  
  for (let i = 0; i < 20; i++) {
    const expenseDate = new Date(now);
    expenseDate.setDate(expenseDate.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
    const account = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    
    await prisma.expense.create({
      data: {
        companyId: cleaningCo.id,
        accountId: account.id,
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        description: `Expense ${i + 1}: ${account.name}`,
        amount: Math.floor(Math.random() * 500) + 20,
        date: expenseDate,
        paymentMethod: ["cash", "credit_card", "check", "bank_transfer"][Math.floor(Math.random() * 4)],
        notes: `Expense for ${account.name}`,
      },
    });
  }

  // Create Bills
  const billVendors = ["Utility Company", "Internet Provider", "Insurance Co", "Equipment Rental", "Office Rent"];
  
  for (let i = 0; i < 10; i++) {
    const billDate = new Date(now);
    billDate.setDate(billDate.getDate() - Math.floor(Math.random() * 60));
    const dueDate = new Date(billDate);
    dueDate.setDate(dueDate.getDate() + 30);
    const account = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
    const status = Math.random() > 0.5 ? "paid" : "unpaid";
    
    await prisma.bill.create({
      data: {
        companyId: cleaningCo.id,
        accountId: account.id,
        vendor: billVendors[Math.floor(Math.random() * billVendors.length)],
        billNumber: `BILL-${String(i + 1).padStart(4, "0")}`,
        description: `Monthly bill from ${billVendors[Math.floor(Math.random() * billVendors.length)]}`,
        amount: Math.floor(Math.random() * 1000) + 100,
        dueDate: dueDate,
        status: status,
        paidAt: status === "paid" ? new Date(billDate.getTime() + Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000) : null,
        paymentMethod: status === "paid" ? ["check", "bank_transfer", "credit_card"][Math.floor(Math.random() * 3)] : null,
        notes: `Bill for ${account.name}`,
      },
    });
  }

  // Create additional time entries for recent jobs
  const recentJobs = await prisma.job.findMany({
    where: {
      companyId: cleaningCo.id,
      createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    take: 10,
  });

  for (const job of recentJobs) {
    if (Math.random() > 0.5 && cleaningUsers.length > 0) {
      const user = cleaningUsers[Math.floor(Math.random() * cleaningUsers.length)];
      const entryDate = new Date(job.createdAt);
      entryDate.setDate(entryDate.getDate() + Math.floor(Math.random() * 7));
      
      await prisma.timeEntry.create({
        data: {
          companyId: cleaningCo.id,
          jobId: job.id,
          userId: user.id,
          description: `Work on ${job.title}`,
          hours: parseFloat((Math.random() * 6 + 2).toFixed(2)),
          date: entryDate,
          billable: Math.random() > 0.2,
          rate: user.role === "owner" ? 50 : user.role === "admin" ? 35 : 25,
        },
      });
    }
  }

  console.log("✅ Created estimates:", estimates.length + 2);
  console.log("✅ Created jobs:", jobs.length);
  console.log("✅ Created invoices:", invoices.length + 5);
  console.log("✅ Created appointments:", appointments.length + 5);
  console.log("✅ Created expenses: 20");
  console.log("✅ Created bills: 10");
  console.log("✅ Created time entries");

  console.log("🎉 Seed completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - Companies: 2`);
  console.log(`   - Users: 5`);
  console.log(`   - Clients: ${cleaningClients.length + flooringClients.length}`);
  console.log(`   - Tax Rates: ${cleaningTaxRates.length + flooringTaxRates.length}`);
  console.log(`   - Accounts: ${cleaningAccounts.length + flooringAccounts.length}`);
  console.log(`   - Estimate Templates: ${estimateTemplates.length + flooringEstimateTemplates.length}`);
  console.log(`   - Invoice Templates: ${invoiceTemplates.length}`);
  console.log(`   - Estimates: ${estimates.length + 2} (including recent)`);
  console.log(`   - Jobs: ${jobs.length}`);
  console.log(`   - Invoices: ${invoices.length + 5} (including pending)`);
  console.log(`   - Appointments: ${appointments.length + 5} (including upcoming)`);
  console.log(`   - Expenses: 20`);
  console.log(`   - Bills: 10`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
