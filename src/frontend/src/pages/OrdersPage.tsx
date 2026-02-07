import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RequireAuth from '../components/auth/RequireAuth';
import { useRouter } from '../hooks/useRouter';

export default function OrdersPage() {
  const { navigate } = useRouter();

  return (
    <RequireAuth>
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

        <div className="flex min-h-[50vh] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No orders yet</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-muted-foreground">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Button onClick={() => navigate('/')}>Start Shopping</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
