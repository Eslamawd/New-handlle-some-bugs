
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { toast } from "@/lib/toast";

export function useStorage(folderPath = "images") {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = (file: File, customFileName?: string) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    return new Promise<string>((resolve, reject) => {
      const fileName = customFileName || `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${folderPath}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
          toast.error(`Upload failed: ${error.message}`);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadUrl);
          setLoading(false);
          toast.success("File uploaded successfully!");
          resolve(downloadUrl);
        }
      );
    });
  };
  
  const deleteFile = async (fileUrl: string) => {
    try {
      setLoading(true);
      // Extract the path from the URL
      const storageRef = ref(storage, fileUrl);
      await deleteObject(storageRef);
      setLoading(false);
      toast.success("File deleted successfully!");
      return true;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      toast.error(`Error deleting file: ${err.message}`);
      throw err;
    }
  };

  return {
    progress,
    error,
    url,
    loading,
    uploadFile,
    deleteFile
  };
}
