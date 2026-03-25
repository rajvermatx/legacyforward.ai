'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompassStore, Role } from '@/lib/compass-store';
import { seedSampleProject } from '@/lib/compass-seed';
import { Compass } from 'lucide-react';
import Link from 'next/link';

const roles: { value: Role; label: string }[] = [
  { value: 'BA', label: 'Business Analyst' },
  { value: 'QA', label: 'Quality Analyst' },
  { value: 'PO', label: 'Product Owner' },
  { value: 'PM', label: 'Project Manager' },
  { value: 'DataSteward', label: 'Data Steward' },
  { value: 'ChangeManager', label: 'Change Manager' },
  { value: 'Other', label: 'Other' },
];

export default function CompassLoginPage() {
  const router = useRouter();
  const user = useCompassStore((s) => s.user);
  const setUser = useCompassStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('BA');
  const [org, setOrg] = useState('');
  const [step, setStep] = useState<'email' | 'profile'>(user ? 'email' : 'email');

  // If already logged in, redirect
  if (user) {
    router.push('/compass/dashboard');
    return null;
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setStep('profile');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split('@')[0],
      role,
      org: org || undefined,
    };
    setUser(newUser);

    // Seed a sample project so new users can explore the full tool
    const sampleProjectId = seedSampleProject();
    router.push(`/compass/projects/${sampleProjectId}`);
  };

  return (
    <div className="min-h-screen bg-lt-gray flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/compass" className="inline-flex items-center gap-2">
            <Compass size={32} className="text-gold" />
            <span className="text-xl font-bold text-navy tracking-heading">Meridian Compass</span>
            <span className="text-xs font-bold text-gold align-super">&trade;</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-light shadow-sm p-8">
          {step === 'email' ? (
            <>
              <h1 className="text-xl font-bold text-navy mb-1">Welcome</h1>
              <p className="text-sm text-gray mb-6">Enter your email to get started — it&apos;s free.</p>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-light px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                    placeholder="you@company.com"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-gold text-white font-bold rounded-lg hover:bg-gold/90 transition-colors">
                  Continue
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-navy mb-1">Set up your profile</h1>
              <p className="text-sm text-gray mb-6">Tell us about yourself so we can tailor the experience.</p>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-light px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Primary role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full rounded-lg border border-light px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">Organisation <span className="text-gray">(optional)</span></label>
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full rounded-lg border border-light px-4 py-2.5 text-dark focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                    placeholder="Acme Corp"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-gold text-white font-bold rounded-lg hover:bg-gold/90 transition-colors">
                  Create account &amp; start
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-xs text-gray text-center mt-4">
          No credit card required. Your data is stored locally in this browser.
        </p>
      </div>
    </div>
  );
}
