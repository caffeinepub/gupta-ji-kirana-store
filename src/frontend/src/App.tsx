import { useEffect } from 'react';
import { useActor } from './hooks/useActor';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import { useRouter } from './hooks/useRouter';

function App() {
  const { currentRoute, navigate } = useRouter();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  // Initialize demo data on first load
  useEffect(() => {
    if (actor && identity) {
      actor.initializeDemoData().catch(() => {
        // Demo data already loaded or user not admin, ignore
      });
    }
  }, [actor, identity]);

  const renderPage = () => {
    switch (currentRoute.path) {
      case '/':
      case '/shop':
        return <ShopPage />;
      case '/product':
        return <ProductDetailsPage productId={currentRoute.params.id} />;
      case '/cart':
        return <CartPage />;
      case '/checkout':
        return <CheckoutPage />;
      case '/order-confirmation':
        return <OrderConfirmationPage orderId={currentRoute.params.orderId} />;
      case '/orders':
        return <OrdersPage />;
      case '/admin':
        return <AdminPage />;
      default:
        return <ShopPage />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {renderPage()}
        </main>
        <Footer />
        <ProfileSetupDialog />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
