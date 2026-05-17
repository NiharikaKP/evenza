'use client';

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClub, updateClub, deleteClub } from '@/actions/admin';
import { Pencil, Trash2, Plus, ImageIcon } from 'lucide-react';

type Category = { id: string; name: string };
type Club = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  imageUrl: string | null;
  category: Category | null;
};

interface Props {
  clubs: Club[];
  categories: Category[];
}

type FormState = {
  name: string;
  description: string;
  categoryId: string;
  imageUrl: string;
};

const EMPTY_FORM: FormState = { name: '', description: '', categoryId: '', imageUrl: '' };

export function ClubsManager({ clubs, categories }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setEditingClub(null);
    setForm(EMPTY_FORM);
    setPreviewUrl(null);
    setFileToUpload(null);
    setFileError('');
    setError('');
    setDialogOpen(true);
  }

  function openEdit(club: Club) {
    setEditingClub(club);
    setForm({
      name: club.name,
      description: club.description ?? '',
      categoryId: club.categoryId ?? '',
      imageUrl: club.imageUrl ?? '',
    });
    setPreviewUrl(club.imageUrl);
    setFileToUpload(null);
    setFileError('');
    setError('');
    setDialogOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setFileError('Only JPEG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError('File must be under 2MB');
      return;
    }

    setFileError('');
    setFileToUpload(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function uploadFile(): Promise<string | null> {
    if (!fileToUpload) return null;
    const data = new FormData();
    data.append('file', fileToUpload);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Upload failed');
    }
    const { url } = await res.json();
    return url as string;
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.categoryId) {
      setError('Name and category are required');
      return;
    }
    setError('');

    startTransition(async () => {
      try {
        let imageUrl = form.imageUrl;
        if (fileToUpload) {
          const uploaded = await uploadFile();
          if (uploaded) imageUrl = uploaded;
        }

        if (editingClub) {
          await updateClub(editingClub.id, { ...form, imageUrl });
        } else {
          await createClub({ ...form, imageUrl });
        }
        setDialogOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    });
  }

  function confirmDelete(club: Club) {
    setDeleteTarget(club);
    setDeleteDialogOpen(true);
    setError('');
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteClub(deleteTarget.id);
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
        setDeleteDialogOpen(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Clubs ({clubs.length})</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</p>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell>
                  {club.imageUrl ? (
                    <Image
                      src={club.imageUrl}
                      alt={club.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{club.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {club.category?.name ?? '—'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(club)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(club)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {clubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No clubs yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClub ? 'Edit Club' : 'Add Club'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                {error}
              </p>
            )}

            <div className="space-y-1">
              <Label htmlFor="club-name">Name *</Label>
              <Input
                id="club-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Club name"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="club-desc">Description</Label>
              <Textarea
                id="club-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div className="space-y-1">
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Logo Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Image
              </Button>
              {fileError && <p className="text-xs text-destructive">{fileError}</p>}

              {previewUrl && (
                <div className="mt-2">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="rounded object-cover border"
                    unoptimized={previewUrl.startsWith('blob:')}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={pending}>
              {pending ? 'Saving…' : editingClub ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Club</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot
            be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={pending}>
              {pending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
