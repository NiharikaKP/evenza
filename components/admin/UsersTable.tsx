'use client';

import { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClubAssignmentSheet } from '@/components/admin/ClubAssignmentSheet';
import { setUserRole, fetchOrganizerClubs } from '@/actions/admin';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
};

type Club = { id: string; name: string };

interface Props {
  users: User[];
  allClubs: Club[];
  currentAdminId: string;
}

export function UsersTable({ users, allClubs, currentAdminId }: Props) {
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();
  const [sheetOrganizer, setSheetOrganizer] = useState<User | null>(null);
  const [assignedClubIds, setAssignedClubIds] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  function handleRoleChange(userId: string, role: 'student' | 'organizer' | 'admin') {
    startTransition(async () => {
      await setUserRole(userId, role);
    });
  }

  async function openClubSheet(user: User) {
    const clubs = await fetchOrganizerClubs(user.id);
    setAssignedClubIds(clubs.map((c) => c.id));
    setSheetOrganizer(user);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => {
              const isSelf = user.id === currentAdminId;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isSelf ? (
                        <span className="text-xs text-muted-foreground w-32">You</span>
                      ) : (
                        <Select
                          defaultValue={user.role}
                          onValueChange={(v) =>
                            handleRoleChange(user.id, v as 'student' | 'organizer' | 'admin')
                          }
                          disabled={pending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="organizer">Organizer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {(user.role === 'organizer' || user.role === 'admin') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openClubSheet(user)}
                        >
                          Manage Clubs
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {sheetOrganizer && (
        <ClubAssignmentSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          organizer={sheetOrganizer}
          allClubs={allClubs}
          assignedClubIds={assignedClubIds}
        />
      )}
    </div>
  );
}
