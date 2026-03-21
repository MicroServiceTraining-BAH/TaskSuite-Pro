"use client";

import React, { useState, useRef } from "react";
import { Label } from "@tasksuite/ui";
import { Input } from "@tasksuite/ui";
import { Button } from "@tasksuite/ui";
import { uploadJobPhoto, deleteJobPhoto, getJobPhotos } from "@/lib/api";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  jobId: string;
  photos: any[];
  onPhotosChange: (photos: any[]) => void;
}

export function PhotoUpload({ jobId, photos, onPhotosChange }: PhotoUploadProps) {
  const [photoType, setPhotoType] = useState("general");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
        alert("Please select a valid image file (JPG, PNG, GIF, or WebP)");
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUploadPhoto() {
    if (!selectedFile) {
      alert("Please select a photo to upload");
      return;
    }

    setUploading(true);
    try {
      const newPhoto = await uploadJobPhoto(
        jobId,
        selectedFile,
        photoType,
        description || undefined
      );
      
      // Reload photos to get the correct URL
      const updatedPhotos = await getJobPhotos(jobId);
      onPhotosChange(updatedPhotos as any[]);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setDescription("");
      setPhotoType("general");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Failed to upload photo:", error);
      alert(error.message || "Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    
    try {
      await deleteJobPhoto(jobId, photoId);
      const updatedPhotos = await getJobPhotos(jobId);
      onPhotosChange(updatedPhotos as any[]);
    } catch (error) {
      console.error("Failed to delete photo:", error);
      alert("Failed to delete photo");
    }
  }

  function handleRemoveSelected() {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 border rounded-lg p-4 bg-muted/30">
        <div className="grid gap-2">
          <Label htmlFor="photoFile">Select Photo</Label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id="photoFile"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
            {selectedFile && (
              <span className="text-sm text-muted-foreground">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, GIF, WebP (max 5MB)
          </p>
        </div>

        {preview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-xs h-48 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveSelected}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="photoType">Photo Type</Label>
          <select
            id="photoType"
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value)}
            className="input-enhanced"
          >
            <option value="before">Before</option>
            <option value="after">After</option>
            <option value="progress">Progress</option>
            <option value="damage">Damage</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Photo description..."
            className="input-enhanced"
          />
        </div>

        <Button
          type="button"
          onClick={handleUploadPhoto}
          disabled={uploading || !selectedFile}
          className="w-full"
        >
          {uploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>
      </div>

      {photos.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Uploaded Photos ({photos.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => {
              const photoUrl = photo.url.startsWith('http') 
                ? photo.url 
                : `${API_URL}${photo.url}`;
              
              return (
                <div key={photo.id} className="relative group border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={photoUrl}
                      alt={photo.description || "Job photo"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-info capitalize text-xs">
                        {photo.photoType}
                      </span>
                    </div>
                    {photo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                    {photo.createdAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No photos uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload photos to document the job progress
          </p>
        </div>
      )}
    </div>
  );
}

