
import { Subscription } from '@/lib/types';
import { products, customers as defaultCustomers } from '@/lib/data';

export const createMockSubscriptions = (): Subscription[] => {
  return [
    {
      id: 'sub-1',
      userId: defaultCustomers[0].id,
      serviceId: products[0].id,
      startDate: '2023-08-01T00:00:00Z',
      endDate: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
      status: 'active',
      credentials: {
        email: 'customer1@example.com',
        password: 'password123'
      }
    },
    {
      id: 'sub-2',
      userId: defaultCustomers[0].id,
      serviceId: products[1].id,
      startDate: '2023-09-15T00:00:00Z',
      endDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      status: 'active',
      credentials: {
        email: 'service2@example.com',
        password: 'password456'
      }
    },
    {
      id: 'sub-3',
      userId: defaultCustomers[1].id,
      serviceId: products[2].id,
      startDate: '2023-10-10T00:00:00Z',
      endDate: new Date().toISOString(), // Today
      status: 'active',
      credentials: {
        email: 'service3@example.com',
        password: 'password789'
      }
    },
    {
      id: 'sub-4',
      userId: defaultCustomers[2].id,
      serviceId: products[0].id,
      startDate: '2023-07-20T00:00:00Z',
      endDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      status: 'expired',
      credentials: {
        email: 'expired@example.com',
        password: 'password999'
      }
    }
  ];
};
