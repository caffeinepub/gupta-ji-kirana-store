import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from '../hooks/useRouter';

interface OrderConfirmationPageProps {
  orderId?: string;
}

export default function OrderConfirmationPage({ orderId }: OrderConfirmationPageProps) {
  const { navigate } = useRouter();

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-1 text-sm text-muted-foreground">Order ID</p>
            <p className="text-2xl font-bold text-primary">#{orderId || 'N/A'}</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-4 w-4" />
              <span>Your order has been received and is being processed</span>
            </div>
            <p>We'll contact you shortly to confirm delivery details</p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => navigate('/orders')} size="lg">
              View My Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
