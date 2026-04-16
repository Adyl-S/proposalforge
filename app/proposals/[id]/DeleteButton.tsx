'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this proposal permanently? This cannot be undone.')) return;
    setDeleting(true);
    const r = await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
    if (r.ok) {
      router.push('/');
      router.refresh();
    } else {
      setDeleting(false);
      alert('Delete failed.');
    }
  }

  return (
    <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
