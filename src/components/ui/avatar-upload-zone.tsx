import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AvatarUploadZoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  progress?: number;
  stage?: string;
  error?: string | null;
  className?: string;
}

export function AvatarUploadZone({
  onFileSelect,
  isUploading = false,
  progress = 0,
  stage = '',
  error = null,
  className
}: AvatarUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onFileSelect(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isUploading && "pointer-events-none opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('avatar-file-input')?.click()}
      >
        <input
          id="avatar-file-input"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <div className="space-y-2">
              <p className="text-sm font-medium">{stage}</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Upload a new avatar</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive flex items-start gap-2">
          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}