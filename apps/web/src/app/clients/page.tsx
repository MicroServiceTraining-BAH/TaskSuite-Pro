"use client";

import { useState, useEffect } from "react";
import { Button } from "@tasksuite/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tasksuite/ui";
import { getClients, createClient, updateClient, deleteClient } from "@/lib/api";
import { ClientDialog } from "@/components/clients/client-dialog";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await getClients() as any[];
      setClients(data);
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: any) {
    try {
      await createClient(data);
      await loadClients();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  }

  async function handleUpdate(id: string, data: any) {
    try {
      await updateClient(id, data);
      await loadClients();
      setIsDialogOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error("Failed to update client:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient(id);
      await loadClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button
          onClick={() => {
            setEditingClient(null);
            setIsDialogOpen(true);
          }}
        >
          Add Client
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{client.phone || "-"}</TableCell>
                  <TableCell>{client.address || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingClient(client);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={editingClient}
        onSave={editingClient ? (data) => handleUpdate(editingClient.id, data) : handleCreate}
      />
    </div>
  );
}

