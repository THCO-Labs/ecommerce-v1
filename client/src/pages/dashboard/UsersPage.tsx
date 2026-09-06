import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersApi } from "@/api/auth";
import { ApiError } from "@/api/client";
import { useAsync } from "@/hooks/use-async";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/format";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["customer", "staff", "admin"];

const ROLE_NOTES: Record<UserRole, string> = {
  customer: "Shops and sees their own orders",
  staff: "Fulfils orders and moves stock",
  admin: "Everything, including prices and roles",
};

export default function UsersPage() {
  const { data, loading, error, reload } = useAsync(() => usersApi.list(), []);
  const { user: me } = useAuth();
  const [saving, setSaving] = useState<string | null>(null);

  async function setRole(userId: string, role: UserRole) {
    setSaving(userId);
    try {
      await usersApi.setRole(userId, role);
      toast.success("Role updated");
      reload();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not change that role");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div data-builder-id="dashboard.users">
      <h1 className="text-3xl font-semibold">Team</h1>
      <p className="text-muted-foreground mt-2">
        Who can sign in, and what they may do. Everyone starts as a customer.
      </p>

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-8 rounded-lg border p-4">{error}</p>
      )}

      {loading ? (
        <Skeleton className="mt-8 h-72 w-full rounded-xl" />
      ) : (
        <Card className="mt-8">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Can do</TableHead>
                  <TableHead className="text-right">Change role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((person) => {
                  const isMe = person.id === me?.id;
                  return (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="bg-secondary text-secondary-foreground grid size-9 place-items-center rounded-full text-xs font-medium">
                            {initials(person.fullName ?? person.email)}
                          </span>
                          <div>
                            <div className="font-medium">
                              {person.fullName ?? "—"} {isMe && <span className="text-muted-foreground text-xs">(you)</span>}
                            </div>
                            <div className="text-muted-foreground text-xs">{person.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={person.role === "admin" ? "default" : "outline"}>{person.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{ROLE_NOTES[person.role]}</TableCell>
                      <TableCell className="text-right">
                        <select
                          aria-label={`Role for ${person.email}`}
                          className="h-8 rounded-md border bg-transparent px-2 text-xs"
                          value={person.role}
                          disabled={saving === person.id}
                          onChange={(event) => void setRole(person.id, event.target.value as UserRole)}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        {isMe && (
                          <p className="text-muted-foreground mt-1 text-[11px]">
                            You cannot remove your own admin role
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
