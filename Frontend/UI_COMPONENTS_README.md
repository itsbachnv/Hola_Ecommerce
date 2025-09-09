# E-commerce UI Components

Một hệ thống UI hoàn chỉnh cho ứng dụng thương mại điện tử được xây dựng với Next.js, TypeScript, và Tailwind CSS + shadcn/ui.

## 🚀 Tính năng chính

### 1. Guest / Customer Workflow

- **UC-BrowseCatalog**: Duyệt danh sách sản phẩm theo category/brand/search
- **UC-ViewProductDetail**: Xem chi tiết + biến thể (giá, tồn kho, hình ảnh)
- **UC-AddToCart**: Thêm sản phẩm vào giỏ
- **UC-UpdateCart**: Thay đổi số lượng / xóa item trong giỏ
- **UC-Checkout**: Điền thông tin giao hàng, chọn phương thức thanh toán
- **UC-TrackOrder**: Xem trạng thái đơn hàng

### 2. Admin Workflow

- **UC-CRUDProduct**: Quản lý sản phẩm (tạo, sửa, xóa, cập nhật trạng thái)
- **UC-ManageOrders**: Xem danh sách đơn, lọc/truy vấn theo trạng thái
- **UC-FulfillOrder**: Xác nhận đơn, chuyển trạng thái
- **UC-ShipOrder**: Nhập tracking, set trạng thái Shipped
- **UC-DeliverOrder**: Đánh dấu đã giao hàng
- **UC-ViewDashboard**: Xem KPI (doanh thu, AOV, đơn theo trạng thái)

### 3. Staff Workflow

- **UC-SearchOrder**: Tra cứu đơn theo mã
- **UC-UpdateTracking**: Cập nhật trạng thái vận chuyển

## 📁 Cấu trúc thành phần

```
src/
├── components/
│   ├── ui/                     # UI components cơ bản (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── tabs.tsx
│   ├── layout/                 # Layout components
│   │   └── AdminLayout.tsx     # Layout chính với sidebar
│   ├── catalog/                # Components cho catalog
│   │   └── ProductCatalog.tsx  # Danh sách sản phẩm với filter
│   ├── product/                # Components cho sản phẩm
│   │   └── ProductDetail.tsx   # Chi tiết sản phẩm
│   ├── cart/                   # Components cho giỏ hàng
│   │   └── ShoppingCart.tsx    # Giỏ hàng sidebar
│   ├── checkout/               # Components cho thanh toán
│   │   └── Checkout.tsx        # Multi-step checkout
│   ├── orders/                 # Components cho đơn hàng
│   │   └── OrderTracking.tsx   # Theo dõi đơn hàng
│   ├── admin/                  # Components cho admin
│   │   ├── Dashboard.tsx       # Trang dashboard
│   │   ├── ProductManagement.tsx # Quản lý sản phẩm
│   │   └── OrderManagement.tsx # Quản lý đơn hàng
│   └── MainApp.tsx            # App chính tích hợp tất cả
├── stores/                    # Zustand stores
│   ├── auth.ts               # Auth store
│   └── cart.ts               # Cart store
├── types/                    # TypeScript types
│   └── index.ts              # Tất cả types
└── lib/
    └── utils.ts              # Utility functions
```

## 🎨 Components có thể tái sử dụng

### UI Components Cơ bản

- `Button`: Button với nhiều variants (primary, outline, ghost, danger)
- `Card`: Card container với header, content, footer
- `Input`: Input field với validation styling
- `Dialog`: Modal/dialog component
- `Tabs`: Tab navigation component

### Layout Components

- `AdminLayout`: Layout chính với sidebar responsive, navigation, search bar
- `MiniCart`: Icon giỏ hàng mini hiển thị số lượng và tổng tiền

### Business Components

- `ProductCatalog`: Catalog với search, filter, grid/list view
- `ProductDetail`: Trang chi tiết sản phẩm với variants, quantity selector
- `ShoppingCart`: Sidebar giỏ hàng với update quantity, remove items
- `Checkout`: Multi-step checkout (shipping → payment → review)
- `OrderTracking`: Tracking đơn hàng với timeline, search
- `Dashboard`: Dashboard admin với KPI cards, charts
- `ProductManagement`: CRUD sản phẩm với table, modal forms
- `OrderManagement`: Quản lý đơn hàng với status updates

## 🛠️ Cách sử dụng

### 1. Cài đặt dependencies

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip class-variance-authority lucide-react tailwind-merge @hookform/resolvers react-hook-form zod @tanstack/react-table zustand
```

### 2. Cấu hình Tailwind CSS

File `tailwind.config.js` đã được cấu hình với các CSS variables cho shadcn/ui.

### 3. Import và sử dụng components

```tsx
import AdminLayout from "@/components/layout/AdminLayout";
import ProductCatalog from "@/components/catalog/ProductCatalog";
import { useCartStore } from "@/stores/cart";

export default function ShopPage() {
  const { addItem } = useCartStore();

  return (
    <AdminLayout>
      <ProductCatalog
        products={products}
        categories={categories}
        onProductClick={(product) => {
          // Navigate to product detail
        }}
        onAddToCart={(product, variantId) => {
          const variant = product.variants.find((v) => v.id === variantId);
          if (variant) {
            addItem(product, variant);
          }
        }}
      />
    </AdminLayout>
  );
}
```

### 4. Sử dụng stores

```tsx
// Auth store
import { useAuth } from "@/stores/auth";

const { user, isAdmin, login, logout } = useAuth();

// Cart store
import { useCartStore } from "@/stores/cart";

const { cart, addItem, removeItem, getTotal } = useCartStore();
```

## 🎯 Role-based Access

Components tự động điều chỉnh theo role của user:

- **Admin**: Truy cập full dashboard, product management, order management
- **Staff**: Truy cập dashboard, order management (hạn chế)
- **Customer**: Truy cập shop, cart, checkout, order tracking

## 📱 Responsive Design

Tất cả components được thiết kế responsive:

- Mobile-first approach
- Collapsible sidebar cho mobile
- Grid layouts tự động điều chỉnh
- Touch-friendly interactions

## 🔧 Customization

### Themes

CSS variables trong `globals.css` có thể được tùy chỉnh để thay đổi color scheme.

### Components

Mỗi component được thiết kế modular, có thể dễ dàng extend hoặc customize.

### Variants

Sử dụng `class-variance-authority` để tạo component variants có thể tái sử dụng.

## 🚀 Triển khai

1. Build project: `npm run build`
2. Start production: `npm start`
3. Hoặc deploy lên Vercel/Netlify

## 📈 Performance

- Components được tối ưu với React best practices
- Lazy loading cho images
- Memoization cho expensive calculations
- Zustand cho state management hiệu quả

## 🔮 Mở rộng

Cấu trúc được thiết kế để dễ dàng thêm:

- Chat bot integration
- Payment gateway integration
- Inventory management
- Analytics tracking
- Multi-language support
- PWA capabilities

## 📝 Notes

- Mock data được sử dụng trong demo, cần thay thế bằng API calls thực tế
- Error handling và loading states có thể được mở rộng
- Testing components với Jest/React Testing Library
- Storybook có thể được thêm để document components
