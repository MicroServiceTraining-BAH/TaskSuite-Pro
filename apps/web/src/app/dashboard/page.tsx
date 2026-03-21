"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tasksuite/ui";
import { Button } from "@tasksuite/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasksuite/ui";
import Link from "next/link";
import { getClients, getJobs, getEstimates, getInvoices } from "@/lib/api";
import { Users, Briefcase, ClipboardList, DollarSign, CheckCircle2, Sparkles, Layers } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TimePeriod = "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeJobs: 0,
    pendingEstimates: 0,
    unpaidInvoices: 0,
    cleaningJobs: 0,
    flooringJobs: 0,
    completedJobs: 0,
    cleaningEstimates: 0,
    flooringEstimates: 0,
  });
  const [chartData, setChartData] = useState<any>({
    revenue: [],
    jobStatus: [],
    monthlyTrends: [],
    serviceType: [],
  });
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("6M");

  const timePeriodOptions: { value: TimePeriod; label: string }[] = [
    { value: "1M", label: "1 Month" },
    { value: "3M", label: "3 Months" },
    { value: "6M", label: "6 Months" },
    { value: "1Y", label: "1 Year" },
    { value: "2Y", label: "2 Years" },
    { value: "5Y", label: "5 Years" },
  ];

  const getMonthsBack = (period: TimePeriod): number => {
    switch (period) {
      case "1M":
        return 1;
      case "3M":
        return 3;
      case "6M":
        return 6;
      case "1Y":
        return 12;
      case "2Y":
        return 24;
      case "5Y":
        return 60;
      default:
        return 6;
    }
  };

  const getGrouping = (period: TimePeriod): "month" | "quarter" | "year" => {
    if (period === "1M" || period === "3M" || period === "6M") return "month";
    if (period === "1Y" || period === "2Y") return "quarter";
    return "year";
  };

  const formatDateLabel = (date: Date, grouping: "month" | "quarter" | "year"): string => {
    if (grouping === "month") {
      return date.toLocaleString("default", { month: "short" });
    } else if (grouping === "quarter") {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear().toString().slice(-2)}`;
    } else {
      return date.getFullYear().toString();
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [clients, jobs, estimates, invoices] = await Promise.all([
          getClients().catch((err) => {
            console.error("Failed to load clients:", err);
            return [];
          }),
          getJobs().catch((err) => {
            console.error("Failed to load jobs:", err);
            return [];
          }),
          getEstimates().catch((err) => {
            console.error("Failed to load estimates:", err);
            return [];
          }),
          getInvoices().catch((err) => {
            console.error("Failed to load invoices:", err);
            return [];
          }),
        ]);

        // Calculate stats
        const totalClients = (clients as any[]).length;
        const activeJobs = (jobs as any[]).filter(
          (j) => j.status === "pending" || j.status === "in_progress"
        ).length;
        const pendingEstimates = (estimates as any[]).filter(
          (e) => e.status === "draft" || e.status === "sent"
        ).length;
        const unpaidInvoices = (invoices as any[]).filter(
          (i) => i.status === "pending" || i.status === "unpaid"
        );
        const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

        // Industry-specific metrics
        const cleaningJobs = (jobs as any[]).filter((j) => j.jobType === "cleaning").length;
        const flooringJobs = (jobs as any[]).filter((j) => j.jobType === "flooring").length;
        const completedJobs = (jobs as any[]).filter((j) => j.status === "completed").length;
        const cleaningEstimates = (estimates as any[]).filter((e) => e.estimateType === "cleaning").length;
        const flooringEstimates = (estimates as any[]).filter((e) => e.estimateType === "flooring").length;

        setStats({
          totalClients,
          activeJobs,
          pendingEstimates,
          unpaidInvoices: unpaidTotal,
          cleaningJobs,
          flooringJobs,
          completedJobs,
          cleaningEstimates,
          flooringEstimates,
        });

        const monthsBack = getMonthsBack(timePeriod);
        const grouping = getGrouping(timePeriod);
        const now = new Date();

        // Prepare revenue data
        const revenueData = [];
        const periodsToShow = grouping === "month" ? monthsBack : grouping === "quarter" ? Math.ceil(monthsBack / 3) : Math.ceil(monthsBack / 12);

        for (let i = periodsToShow - 1; i >= 0; i--) {
          let date: Date;
          if (grouping === "month") {
            date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          } else if (grouping === "quarter") {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const quarter = currentQuarter - i;
            const year = now.getFullYear() - Math.floor(quarter / 4);
            const month = (quarter % 4) * 3;
            date = new Date(year, month, 1);
          } else {
            date = new Date(now.getFullYear() - i, 0, 1);
          }

          const label = formatDateLabel(date, grouping);

          // Filter invoices for this period
          let periodInvoices: any[] = [];
          if (grouping === "month") {
            const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            periodInvoices = (invoices as any[]).filter((inv) => {
              const invDate = new Date(inv.createdAt || inv.dueDate);
              return invDate >= date && invDate < nextMonth && (inv.status === "paid" || inv.status === "completed");
            });
          } else if (grouping === "quarter") {
            const nextQuarter = new Date(date.getFullYear(), date.getMonth() + 3, 1);
            periodInvoices = (invoices as any[]).filter((inv) => {
              const invDate = new Date(inv.createdAt || inv.dueDate);
              return invDate >= date && invDate < nextQuarter && (inv.status === "paid" || inv.status === "completed");
            });
          } else {
            const nextYear = new Date(date.getFullYear() + 1, 0, 1);
            periodInvoices = (invoices as any[]).filter((inv) => {
              const invDate = new Date(inv.createdAt || inv.dueDate);
              return invDate >= date && invDate < nextYear && (inv.status === "paid" || inv.status === "completed");
            });
          }

          revenueData.push({
            period: label,
            revenue: periodInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
          });
        }

        // Job status distribution
        const jobStatusCounts = {
          pending: (jobs as any[]).filter((j) => j.status === "pending").length,
          in_progress: (jobs as any[]).filter((j) => j.status === "in_progress").length,
          completed: (jobs as any[]).filter((j) => j.status === "completed").length,
          cancelled: (jobs as any[]).filter((j) => j.status === "cancelled").length,
        };

        const jobStatusData = [
          { name: "Pending", value: jobStatusCounts.pending, color: "#F59E0B" },
          { name: "In Progress", value: jobStatusCounts.in_progress, color: "#2563EB" },
          { name: "Completed", value: jobStatusCounts.completed, color: "#165A4A" },
          { name: "Cancelled", value: jobStatusCounts.cancelled, color: "#DC2626" },
        ].filter((item) => item.value > 0);

        // Service type distribution
        const serviceTypeData = [
          { name: "Cleaning", value: cleaningJobs, color: "#3B82F6" },
          { name: "Flooring", value: flooringJobs, color: "#10B981" },
        ].filter((item) => item.value > 0);

        // Monthly trends (estimates vs jobs)
        const trendsData = [];
        for (let i = periodsToShow - 1; i >= 0; i--) {
          let date: Date;
          if (grouping === "month") {
            date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          } else if (grouping === "quarter") {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const quarter = currentQuarter - i;
            const year = now.getFullYear() - Math.floor(quarter / 4);
            const month = (quarter % 4) * 3;
            date = new Date(year, month, 1);
          } else {
            date = new Date(now.getFullYear() - i, 0, 1);
          }

          const label = formatDateLabel(date, grouping);

          let periodEstimates: any[] = [];
          let periodJobs: any[] = [];

          if (grouping === "month") {
            const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            periodEstimates = (estimates as any[]).filter((est) => {
              const estDate = new Date(est.createdAt);
              return estDate >= date && estDate < nextMonth;
            });
            periodJobs = (jobs as any[]).filter((job) => {
              const jobDate = new Date(job.createdAt);
              return jobDate >= date && jobDate < nextMonth;
            });
          } else if (grouping === "quarter") {
            const nextQuarter = new Date(date.getFullYear(), date.getMonth() + 3, 1);
            periodEstimates = (estimates as any[]).filter((est) => {
              const estDate = new Date(est.createdAt);
              return estDate >= date && estDate < nextQuarter;
            });
            periodJobs = (jobs as any[]).filter((job) => {
              const jobDate = new Date(job.createdAt);
              return jobDate >= date && jobDate < nextQuarter;
            });
          } else {
            const nextYear = new Date(date.getFullYear() + 1, 0, 1);
            periodEstimates = (estimates as any[]).filter((est) => {
              const estDate = new Date(est.createdAt);
              return estDate >= date && estDate < nextYear;
            });
            periodJobs = (jobs as any[]).filter((job) => {
              const jobDate = new Date(job.createdAt);
              return jobDate >= date && jobDate < nextYear;
            });
          }

          trendsData.push({
            period: label,
            estimates: periodEstimates.length,
            jobs: periodJobs.length,
          });
        }

        setChartData({
          revenue: revenueData,
          jobStatus: jobStatusData,
          monthlyTrends: trendsData,
          serviceType: serviceTypeData,
        });
      } catch (error: any) {
        console.error("Failed to load dashboard data:", error);
        // Show user-friendly error if API is not available
        if (error?.message?.includes("Unable to connect to API server")) {
          console.error("API server is not running. Please start it with: cd apps/api && pnpm dev");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod]);

  // Check if we have any data - if all are empty, might be API connection issue
  const hasNoData = !loading && stats.totalClients === 0 && stats.activeJobs === 0 &&
                    stats.pendingEstimates === 0 && stats.unpaidInvoices === 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-9 w-36 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
              </div>
              <div className="h-9 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
              <div className="h-5 w-28 bg-muted animate-pulse rounded" />
              <div className="h-[300px] bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {hasNoData && (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 text-yellow-800">
          <p className="font-semibold mb-2">⚠️ No data loaded</p>
          <p className="text-sm">
            If you're seeing this and expect data, please ensure:
          </p>
          <ul className="text-sm list-disc list-inside mt-2 space-y-1">
            <li>The API server is running (check terminal for "🚀 API server running")</li>
            <li>You're logged in with valid credentials</li>
            <li>The API URL is correct (check browser console for details)</li>
          </ul>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1>Dashboard</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="time-period" className="text-sm text-muted-foreground">
            Time Period:
          </label>
          <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
            <SelectTrigger id="time-period" className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight mb-1">{stats.totalClients}</p>
            <Link href="/clients" className="text-primary hover:underline text-xs font-medium">
              View all clients →
            </Link>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight mb-1">{stats.activeJobs}</p>
            <div className="text-xs text-muted-foreground mb-1">
              {stats.cleaningJobs} Cleaning · {stats.flooringJobs} Flooring
            </div>
            <Link href="/jobs" className="text-primary hover:underline text-xs font-medium">
              View all jobs →
            </Link>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Estimates</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight mb-1">{stats.pendingEstimates}</p>
            <div className="text-xs text-muted-foreground mb-1">
              {stats.cleaningEstimates} Cleaning · {stats.flooringEstimates} Flooring
            </div>
            <Link href="/estimates" className="text-primary hover:underline text-xs font-medium">
              View all estimates →
            </Link>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid Invoices</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight mb-1">
              ${stats.unpaidInvoices.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <Link href="/invoices" className="text-primary hover:underline text-xs font-medium">
              View all invoices →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Industry-specific stats */}
      {stats.completedJobs > 0 && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Jobs</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{stats.completedJobs}</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cleaning Jobs</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{stats.cleaningJobs}</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Flooring Jobs</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Layers className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{stats.flooringJobs}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Revenue from paid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Revenue ($)"
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>Current breakdown of job statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.jobStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.jobStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Type Distribution */}
        {chartData.serviceType.length > 0 && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Service Type Distribution</CardTitle>
              <CardDescription>Jobs by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.serviceType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.serviceType.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Monthly Trends - Estimates vs Jobs */}
        <Card className={`card-shadow ${chartData.serviceType.length > 0 ? "" : "md:col-span-2"}`}>
          <CardHeader>
            <CardTitle>Trends</CardTitle>
            <CardDescription>Estimates vs Jobs created</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="estimates" fill="hsl(var(--secondary))" name="Estimates" />
                <Bar dataKey="jobs" fill="hsl(var(--primary))" name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
