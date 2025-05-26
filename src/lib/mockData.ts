import { 
  AdminNotification, 
  SubscriptionIssue, 
  IssueType, 
  IssueStatus,
  CustomerNotification,
  Service,
  ServiceCategory,
  User,
  UserRole
} from '@/lib/types';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image: string;
  category: string;
  categoryId?: string;
  type?: "subscription" | "recharge" | "giftcard" | "service" | "topup";
  value?: number;
  deliveryTime?: string;
  featured?: boolean;
  availableMonths?: number[];
  apiUrl?: string;
  minQuantity?: number;
  requiresId?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  wholesalerId?: string;
  balance: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  customerId: string;
  date: string;
  products: {
    productId: string;
    quantity: number;
    priceAtSale: number;
  }[];
  total: number;
  paid: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  price: number;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Ceramic Vase",
    description: "Handcrafted ceramic vase with a modern, minimalist design.",
    price: 89.99,
    wholesalePrice: 49.99,
    image: "https://images.unsplash.com/photo-1602748828300-57c35baaef48?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor"
  },
  {
    id: "p2",
    name: "Artisanal Coffee Mug",
    description: "Handmade ceramic mug with a unique glazed finish.",
    price: 34.99,
    wholesalePrice: 19.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop",
    category: "Kitchenware"
  },
  {
    id: "p3",
    name: "Minimalist Wall Clock",
    description: "Simple yet elegant wall clock with a silent quartz movement.",
    price: 59.99,
    wholesalePrice: 32.99,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor"
  },
  {
    id: "p4",
    name: "Natural Linen Throw Pillow",
    description: "Soft, natural linen pillow cover with a feather insert.",
    price: 49.99,
    wholesalePrice: 28.99,
    image: "https://images.unsplash.com/photo-1592789705501-f9ae4287c4a9?q=80&w=1000&auto=format&fit=crop",
    category: "Textiles"
  },
  {
    id: "p5",
    name: "Handwoven Basket",
    description: "Traditional handwoven basket made from sustainable materials.",
    price: 79.99,
    wholesalePrice: 42.99,
    image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=1000&auto=format&fit=crop",
    category: "Storage"
  },
  {
    id: "p6",
    name: "Glass Terrarium",
    description: "Geometric glass terrarium for displaying small plants and succulents.",
    price: 69.99,
    wholesalePrice: 38.99,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1000&auto=format&fit=crop",
    category: "Plants"
  },
];

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Jane Smith",
    phone: "+1 (555) 123-4567",
    email: "jane@example.com",
    company: "Smith Home Goods",
    notes: "Prefers delivery on Tuesdays",
    wholesalerId: "wholesaler1",
    balance: 0,
    createdAt: "2023-01-01T00:00:00Z"
  },
  {
    id: "c2",
    name: "Michael Johnson",
    phone: "+1 (555) 987-6543",
    email: "michael@example.com",
    company: "Urban Living Co.",
    notes: "",
    wholesalerId: "admin",
    balance: 0,
    createdAt: "2023-01-02T00:00:00Z"
  },
  {
    id: "c3",
    name: "Emma Williams",
    phone: "+1 (555) 456-7890",
    email: "emma@example.com",
    company: "Williams Decor",
    notes: "New customer as of Jan 2023",
    wholesalerId: "wholesaler1",
    balance: 0,
    createdAt: "2023-01-03T00:00:00Z"
  },
];

export const sales: Sale[] = [
  {
    id: "s1",
    customerId: "c1",
    date: "2023-05-15",
    products: [
      { productId: "p1", quantity: 5, priceAtSale: 49.99 },
      { productId: "p3", quantity: 3, priceAtSale: 32.99 }
    ],
    total: 348.92,
    paid: true
  },
  {
    id: "s2",
    customerId: "c2",
    date: "2023-05-20",
    products: [
      { productId: "p2", quantity: 10, priceAtSale: 19.99 },
      { productId: "p4", quantity: 8, priceAtSale: 28.99 }
    ],
    total: 431.82,
    paid: true
  },
  {
    id: "s3",
    customerId: "c3",
    date: "2023-06-01",
    products: [
      { productId: "p5", quantity: 4, priceAtSale: 42.99 },
      { productId: "p6", quantity: 6, priceAtSale: 38.99 }
    ],
    total: 405.90,
    paid: false
  },
];

export const subscriptions: Subscription[] = [];

