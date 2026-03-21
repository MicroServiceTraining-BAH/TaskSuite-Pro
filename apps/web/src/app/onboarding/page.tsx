"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasksuite/ui";
import { auth } from "@/lib/auth";
import {
  getSavedOnboardingData,
  saveOnboardingData,
  markOnboardingComplete,
  isOnboardingComplete,
  OnboardingData,
} from "@/lib/onboarding";
import { CheckCircle2, LogOut, Shield, Zap } from "lucide-react";

const steps = [
  {
    id: "company",
    title: "Company Profile",
    description: "Tell us who you are so we can personalize your workspace.",
  },
  {
    id: "financials",
    title: "Financial Preferences",
    description: "Dial-in your accounting defaults, numbering, and automation.",
  },
  {
    id: "banking",
    title: "Banking & Automations",
    description: "Preview bank sync and workflow automation (coming soon).",
  },
];

const industries = [
  "Home Services",
  "Construction",
  "Professional Services",
  "Retail",
  "Manufacturing",
  "Other",
];

const currencies = ["USD", "CAD", "EUR", "GBP", "AUD"];

const teamSizes = [
  { label: "1-5", value: "1-5" },
  { label: "6-15", value: "6-15" },
  { label: "16-50", value: "16-50" },
  { label: "51-200", value: "51-200" },
  { label: "200+", value: "200+" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(() => getSavedOnboardingData());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Redirect away if onboarding already complete
    if (isOnboardingComplete()) {
      router.replace("/dashboard");
      return;
    }

    const saved = getSavedOnboardingData();
    const storedUser = auth.getUser();
    if (
      storedUser &&
      "companyName" in storedUser &&
      storedUser.companyName &&
      !saved.companyName
    ) {
      const nextData = { ...saved, companyName: storedUser.companyName };
      setData(nextData);
      saveOnboardingData(nextData);
    } else {
      setData(saved);
    }
  }, [router]);

  const handleChange = (field: keyof OnboardingData, value: string | boolean) => {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      saveOnboardingData(next);
      return next;
    });
  };

  const goToNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const goToPreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const stepIsValid = (stepIndex: number) => {
    if (stepIndex === 0) {
      return Boolean(
        data.companyName.trim() && data.industry && data.teamSize && data.timezone
      );
    }
    if (stepIndex === 1) {
      return Boolean(data.invoicePrefix.trim());
    }
    return true;
  };

  const canContinue = stepIsValid(currentStep);

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      markOnboardingComplete(data);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const timezoneOptions = useMemo(() => {
    const base = [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Berlin",
      "Europe/Madrid",
      "Australia/Sydney",
    ];
    if (data.timezone && !base.includes(data.timezone)) {
      return [data.timezone, ...base];
    }
    return base;
  }, [data.timezone]);

  function handleLogout() {
    auth.logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-primary">TaskSuite Pro • Setup</p>
          <h1 className="mt-2 text-4xl font-bold">Let’s get your company ready</h1>
          <p className="mt-2 text-base text-muted-foreground">
            A focused, three-step onboarding so your team can hit the ground running.
          </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut size={15} />
            Log out
          </Button>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isComplete = index < currentStep;
            return (
              <li
                key={step.id}
                className={`rounded-2xl border p-4 ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : isComplete
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step {index + 1}
                  </span>
                  {isComplete && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-2 font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company name</Label>
                    <Input
                      id="companyName"
                      placeholder="Acme Services"
                      value={data.companyName}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleChange("companyName", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={data.industry}
                      onValueChange={(value: string) => handleChange("industry", value)}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team size</Label>
                    <Select
                      value={data.teamSize}
                      onValueChange={(value: string) => handleChange("teamSize", value)}
                    >
                      <SelectTrigger id="teamSize">
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={data.timezone}
                      onValueChange={(value: string) => handleChange("timezone", value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {timezoneOptions.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accountingMethod">Accounting method</Label>
                    <Select
                      value={data.accountingMethod}
                      onValueChange={(value: OnboardingData["accountingMethod"]) =>
                        handleChange("accountingMethod", value)
                      }
                    >
                      <SelectTrigger id="accountingMethod">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash (recommended)</SelectItem>
                        <SelectItem value="accrual">Accrual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default currency</Label>
                    <Select
                      value={data.defaultCurrency}
                      onValueChange={(value: string) => handleChange("defaultCurrency", value)}
                    >
                      <SelectTrigger id="defaultCurrency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Invoice prefix</Label>
                    <Input
                      id="invoicePrefix"
                      value={data.invoicePrefix}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleChange("invoicePrefix", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminders">Automated reminders</Label>
                    <Select
                      value={data.enableReminders ? "enabled" : "disabled"}
                      onValueChange={(value: string) =>
                        handleChange("enableReminders", value === "enabled")
                      }
                    >
                      <SelectTrigger id="reminders">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">Bank-grade security</p>
                        <p className="text-sm text-muted-foreground">
                          Plaid-powered connections land in the next release.
                        </p>
                      </div>
                    </div>
                    <Button className="mt-4" disabled variant="outline">
                      Connect bank account (coming soon)
                    </Button>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">Workflow automation</p>
                        <p className="text-sm text-muted-foreground">
                          Auto-create invoices, reminders, and notifications.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Select
                        value={data.connectBankLater ? "later" : "preview"}
                        onValueChange={(value: string) =>
                          handleChange("connectBankLater", value === "later")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preview">Notify me when beta is open</SelectItem>
                          <SelectItem value="later">Remind me later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  We will email you as soon as secure bank feeds and automation recipes are
                  ready. You can adjust this any time inside Settings → Banking.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              {currentStep === 0 ? (
                <Button variant="ghost" onClick={() => { markOnboardingComplete(data); router.push("/dashboard"); }}>
                  Skip setup
                </Button>
              ) : (
                <Button variant="ghost" onClick={goToPreviousStep}>
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button onClick={goToNextStep} disabled={!canContinue}>
                  Continue
                </Button>
              ) : (
                <Button onClick={finishOnboarding} disabled={saving || !canContinue}>
                  {saving ? "Finishing..." : "Complete setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
