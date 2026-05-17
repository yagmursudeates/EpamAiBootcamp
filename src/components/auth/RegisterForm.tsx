'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPwError(null);

    if (password.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.status === 409) {
      setError('Email already in use');
      return;
    }

    if (res.ok) {
      router.push('/dashboard');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {pwError && <p>{pwError}</p>}
      </div>
      {error && <p>{error}</p>}
      <button type="submit">Register</button>
    </form>
  );
}
