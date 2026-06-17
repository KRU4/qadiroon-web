import { useRef, useState } from "react";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { api } from "../lib/api";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({ value, onChange, accept, maxSizeMB = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    const allowed = accept
      ? accept.split(",").map((s) => s.trim())
      : ALLOWED_TYPES;
    if (!allowed.includes(file.type)) {
      return "Invalid file type. Accepted: " + allowed.map((t) => t.replace("image/", "")).join(", ");
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Max ${maxSizeMB}MB.`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setUploading(true);
    setProgress(30);
    try {
      const res = await api.upload(file);
      setProgress(100);
      onChange(res.url);
      setTimeout(() => setProgress(0), 500);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const remove = () => {
    onChange("");
    setError("");
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block group">
          <img
            src={value}
            alt="Uploaded"
            className="max-w-xs max-h-40 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={remove}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IconX size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="text-gray-400">
              <IconPhoto size={32} className="mx-auto mb-2" />
              <p className="text-sm">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max {maxSizeMB}MB)</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept || ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
