'use client';
import { useState } from 'react';

export function CommandMenu() {
  const [query, setQuery] = useState('');

  const handleSlashCommand = async (cmd: string) => {
    if (cmd === '/devto') {
      const res = await fetch('/api/devto');
      const articles = await res.json();
      
      return (
        <div className="border rounded p-2">
          {articles.map((a: any) => (
            <div 
              key={a.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(`{% devto-${a.id} %}`);
                alert('Embed code copied!');
              }}
            >
              {a.title}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type /devto"
        className="p-2 border rounded"
      />
      {query === '/devto' && handleSlashCommand(query)}
    </div>
  );
}