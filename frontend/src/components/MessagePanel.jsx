import React from 'react';

export function MessagePanel({ message, type }) {
  if (!message) return null;

  const bg =
    type === 'error'
      ? 'bg-red-100 text-red-800 border-red-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <div className={`mt-4 border rounded-md px-3 py-2 text-sm ${bg}`}>
      {message}
    </div>
  );
}

