import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/lib/types";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/lib/api";
import { Loader2 } from "lucide-react";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [
    { isPending, isResolved, isRejected },
    dispatch,
  ] = usePayPalScriptReducer();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to checkout.",
        variant: "destructive",
      });
      navigate("/login");
    }

    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add items to your cart to continue.",
        variant: "destructive",
      });
      navigate("/");
    }

    if (cartItems.length === 1) {
      setSelectedService(cartItems[0]);
    }
  }, [user, navigate, cartItems, toast]);

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleTermsCheck = (checked: boolean) => {
    setIsTermsChecked(checked);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const mutation = useMutation({
    mutationFn: async (orderData: Order) => {
      setIsSubmitting(true);
      return createOrder(orderData);
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast({
        title: "Order Created",
        description: "Your order has been successfully placed.",
      });
      clearCart();
      navigate(`/order-confirmation/${data.id}`);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: error.message || "Failed to create order.",
        variant: "destructive",
      });
    },
  });

  const createPayPalOrder = (data: any, actions: any) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalPrice.toFixed(2),
            },
          },
        ],
      })
      .then((orderID: any) => {
        return orderID;
      });
  };

  const onPayPalApprove = (data: any, actions: any) => {
    return actions.order.capture().then(async (details: any) => {
      const orderData: Order = {
        id: `order-${Date.now()}`,
        userId: user?.id || "guest",
        products: cartItems.map((item) => ({
          productId: item.id,
          quantity: 1,
          price: item.price,
        })),
        total: totalPrice,
        status: "pending",
        createdAt: new Date().toISOString(),
        paymentMethod: "paypal",
        serviceName: selectedService.name,
        notes: additionalNotes,
      };

      mutation.mutate(orderData);
    });
  };

  const onPayPalError = (err: any) => {
    toast({
      title: "Payment Error",
      description: err.message || "There was an error processing your payment.",
      variant: "destructive",
    });
  };

  const handleManualCheckout = async () => {
    if (!isTermsChecked) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    const orderData: Order = {
      id: `order-${Date.now()}`,
      userId: user?.id || "guest",
      products: cartItems.map((item) => ({
        productId: item.id,
        quantity: 1,
        price: item.price,
      })),
      total: totalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethod,
      serviceName: selectedService.name,
      notes: additionalNotes,
    };

    mutation.mutate(orderData);
  };

  const initialPayPalOptions = {
    "clientId": process.env.PAYPAL_CLIENT_ID || "test",
    "currency": "USD",
    "intent": "capture",
    "components": "buttons"
  };

  const handlePaypalApprove = (data: any, actions: any) => {
    return actions.order.capture().then(async (details: any) => {
      if (details.status === 'COMPLETED') {
      }
    });
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Order Summary</h3>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Payment Method</h3>
              <Select onValueChange={handlePaymentMethodChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="usdt">USDT</SelectItem>
                  <SelectItem value="wish_money">Wish Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes for your order?"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              onCheckedChange={handleTermsCheck}
              checked={isTermsChecked}
            />
            <Label htmlFor="terms">
              I agree to the{" "}
              <a href="/terms" className="text-blue-500 underline">
                Terms and Conditions
              </a>
            </Label>
          </div>

          {paymentMethod === "paypal" ? (
            <PayPalButtons
              createOrder={createPayPalOrder}
              onApprove={onPayPalApprove}
              onError={onPayPalError}
              disabled={!isTermsChecked}
            />
          ) : (
            <Button
              className="w-full"
              onClick={handleManualCheckout}
              disabled={!isTermsChecked || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;
