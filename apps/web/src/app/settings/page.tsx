"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tasksuite/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasksuite/ui";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api";
import { UserDialog } from "@/components/users/user-dialog";
import { auth } from "@/lib/auth";


export default function SettingsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const currentUser = auth.getUser();

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    try {
      const data = (await getUsers()) as any[];
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: any) {
    try {
      // Remove companyId if present - it's automatically set from JWT
      const { companyId, ...userData } = data;
      console.log("handleCreate - Data received:", data);
      console.log("handleCreate - Data after removing companyId:", userData);
      await createUser(userData);
      await loadUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create user";
      alert(errorMessage);
      console.error("Failed to create user:", error);
    }
  }

  async function handleUpdate(id: string, data: any) {
    try {
      // If password is empty, don't send it
      if (!data.password) {
        delete data.password;
      }
      await updateUser(id, data);
      await loadUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      alert(error.message || "Failed to update user");
      console.error("Failed to update user:", error);
    }
  }

  async function handleDelete(id: string) {
    if (currentUser && "id" in currentUser && currentUser.id === id) {
      alert("You cannot delete your own account");
      return;
    }
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsDialogOpen(true);
          }}
        >
          Add Team Member
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "N/A"}
                    {currentUser && "id" in currentUser && currentUser.id === user.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        user.role === "owner"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setIsDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {currentUser &&
                        "id" in currentUser &&
                        currentUser.id !== user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        onSave={(data) => {
          if (editingUser) {
            handleUpdate(editingUser.id, data);
          } else {
            handleCreate(data);
          }
        }}
      />
    </div>
  );
}