export const adminNotifications: AdminNotification[] = [
  {
    id: "n1",
    type: "profile_fix",
    subscriptionId: "sub-1",
    userId: "c1",
    customerName: "Jane Smith",
    serviceName: "Premium Ceramic Vase",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: "n2",
    type: "payment_issue",
    subscriptionId: "sub-3",
    userId: "c2",
    customerName: "Michael Johnson",
    serviceName: "Minimalist Wall Clock",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true
  },
  {
    id: "n3",
    type: "password_reset",
    subscriptionId: "sub-2",
    userId: "c1",
    customerName: "Jane Smith",
    serviceName: "Artisanal Coffee Mug",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    read: false
  }
];

export const subscriptionIssues: SubscriptionIssue[] = [];
export const customerNotifications: CustomerNotification[] = [];

const wholesaleUsers = [
  { username: 'wholesaler1', password: 'password123' },
  { username: 'admin', password: 'admin123' }
];

export const checkWholesalePassword = (password: string): boolean => {
  return password === 'wholesale2023';
};

export const checkWholesaleCredentials = (username: string, password: string): boolean => {
  return wholesaleUsers.some(
    user => user.username === username && user.password === password
  );
};

export const calculateTotalSales = (): number => {
  return sales.reduce((total, sale) => total + (sale.paid ? sale.total : 0), 0);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getSalesByCustomerId = (customerId: string): Sale[] => {
  return sales.filter(sale => sale.customerId === customerId);
};

export const getSubscriptionsByCustomerId = (customerId: string): Subscription[] => {
  return subscriptions.filter(subscription => subscription.customerId === customerId);
};

export const getSubscriptionById = (id: string): Subscription | undefined => {
  return subscriptions.find(subscription => subscription.id === id);
};

export const addCustomerBalance = (customerId: string, amount: number): boolean => {
  const customer = customers.find(c => c.id === customerId);
  if (customer) {
    customer.balance += amount;
    return true;
  }
  return false;
};

export const deductCustomerBalance = (customerId: string, amount: number): boolean => {
  const customer = customers.find(c => c.id === customerId);
  if (customer && customer.balance >= amount) {
    customer.balance -= amount;
    return true;
  }
  return false;
};

export const addSubscription = (subscription: Subscription): void => {
  subscriptions.push(subscription);
};

export const createSubscriptionIssue = (issueData: {
  subscriptionId: string;
  userId: string;
  customerName: string;
  serviceName: string;
  type: IssueType;
  credentials?: {
    username?: string;
    password?: string;
    email?: string;
    notes?: string;
    [key: string]: any;
  };
}): Promise<boolean> => {
  const newIssue: SubscriptionIssue = {
    id: `issue-${Date.now()}`,
    subscriptionId: issueData.subscriptionId,
    userId: issueData.userId,
    customerName: issueData.customerName,
    serviceName: issueData.serviceName,
    type: issueData.type,
    status: "pending" as IssueStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    credentials: issueData.credentials
  };
  
  subscriptionIssues.unshift(newIssue);
  
  const newNotification: AdminNotification = {
    id: `n${adminNotifications.length + 1}`,
    type: issueData.type,
    subscriptionId: issueData.subscriptionId,
    userId: issueData.userId,
    customerName: issueData.customerName,
    serviceName: issueData.serviceName,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  adminNotifications.unshift(newNotification);
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};

export const getSubscriptionIssues = (): SubscriptionIssue[] => {
  return subscriptionIssues;
};

export const resolveSubscriptionIssue = (
  issueId: string, 
  resolvedBy: string, 
  notes?: string
): Promise<boolean> => {
  const issue = subscriptionIssues.find(i => i.id === issueId);
  if (issue) {
    issue.status = "resolved";
    issue.resolvedAt = new Date().toISOString();
    issue.resolvedBy = resolvedBy;
    if (notes) {
      issue.notes = notes;
    }
  }
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};

export const sendCustomerNotification = (notificationData: {
  userId: string;
  type: "profile_fixed" | "payment_resolved" | "password_reset" | "order_completed";
  message: string;
  subscriptionId?: string;
  serviceName?: string;
}): Promise<boolean> => {
  const newNotification: CustomerNotification = {
    id: `cn-${Date.now()}`,
    userId: notificationData.userId,
    type: notificationData.type,
    message: notificationData.message,
    createdAt: new Date().toISOString(),
    read: false,
    subscriptionId: notificationData.subscriptionId,
    serviceName: notificationData.serviceName
  };
  
  customerNotifications.unshift(newNotification);
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500);
  });
};

export const getCustomerNotifications = (userId: string): CustomerNotification[] => {
  return customerNotifications.filter(notification => notification.userId === userId);
};

