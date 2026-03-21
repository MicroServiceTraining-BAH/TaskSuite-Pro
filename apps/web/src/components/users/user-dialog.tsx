"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@tasksuite/ui";
import { Button } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Label } from "@tasksuite/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tasksuite/ui";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
  onSave: (data: any) => void;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setName(user.name || "");
      setPassword(""); // Don't prefill password
      setRole(user.role || "user");
    } else {
      setEmail("");
      setName("");
      setPassword("");
      setRole("user");
    }
    setErrors({});
  }, [user, open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errs: Record<string, string> = {};

    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";

    if (!user) {
      if (!password) errs.password = "Password is required for new users";
      else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    } else if (password && password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const data: any = { email, name, role };
    if (!user) {
      data.password = password;
    } else if (password) {
      data.password = password;
    }
    delete data.companyId;
    console.log("UserDialog - Sending data:", data);
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-4 sm:px-6">
            <div className="space-y-4 py-4">
              <div>
            <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              disabled={!!user}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setName(event.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="password">
              {user ? "New Password (leave blank to keep current)" : <span>Password <span className="text-destructive">*</span></span>}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(event.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            {user && !errors.password && (
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to keep the current password
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">{user ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
