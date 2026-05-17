'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCategory, updateCategory, deleteCategory } from '@/actions/admin';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type Category = { id: string; name: string };

interface Props {
  categories: Category[];
}

export function CategoriesManager({ categories }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(cat.name);
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  function saveEdit(categoryId: string) {
    if (!editValue.trim()) return;
    setError('');
    startTransition(async () => {
      try {
        await updateCategory(categoryId, editValue.trim());
        setEditingId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
      }
    });
  }

  function handleAdd() {
    if (!newName.trim()) return;
    setError('');
    startTransition(async () => {
      try {
        await createCategory(newName.trim());
        setNewName('');
        setShowAdd(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Create failed');
      }
    });
  }

  function confirmDelete(cat: Category) {
    setDeleteTarget(cat);
    setDeleteDialogOpen(true);
    setError('');
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteCategory(deleteTarget.id);
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Delete failed');
        setDeleteDialogOpen(false);
      }
    });
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categories ({categories.length})</h2>
        <Button onClick={() => setShowAdd(true)} disabled={showAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</p>
      )}

      {showAdd && (
        <div className="flex gap-2 items-center border rounded-lg px-3 py-2">
          <Input
            autoFocus
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') setShowAdd(false);
            }}
            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button size="icon" variant="ghost" onClick={handleAdd} disabled={pending}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setShowAdd(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="border rounded-lg divide-y">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 px-4 py-3">
            {editingId === cat.id ? (
              <>
                <Input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(cat.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  className="h-8"
                />
                <Button size="icon" variant="ghost" onClick={() => saveEdit(cat.id)} disabled={pending}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{cat.name}</span>
                <Button size="icon" variant="ghost" onClick={() => startEdit(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => confirmDelete(cat)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && !showAdd && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No categories yet.
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will fail
            if any clubs or events use this category.
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
