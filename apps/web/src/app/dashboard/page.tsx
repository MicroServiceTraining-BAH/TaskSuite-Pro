import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tasksuite/ui";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients" className="text-primary hover:underline">
              View Clients →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
            <CardDescription>Create and manage estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/estimates" className="text-primary hover:underline">
              View Estimates →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>Track your jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/jobs" className="text-primary hover:underline">
              View Jobs →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Manage appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/schedule" className="text-primary hover:underline">
              View Schedule →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Manage invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/invoices" className="text-primary hover:underline">
              View Invoices →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings" className="text-primary hover:underline">
              View Settings →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