export const markCustomerNotificationAsRead = (notificationId: string): void => {
  const notification = customerNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

export const markAllCustomerNotificationsAsRead = (userId: string): void => {
  customerNotifications.forEach(notification => {
    if (notification.userId === userId) {
      notification.read = true;
    }
  });
};

export const fixSubscriptionProfile = (subscriptionId: string, userId: string, customerName: string, serviceName: string): Promise<boolean> => {
  const subscription = getSubscriptionById(subscriptionId);
  return createSubscriptionIssue({
    subscriptionId,
    userId,
    customerName,
    serviceName,
    type: "profile_fix" as IssueType,
    credentials: subscription?.credentials
  });
};

export const reportPaymentIssue = (subscriptionId: string, userId: string, customerName: string, serviceName: string): Promise<boolean> => {
  const subscription = getSubscriptionById(subscriptionId);
  return createSubscriptionIssue({
    subscriptionId,
    userId,
    customerName,
    serviceName,
    type: "payment_issue" as IssueType,
    credentials: subscription?.credentials
  });
};

export const reportPasswordIssue = (subscriptionId: string, userId: string, customerName: string, serviceName: string): Promise<boolean> => {
  const subscription = getSubscriptionById(subscriptionId);
  return createSubscriptionIssue({
    subscriptionId,
    userId,
    customerName,
    serviceName,
    type: "password_reset",
    credentials: subscription?.credentials
  });
};

export const getAdminNotifications = (): AdminNotification[] => {
  return adminNotifications;
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notification = adminNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

export const markAllNotificationsAsRead = (): void => {
  adminNotifications.forEach(notification => {
    notification.read = true;
  });
};

export const categories: ServiceCategory[] = [
  {
    id: "c1",
    name: "Home Decor",
    description: "Products for decorating your home.",
    icon: "HomeIcon"
  },
  {
    id: "c2",
    name: "Kitchenware",
    description: "Utensils and cookware for your kitchen.",
    icon: "UtensilsIcon"
  },
  {
    id: "c3",
    name: "Textiles",
    description: "Bedding and home textiles.",
    icon: "ScrollIcon"
  },
  {
    id: "c4",
    name: "Storage",
    description: "Containers and storage solutions.",
    icon: "PackageIcon"
  },
  {
    id: "c5",
    name: "Plants",
    description: "Living plants and succulents.",
    icon: "LeafIcon"
  }
];

export const serviceCategories = categories;

export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id);
};

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return categories.find(category => category.id === id);
};

export const services: Service[] = [
  {
    id: "s1",
    name: "Premium Ceramic Vase",
    description: "Handcrafted ceramic vase with a modern, minimalist design.",
    price: 89.99,
    wholesalePrice: 49.99,
    image: "https://images.unsplash.com/photo-1602748828300-57c35baaef48?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor",
    type: "service"
  },
  {
    id: "s2",
    name: "Artisanal Coffee Mug",
    description: "Handmade ceramic mug with a unique glazed finish.",
    price: 34.99,
    wholesalePrice: 19.99,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000&auto=format&fit=crop",
    category: "Kitchenware",
    type: "service"
  },
  {
    id: "s3",
    name: "Minimalist Wall Clock",
    description: "Simple yet elegant wall clock with a silent quartz movement.",
    price: 59.99,
    wholesalePrice: 32.99,
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000&auto=format&fit=crop",
    category: "Home Decor",
    type: "service"
  },
  {
    id: "s4",
    name: "Natural Linen Throw Pillow",
    description: "Soft, natural linen pillow cover with a feather insert.",
    price: 49.99,
    wholesalePrice: 28.99,
    image: "https://images.unsplash.com/photo-1592789705501-f9ae4287c4a9?q=80&w=1000&auto=format&fit=crop",
    category: "Textiles",
    type: "service"
  },
  {
    id: "s5",
    name: "Handwoven Basket",
    description: "Traditional handwoven basket made from sustainable materials.",
    price: 79.99,
    wholesalePrice: 42.99,
    image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?q=80&w=1000&auto=format&fit=crop",
    category: "Storage",
    type: "service"
  },
  {
    id: "s6",
    name: "Glass Terrarium",
    description: "Geometric glass terrarium for displaying small plants and succulents.",
    price: 69.99,
    wholesalePrice: 38.99,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1000&auto=format&fit=crop",
    category: "Plants",
    type: "service"
  },
];

export const users: User[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    balance: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "u2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "customer",
    balance: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: "u3",
    name: "Emily Johnson",
    email: "emily@example.com",
    role: "wholesale",
    balance: 0,
    createdAt: new Date().toISOString()
  }
];
