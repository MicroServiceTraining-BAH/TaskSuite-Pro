"use client";

import { useState, useEffect } from "react";
import { Button, Spinner } from "@tasksuite/ui";
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
import { SearchBar } from "@/components/search-bar";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadClients() {
    try {
      const data = await getClients() as any[];
      setAllClients(data);
      filterClients(data, searchQuery);
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterClients(data: any[], query: string) {
    if (!query.trim()) {
      setClients(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter((client) => {
      return (
        client.name?.toLowerCase().includes(lowerQuery) ||
        client.email?.toLowerCase().includes(lowerQuery) ||
        client.phone?.toLowerCase().includes(lowerQuery) ||
        client.address?.toLowerCase().includes(lowerQuery)
      );
    });
    setClients(filtered);
  }

  useEffect(() => {
    filterClients(allClients, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleCreate(data: any) {
    setSaving(true);
    setError(null);
    try {
      await createClient(data);
      await loadClients();
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error("Failed to create client:", err);
      setError(err?.message || "Failed to create client. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, data: any) {
    setSaving(true);
    setError(null);
    try {
      await updateClient(id, data);
      await loadClients();
      setIsDialogOpen(false);
      setEditingClient(null);
    } catch (err: any) {
      console.error("Failed to update client:", err);
      setError(err?.message || "Failed to update client. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this client?")) return;
    setDeleting(id);
    try {
      await deleteClient(id);
      await loadClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-1/6 rounded bg-muted" />
              <div className="ml-auto h-6 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
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

      <div className="mb-4">
        <SearchBar
          placeholder="Search clients by name, email, phone, or address..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Mobile: Card view, Desktop: Table view */}
      <div className="block lg:hidden space-y-4">
        {clients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No clients found</div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="border rounded-lg p-4 space-y-3">
              <div className="font-medium text-lg">{client.name}</div>
              <div className="grid gap-2 text-sm">
                {client.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span> {client.email}
                  </div>
                )}
                {client.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span> {client.phone}
                  </div>
                )}
                {client.address && (
                  <div>
                    <span className="text-muted-foreground">Address:</span> {client.address}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
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
                  className="flex-1"
                  onClick={() => handleDelete(client.id)}
                  disabled={deleting === client.id}
                >
                  {deleting === client.id ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden lg:block rounded-lg border overflow-x-auto">
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
                      disabled={deleting === client.id}
                    >
                      {deleting === client.id ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
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
        onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setError(null); }}
        client={editingClient}
        onSave={editingClient ? (data) => handleUpdate(editingClient.id, data) : handleCreate}
        saving={saving}
        error={error}
      />
    </div>
  );
}

