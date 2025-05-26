import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  PlayCircle, 
  ShoppingCart, 
  Zap, 
  Shield, 
  Search,
  CreditCard,
  Clock,
  ArrowRight,
  Star,
  Gamepad2,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import MainLayout from "@/components/MainLayout";
import { toast } from "@/lib/toast";

// Featured services data
const featuredServices = [
  {
    id: 1,
    name: "Netflix Premium",
    description: "Full 4K streaming plan with unlimited access",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
    category: "streaming",
    popular: true
  },
  {
    id: 2,
    name: "Spotify Family",
    description: "Music streaming for up to 6 family members",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1974&auto=format&fit=crop",
    category: "streaming",
    popular: false
  },
  {
    id: 3,
    name: "PUBG Mobile UC",
    description: "1000 Unknown Cash for in-game purchases",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1560253023-3ec5085aaab8?q=80&w=2070&auto=format&fit=crop",
    category: "gaming",
    popular: true
  },
  {
    id: 4,
    name: "Instagram Followers",
    description: "Add 1000 high-quality followers to your profile",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=2074&auto=format&fit=crop",
    category: "social",
    popular: true
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Regular Customer",
    comment: "I've been using Servexlb for all my streaming needs. Their service is incredibly fast and reliable. Highly recommended!",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Gamer",
    comment: "The gaming credits I purchased were delivered instantly. Great service with competitive prices. Will definitely use again!",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Content Creator",
    comment: "As a social media influencer, I need reliable services. Servexlb has been my go-to for all my digital service needs.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Helper function to render the correct icon based on icon name
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "play-circle":
        return <PlayCircle className="h-6 w-6 text-primary" />;
      case "gamepad-2":
        return <Gamepad2 className="h-6 w-6 text-primary" />;
      case "thumbs-up":
        return <ThumbsUp className="h-6 w-6 text-primary" />;
      case "shopping-cart":
        return <ShoppingCart className="h-6 w-6 text-primary" />;
      default:
        return <Zap className="h-6 w-6 text-primary" />;
    }
  };

  // Load categories from localStorage
  const getServiceCategories = () => {
    const storedCategories = localStorage.getItem('categories');
    return storedCategories ? JSON.parse(storedCategories) : [];
  };

  // Use the function in your component
  const serviceCategories = getServiceCategories();

  // Show purchase confirmation dialog
  const showPurchaseConfirmation = (service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  // Handle purchase of featured service
  const handlePurchaseService = () => {
    if (!selectedService) return;
    const service = selectedService;
    
    console.log("Purchase featured service:", service);
    
    // Get current user balance from localStorage
    const userBalanceStr = localStorage.getItem('userBalance');
    const userBalance = userBalanceStr ? parseFloat(userBalanceStr) : 120.00; // Default to 120 if not set
    
    // Check if user has sufficient balance
    if (userBalance < service.price) {
      toast.error("Insufficient balance", {
        description: "You don't have enough funds to make this purchase"
      });
      // Redirect to payment page
      navigate("/payment");
      return;
    }

    // Deduct the price from user balance immediately
    const newBalance = userBalance - service.price;
    localStorage.setItem('userBalance', newBalance.toString());

    // Create order with pending status
    const order = {
      id: `order-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      totalPrice: service.price,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Save order to localStorage
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    customerOrders.push(order);
    localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    
    toast.success("Purchase successful!", {
      description: `Your order is being processed. $${service.price.toFixed(2)} has been deducted from your balance.`
    });
    
    // Close dialog and redirect to dashboard
    setIsDialogOpen(false);
    navigate("/dashboard");
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="space-y-16"
      >
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 to-primary/5 py-16 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Buy Streaming, Gaming, and Social Media Services Instantly
                </motion.h1>
                <motion.p 
                  className="text-xl text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Get instant access to premium digital services with guaranteed delivery and 24/7 support.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link to="/services">
                    <Button size="lg" className="w-full sm:w-auto">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      View Services
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
                
                <motion.div 
                  className="relative mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <Input
                    type="search"
                    placeholder="Search for services..."
                    className="pl-10 py-6 text-base rounded-lg w-full shadow-sm"
                  />
                  <Button className="absolute right-1.5 top-1.5 hidden sm:flex">
                    Search
                  </Button>
                </motion.div>
              </div>
              
              <motion.div 
                className="rounded-xl overflow-hidden shadow-2xl border relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1000&auto=format&fit=crop" 
                  alt="Digital Services" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6">
                  <p className="text-lg font-medium">Your one-stop shop for digital services</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Browse by Category
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our wide range of digital services designed to make your online experience better.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serviceCategories.map((category) => (
                <Link to={`/services?category=${category.id}`} key={category.id}>
                  <Card className="bg-card h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                        {renderCategoryIcon(category.icon || "box")}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground mb-4 flex-grow">
                        {category.description}
                      </p>
                      <div className="text-primary font-medium flex items-center mt-auto">
                        Browse Services
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Services Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Featured Services
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Check out our most popular digital services with instant delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48">
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover"
                    />
                    {service.popular && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                        Popular
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <span className="text-lg font-bold">${service.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {service.category}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => showPurchaseConfirmation(service)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Order Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link to="/services">
                <Button size="lg" variant="outline">
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Choose Servexlb?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We provide the best digital services with instant delivery and excellent support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Instant Delivery
                </h3>
                <p className="text-muted-foreground">
                  Get your services delivered instantly after purchase. No waiting needed.
                </p>
              </Card>

              <Card className="p-6">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Secure Payments
                </h3>
                <p className="text-muted-foreground">
                  All transactions are secure and encrypted for your peace of mind.
                </p>
              </Card>

              <Card className="p-6">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  24/7 Support
                </h3>
                <p className="text-muted-foreground">
                  Our dedicated support team is always ready to assist you with any issues.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                What Our Customers Say
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it - check out what our satisfied customers have to say.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="p-6">
                  <div className="flex items-start mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <div className="flex mt-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star 
                            key={index} 
                            className={`w-4 h-4 ${index < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground p-8 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                  <p className="text-primary-foreground/90 mb-6">
                    Create an account today and get access to all our premium digital services.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link to="/services" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 w-full sm:w-auto">
                      Browse Services
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Are you sure you want to purchase {selectedService?.name}?
              </DialogDescription>
            </DialogHeader>
            
            {selectedService && (
              <div className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Price:</span>
                  <span className="font-bold">${selectedService.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Service:</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Category:</span>
                  <span className="capitalize">{selectedService.category}</span>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePurchaseService}>
                Confirm Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
};

export default Home;
