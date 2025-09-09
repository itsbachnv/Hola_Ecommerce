# Enhanced Product API Integration

This document explains how to use the enhanced product management system with your API endpoint.

## API Endpoint

Your API endpoint: `https://localhost:5000/products?search=%C3%81o%20thun%20c%E1%BB%95%20tr%C3%B2n&brandId=1&categoryId=1&status=ACTIVE&page=1&pageSize=20`

## Enhanced Features

### 1. Product Hooks (`useProduct.ts`)

#### `useProducts` Hook

```typescript
import { useProducts } from "@/hooks/useProduct";

const {
  data: products, // Array of products
  loading, // Loading state
  error, // Error message if any
  pagination, // Pagination info
  refetch, // Function to refetch data
  setFilters, // Function to update filters
} = useProducts({
  status: "ACTIVE",
  page: 1,
  pageSize: 20,
});
```

#### Supported Filters:

- `search`: Text search (Vietnamese supported: "Áo thun cổ tròn")
- `brandId`: Filter by brand ID
- `categoryId`: Filter by category ID
- `status`: 'ACTIVE' or 'INACTIVE'
- `page`: Page number (1-based)
- `pageSize`: Number of items per page

#### `useProduct` Hook (Single Product)

```typescript
const { product, loading, error, refetch } = useProduct(productSlug);
```

#### `useProductMutations` Hook (CRUD Operations)

```typescript
const {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  loading,
  error,
} = useProductMutations();
```

### 2. API Client (`api-client.ts`)

#### Product API Methods:

```typescript
import { productApi } from "@/lib/api-client";

// Get products with filters
const products = await productApi.getProducts({
  search: "Áo thun cổ tròn",
  brandId: "1",
  categoryId: "1",
  status: "ACTIVE",
  page: 1,
  pageSize: 20,
});

// Get single product
const product = await productApi.getProduct(productId);

// Create product
const newProduct = await productApi.createProduct(productData);

// Update product
const updatedProduct = await productApi.updateProduct(productId, productData);

// Delete product
await productApi.deleteProduct(productId);

// Toggle product status
const toggledProduct = await productApi.toggleProductStatus(productId, true);
```

#### Category API Methods:

```typescript
import { categoryApi } from "@/lib/api-client";

const categories = await categoryApi.getCategories();
const category = await categoryApi.getCategory(categoryId);
const newCategory = await categoryApi.createCategory(categoryData);
const updatedCategory = await categoryApi.updateCategory(
  categoryId,
  categoryData
);
await categoryApi.deleteCategory(categoryId);
```

### 3. Enhanced Product Management Component

```typescript
import ProductManagementPage from "@/components/admin/ProductManagementExample";

// Usage with categories
<ProductManagementPage categories={categories} />;
```

Features:

- Real-time search with debouncing
- Advanced filtering by brand, category, status
- Pagination with customizable page size
- CRUD operations with loading states
- Error handling and retry functionality
- Vietnamese text support

### 4. Testing the API

```typescript
import { testApiEndpoints } from "@/lib/api-client";

// Test your API endpoint
const result = await testApiEndpoints();
console.log(result);
```

## Usage Example

```typescript
"use client";

import { useEffect } from "react";
import { useProducts } from "@/hooks/useProduct";

export default function ProductList() {
  const { data: products, loading, setFilters } = useProducts();

  // Search for "Áo thun cổ tròn" with filters
  useEffect(() => {
    setFilters({
      search: "Áo thun cổ tròn",
      brandId: "1",
      categoryId: "1",
      status: "ACTIVE",
      page: 1,
      pageSize: 20,
    });
  }, [setFilters]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## Environment Configuration

Make sure to set your API base URL in your environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:5000
```

## Type Safety

All API calls are fully typed with TypeScript interfaces defined in `@/types`. This ensures:

- IntelliSense support
- Compile-time error checking
- Better developer experience
- Consistent data structures

## Error Handling

The enhanced hooks include comprehensive error handling:

- Network errors
- HTTP errors (4xx, 5xx)
- Timeout handling (10 seconds default)
- User-friendly error messages
- Retry functionality
