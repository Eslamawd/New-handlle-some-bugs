import React, { useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, UploadCloud, ImageIcon, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  location: string;
  uploadDate?: string;
  size?: number;
}

const ImageManager = () => {
  const [images, setImages] = useState<UploadedImage[]>(() => {
    const storedImages = localStorage.getItem("uploadedImages");
    return storedImages ? JSON.parse(storedImages) : [
      { id: '1', name: 'Hero Background', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', location: 'Homepage' },
      { id: '2', name: 'About Us Banner', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d', location: 'About Page' },
      { id: '3', name: 'Services Banner', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475', location: 'Services Page' },
      { id: '4', name: 'Default Product Image', url: '/placeholder.svg', location: 'Product Pages' },
    ];
  });
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<UploadedImage | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageDetails, setImageDetails] = useState({
    name: '',
    location: '',
    url: '',
    size: undefined as number | undefined
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem("uploadedImages", JSON.stringify(images));
    }
  }, [images]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        setImageDetails(prev => ({
          ...prev,
          url: reader.result as string,
          name: file.name.replace(/\.[^/.]+$/, ""),
          size: file.size
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setImageDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddImage = () => {
    setImageDetails({
      name: '',
      location: '',
      url: '',
      size: undefined
    });
    setPreviewImage(null);
    setIsAddDialogOpen(true);
  };

  const handleEditImage = (image: UploadedImage) => {
    setSelectedImage(image);
    setImageDetails({
      name: image.name,
      location: image.location,
      url: image.url,
      size: image.size
    });
    setPreviewImage(image.url);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (image: UploadedImage) => {
    setImageToDelete(image);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (imageToDelete) {
      const updatedImages = images.filter(img => img.id !== imageToDelete.id);
      setImages(updatedImages);
      setShowDeleteDialog(false);
      setImageToDelete(null);
      toast.success(`Image "${imageToDelete.name}" has been removed`);
    }
  };

  const saveNewImage = () => {
    if (!imageDetails.name.trim()) {
      toast.error("Please enter an image name");
      return;
    }
    if (!imageDetails.url) {
      toast.error("Please upload or provide an image URL");
      return;
    }

    const newImage: UploadedImage = {
      id: `img-${Date.now()}`,
      name: imageDetails.name,
      url: imageDetails.url,
      location: imageDetails.location || 'Unspecified',
      uploadDate: new Date().toISOString(),
      size: imageDetails.size
    };

    setImages([...images, newImage]);
    setIsAddDialogOpen(false);
    toast.success("Image added successfully");
  };

  const saveEditedImage = () => {
    if (!selectedImage) return;
    
    if (!imageDetails.name.trim()) {
      toast.error("Please enter an image name");
      return;
    }
    if (!imageDetails.url) {
      toast.error("Please upload or provide an image URL");
      return;
    }

    const updatedImages = images.map(img => 
      img.id === selectedImage.id 
        ? { 
            ...img, 
            name: imageDetails.name, 
            location: imageDetails.location,
            url: imageDetails.url 
          } 
        : img
    );
    
    setImages(updatedImages);
    setIsEditDialogOpen(false);
    toast.success("Image updated successfully");
  };

  const handleImageError = useCallback((imageId: string, event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image ${imageId}`);
    event.currentTarget.src = '/placeholder.svg';
    const errorLog = JSON.parse(localStorage.getItem('imageErrorLog') || '[]');
    errorLog.push({
      imageId,
      timestamp: new Date().toISOString(),
      url: event.currentTarget.src
    });
    localStorage.setItem('imageErrorLog', JSON.stringify(errorLog));
    
    toast.error("Image failed to load", {
      description: "The image has been replaced with a placeholder",
      action: {
        label: "Fix Now",
        onClick: () => {
          const imgToFix = images.find(img => img.id === imageId);
          if (imgToFix) {
            handleEditImage(imgToFix);
          }
        }
      }
    });
  }, [images]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Manage Website Images</h3>
          <p className="text-sm text-muted-foreground">
            Upload, manage and organize images for your website
          </p>
        </div>
        <Button onClick={handleAddImage}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map(image => (
          <Card key={image.id} className="group relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-sm font-medium">{image.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleEditImage(image)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {image.location}
                {image.uploadDate && (
                  <span className="block text-xs">
                    Uploaded: {new Date(image.uploadDate).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-md group-hover:opacity-90 transition-opacity">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="object-cover w-full h-full"
                  onError={(e) => handleImageError(image.id, e)}
                  loading="lazy"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditImage(image)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteClick(image)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Image</DialogTitle>
            <DialogDescription>
              Upload a new image or enter an image URL
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Name</label>
              <Input 
                name="name"
                value={imageDetails.name}
                onChange={handleInputChange}
                placeholder="Enter image name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location/Usage</label>
              <Input 
                name="location"
                value={imageDetails.location}
                onChange={handleInputChange}
                placeholder="Where will this image be used?"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Image</label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Max file size: 5MB. Supported formats: JPG, PNG, WebP
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Or Image URL</label>
              <Input 
                name="url"
                value={imageDetails.url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            {previewImage && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-md overflow-hidden aspect-video bg-muted">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="object-contain w-full h-full"
                    onError={() => {
                      toast.error("Failed to load preview image");
                      setPreviewImage(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNewImage}>
              Save Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Update image details or replace the image
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image Name</label>
              <Input 
                name="name"
                value={imageDetails.name}
                onChange={handleInputChange}
                placeholder="Enter image name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location/Usage</label>
              <Input 
                name="location"
                value={imageDetails.location}
                onChange={handleInputChange}
                placeholder="Where is this image used?"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Replace Image</label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Or Image URL</label>
              <Input 
                name="url"
                value={imageDetails.url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            {previewImage && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="border rounded-md overflow-hidden aspect-video bg-muted">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="object-contain w-full h-full"
                    onError={() => {
                      toast.error("Failed to load preview image");
                      setPreviewImage('/placeholder.svg');
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedImage}>
              Update Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove "{imageToDelete?.name}" from your image library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ImageManager;
