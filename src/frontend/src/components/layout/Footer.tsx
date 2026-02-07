import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-primary">Gupta ji kirana store</h3>
            <p className="text-sm text-muted-foreground">Your neighborhood grocery shop</p>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            © 2026. Built with <Heart className="inline h-4 w-4 fill-red-500 text-red-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
