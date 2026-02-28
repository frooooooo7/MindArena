"use client";

import { useState, useRef, useEffect } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { User } from "@mindarena/shared";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";

interface ProfileAvatarTabProps {
  user: User;
}

export function ProfileAvatarTab({ user }: ProfileAvatarTabProps) {
  const { updateAvatarUrl } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatar = preview || user.avatarUrl || null;

  // Cleanup ObjectURL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateAvatarUrl(response.data.avatarUrl);
      toast.success("Avatar updated successfully!");
      setFile(null);
      setPreview(null);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || "Failed to upload avatar.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete("/users/avatar");
      updateAvatarUrl(null);
      setFile(null);
      setPreview(null);
      toast.success("Avatar removed.");
    } catch {
      toast.error("Failed to remove avatar.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 pt-4">
      <div className="relative group">
        <UserAvatar name={user.name} avatarUrl={displayAvatar} size="lg" />
        <div 
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-5 h-5 text-white mb-1" />
          <span className="text-[10px] font-medium text-white">Change</span>
        </div>
      </div>

      <div className="flex gap-3">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg, image/png, image/webp, image/gif" 
          onChange={handleFileSelect}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-semibold transition-colors border border-border/50"
        >
          <ImageIcon className="w-4 h-4" />
          {file ? "Change File" : "Choose Image"}
        </button>
        
        {user.avatarUrl && !file && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl text-sm font-semibold transition-colors border border-destructive/20"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Remove
          </button>
        )}
      </div>

      {file && (
        <button 
          disabled={isUploading}
          onClick={handleUpload}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Picture
        </button>
      )}
    </div>
  );
}
