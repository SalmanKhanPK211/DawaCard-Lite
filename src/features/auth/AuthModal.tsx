import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, isConfigured } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onClose();
          resetForm();
        }
      } else {
        const res = await signUp(email.trim(), password, displayName.trim());
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(
            'Account created successfully! If email confirmation is enabled on your Supabase project, check your inbox.'
          );
          if (res.session) {
            setTimeout(() => {
              onClose();
              resetForm();
            }, 1500);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={mode === 'signin' ? 'Sign In to DawaCard' : 'Create an Account'}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Supabase Not Configured Warning Banner */}
        {!isConfigured && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Supabase Cloud Keys Not Set</span>
            </div>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Cloud login requires connecting a free Supabase project. Add the following to your <code>.env</code> file or Vercel Environment Variables:
            </p>
            <div className="bg-amber-100/60 p-2 rounded text-[11px] font-mono text-amber-950 space-y-0.5">
              <div>VITE_SUPABASE_URL=https://your-id.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
            </div>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#0F766E] hover:underline text-[11px]"
            >
              <span>Create free Supabase project</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <Input
              label="Full Name / Display Name (Optional)"
              placeholder="e.g. Jane Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isSubmitting}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            helperText={mode === 'signup' ? 'Must be at least 6 characters' : undefined}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isSubmitting}
            disabled={!isConfigured}
            icon={mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Free Account'}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted cloud authentication powered by Supabase</span>
        </div>
      </div>
    </Modal>
  );
};
