import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, AlertTriangle, ImageIcon } from "lucide-react";
import { Product } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  loadProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  initProductManager, 
  PRODUCT_EVENTS
} from "@/lib/productManager";

const ProductManager = () => {
  // State management
  const [productList, setProductList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);

  // Initialize product manager and load products
  useEffect(() => {
    initProductManager();
    setProductList(loadProducts());
    
    // Listen for product update events
    const handleProductUpdated = () => {
      setProductList(loadProducts());
    };
    
    window.addEventListener(PRODUCT_EVENTS.PRODUCT_UPDATED, handleProductUpdated);
    window.addEventListener(PRODUCT_EVENTS.PRODUCT_ADDED, handleProductUpdated);
    window.addEventListener(PRODUCT_EVENTS.PRODUCT_DELETED, handleProductUpdated);
    
    return () => {
      window.removeEventListener(PRODUCT_EVENTS.PRODUCT_UPDATED, handleProductUpdated);
      window.removeEventListener(PRODUCT_EVENTS.PRODUCT_ADDED, handleProductUpdated);
      window.removeEventListener(PRODUCT_EVENTS.PRODUCT_DELETED, handleProductUpdated);
    };
  }, []);

  // Check for image errors in localStorage
  useEffect(() => {
    const imageErrorLog = JSON.parse(localStorage.getItem('productImageErrorLog') || '[]');
    setErrorLogs(imageErrorLog);
    
    // Show notification if there are errors
    if (imageErrorLog.length > 0) {
      toast.error(`${imageErrorLog.length} product images failed to load`, {
        description: "Some product images are missing or invalid",
        action: {
          label: "Fix Now",
          onClick: () => handleFixImages()
        }
      });
    }
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (data: Product) => {
    updateProduct(data);
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };
  
  const handleAddProduct = () => {
    // Create a new product with default values
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: "New Product",
      description: "Product description",
      price: 0,
      wholesalePrice: 0,
      image: "/placeholder.svg",
      category: "Uncategorized",
      categoryId: "uncategorized",
      featured: false,
      type: "subscription",
      deliveryTime: "24 hours",
      requiresId: false
    };
    
    // Select it for editing
    setSelectedProduct(newProduct);
    setIsDialogOpen(true);
    toast.success("Enter product details and click save to add it to the catalog.");
  };

  const handleFixImages = () => {
    // Clear the error log
    localStorage.setItem('productImageErrorLog', '[]');
    setErrorLogs([]);
    
    // Get default image from uploaded images
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    const defaultImage = uploadedImages.find((img: any) => img.name === 'Default Product Image')?.url || '/placeholder.svg';
    
    // Find products with broken images
    const productsWithErrors = productList.filter(product => {
      const errorLog = JSON.parse(localStorage.getItem('productImageErrorLog') || '[]');
      return errorLog.some((log: any) => log.productId === product.id);
    });
    
    if (productsWithErrors.length === 0) {
      toast.info("No products with broken images found");
      return;
    }
    
    // Show the image manager dialog
    toast.info(`Found ${productsWithErrors.length} products with broken images`, {
      description: "Click on a product to update its image"
    });
    
    // In a real app, you might show a specialized UI for bulk image fixes
    // For simplicity, we'll just open the first broken product
    if (productsWithErrors.length > 0) {
      setSelectedProduct(productsWithErrors[0]);
      setIsDialogOpen(true);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Manage Products</h3>
          {errorLogs.length > 0 && (
            <p className="text-sm text-yellow-600 flex items-center mt-1">
              <AlertTriangle className="h-4 w-4 mr-1" /> 
              {errorLogs.length} product{errorLogs.length > 1 ? 's' : ''} with image issues detected
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {errorLogs.length > 0 && (
            <Button variant="outline" onClick={handleFixImages}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Fix Images
            </Button>
          )}
          <Button onClick={handleAddProduct}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productList.map((product: Product) => (
          <div key={product.id} className="relative group">
            <ProductCard 
              product={product} 
              onClick={handleProductClick}
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(product);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Product Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to the product information here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            product={selectedProduct}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove {productToDelete?.name} from your product list.
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

export default ProductManager;
