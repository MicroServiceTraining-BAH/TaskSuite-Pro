"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasksuite/ui";

interface Company {
  id: string;
  name: string;
}

// Company IDs from seeded database
const COMPANIES: Company[] = [
  { id: "cmhif3xo70000y4j7y9mf9f03", name: "CleaningCo" },
  { id: "cmhif3xoh0002y4j72ynmffqa", name: "FlooringCo" },
];

export function CompanySelector() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  useEffect(() => {
    // Load from localStorage or use default
    const saved = localStorage.getItem("selectedCompanyId");
    setSelectedCompany(saved || COMPANIES[0].id);
  }, []);

  function handleCompanyChange(companyId: string) {
    setSelectedCompany(companyId);
    localStorage.setItem("selectedCompanyId", companyId);
    // Reload the page to apply new company context
    window.location.reload();
  }

  const currentCompany = COMPANIES.find((c) => c.id === selectedCompany);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Company:</span>
      <Select value={selectedCompany} onValueChange={handleCompanyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select company">
            {currentCompany?.name || "Select company"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COMPANIES.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

