import { useState } from 'react';
import { Shield, Package, FolderTree, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdminGuard from '../components/admin/AdminGuard';
import ProductsAdminView from '../components/admin/ProductsAdminView';
import CategoriesAdminView from '../components/admin/CategoriesAdminView';

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="container py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your store inventory and orders</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsAdminView />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesAdminView />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  );
}
