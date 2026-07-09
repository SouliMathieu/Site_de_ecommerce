'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Moon, Store, Sun, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { SUPPORTED_CURRENCIES } from '@vente/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const profileSchema = z.object({ name: z.string().min(2, 'Le nom est trop court.') });
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Requis.'),
    newPassword: z.string().min(8, '8 caractères minimum.'),
    confirmPassword: z.string().min(1, 'Requis.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

function ProfileCard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '' },
  });

  const onSubmit = async (values: ProfileValues) => {
    setIsSubmitting(true);
    try {
      await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify(values) });
      await refreshUser();
      toast({ title: 'Profil mis à jour' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Vos informations personnelles.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (values: PasswordValues) => {
    setIsSubmitting(true);
    try {
      await apiFetch('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      });
      toast({ title: 'Mot de passe mis à jour' });
      reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité</CardTitle>
        <CardDescription>Modifiez votre mot de passe.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input id="currentPassword" type="password" {...register('currentPassword')} />
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input id="newPassword" type="password" {...register('newPassword')} />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Mettre à jour le mot de passe
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function StoreCard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currency, setCurrency] = React.useState(user?.currency ?? 'XOF');

  React.useEffect(() => {
    if (user?.currency) setCurrency(user.currency);
  }, [user?.currency]);

  const onSave = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify({ currency }) });
      await refreshUser();
      toast({ title: 'Devise mise à jour' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error instanceof ApiError ? error.message : 'Réessayez.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-4 w-4" />
          Boutique
        </CardTitle>
        <CardDescription>Choisissez la devise utilisée pour vos prix et vos commandes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="currency">Devise</Label>
        <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
      </CardContent>
      <CardFooter>
        <Button onClick={onSave} disabled={isSubmitting || currency === user?.currency}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: SunMoon },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>Choisissez le thème du tableau de bord.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors',
                active ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-secondary',
              )}
            >
              <Icon className="h-5 w-5" />
              {option.label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function ParametresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Gérez votre profil, votre sécurité et vos préférences.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileCard />
        <PasswordCard />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StoreCard />
        <AppearanceCard />
      </div>
    </div>
  );
}
