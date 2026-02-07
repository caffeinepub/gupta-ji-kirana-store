import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../../backend';
import { formatPrice } from '../../lib/money';
import { useCartStore } from '../../state/cart';
import { useRouter } from '../../hooks/useRouter';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { navigate } = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const displayPrice = product.hasDealPrice && product.dealPriceInPaise
    ? product.dealPriceInPaise
    : product.priceInPaise;

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={() => navigate('/product', { id: product.id.toString() })}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-2 text-4xl">🛒</div>
            <p className="text-xs text-muted-foreground">{product.name}</p>
          </div>
        </div>
        {!product.inStock && (
          <Badge variant="destructive" className="absolute right-2 top-2">
            Out of Stock
          </Badge>
        )}
        {product.hasDealPrice && product.inStock && (
          <Badge className="absolute left-2 top-2 bg-green-600">
            Deal
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 line-clamp-2 font-semibold">{product.name}</h3>
        <p className="mb-2 text-xs text-muted-foreground">{product.brand}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(displayPrice)}
          </span>
          {product.hasDealPrice && product.dealPriceInPaise && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.priceInPaise)}
            </span>
          )}
          <span className="text-xs text-muted-foreground">/ {product.unit}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
