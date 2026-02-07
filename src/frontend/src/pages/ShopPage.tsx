import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductCard from '../components/shop/ProductCard';
import CategoryFilter from '../components/shop/CategoryFilter';
import { useGetAllProducts, useGetProductsByCategory } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: allProducts, isLoading: allLoading } = useGetAllProducts();
  const { data: categoryProducts, isLoading: categoryLoading } = useGetProductsByCategory(selectedCategory || undefined);

  const products = selectedCategory ? categoryProducts : allProducts;
  const isLoading = selectedCategory ? categoryLoading : allLoading;

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-orange-500">
        <div className="container relative z-10 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="text-white">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                Welcome to Gupta ji kirana store
              </h1>
              <p className="mb-6 text-lg opacity-90">
                Your trusted neighborhood grocery shop. Fresh products, great prices, delivered with care.
              </p>
            </div>
            <div className="hidden md:block">
              <img
                src="/assets/generated/kirana-hero-banner.dim_1600x600.png"
                alt="Kirana Store"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
