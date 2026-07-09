'use client';

import * as React from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { resolveMediaUrl, uploadMedia, ApiError } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUploader({ value, onChange, max = 6 }: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = max - value.length;
    const selected = Array.from(files).slice(0, remaining);

    setIsUploading(true);
    try {
      for (const file of selected) {
        const { url } = await uploadMedia(file);
        onChange([...value, url]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Échec de l'envoi",
        description: error instanceof ApiError ? error.message : "Impossible d'envoyer cette image.",
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-3">
      {value.map((url, index) => (
        <div key={url} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveMediaUrl(url)} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => removeAt(index)}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Supprimer l'image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {value.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          <span className="text-[11px]">Ajouter</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
