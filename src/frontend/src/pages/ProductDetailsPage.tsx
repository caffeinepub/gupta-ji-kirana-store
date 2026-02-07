import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetProduct } from '../hooks/useQueries';
import { useRouter } from '../hooks/useRouter';
import { useCartStore } from '../state/cart';
import { formatPrice } from '../lib/money';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductDetailsPageProps {
  productId?: string;
}

export default function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const { navigate } = useRouter();
  const { data: product, isLoading } = useGetProduct(productId);
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-10 w-32" />
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Product not found</h2>
          <p className="mb-4 text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const displayPrice = product.hasDealPrice && product.dealPriceInPaise
    ? product.dealPriceInPaise
    : product.priceInPaise;

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <Card className="overflow-hidden">
          <div className="relative aspect-square bg-muted">
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <div className="mb-4 text-8xl">🛒</div>
                <p className="text-muted-foreground">{product.name}</p>
              </div>
            </div>
            {!product.inStock && (
              <Badge variant="destructive" className="absolute right-4 top-4">
                Out of Stock
              </Badge>
            )}
            {product.hasDealPrice && product.inStock && (
              <Badge className="absolute left-4 top-4 bg-green-600">
                Special Deal
              </Badge>
            )}
          </div>
        </Card>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(displayPrice)}
            </span>
            {product.hasDealPrice && product.dealPriceInPaise && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.priceInPaise)}
              </span>
            )}
            <span className="text-muted-foreground">/ {product.unit}</span>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Volume</p>
              <p className="font-medium">{product.volume}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock</p>
              <p className="font-medium">{product.stock.toString()} available</p>
            </div>
          </div>

          {product.categories.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Categories</p>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category, index) => (
                  <Badge key={index} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.inStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(Number(product.stock), quantity + 1))}
                  disabled={!product.inStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              size="lg"
              className="w-full"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
