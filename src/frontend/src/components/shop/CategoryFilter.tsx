import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetAllCategories } from '../../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { data: categories, isLoading } = useGetAllCategories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelectCategory(null)}
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id.toString()}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory(category.name)}
            className="gap-2"
          >
            {category.name}
            <Badge variant="secondary" className="ml-1">
              {category.productCount.toString()}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
