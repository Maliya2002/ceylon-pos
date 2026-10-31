import React, { useState, useEffect } from 'react';
import { Search, Flame, Utensils, Coffee, Moon, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import CartSummary from './CartSummary';
import VariantModal from './VariantModal';
import CheckoutModal from './CheckoutModal';
import ReceiptPrint from './ReceiptPrint';
import KotPrint from './KotPrint';
import { api } from '../api';

export default function PosTerminal({ tables, onRefreshTables, initialTableId, existingOrder, onClearTargetTable }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState(initialTableId ? 'DINE_IN' : 'TAKEAWAY');
  const [selectedTable, setSelectedTable] = useState(initialTableId || '');
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'fixed'
  const [discountValue, setDiscountValue] = useState(0);
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);

  // Modals
  const [activeProductForVariant, setActiveProductForVariant] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [kotOrder, setKotOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialTableId) {
      setSelectedTable(initialTableId);
      setOrderType('DINE_IN');
    }
  }, [initialTableId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // If product has more than 1 variant, or has customize notes, open modal
    if (product.variants && product.variants.length > 1) {
      setActiveProductForVariant(product);
    } else {
      // Direct add to cart
      const variant = product.variants && product.variants.length === 1 ? product.variants[0] : null;
      addToCart({
        productId: product.id,
        name: product.name,
        variantName: variant ? variant.name : 'Regular',
        quantity: 1,
        unitPrice: variant ? variant.price : product.basePrice,
        notes: '',
      });
    }
  };

  const addToCart = (newItem) => {
    setCart((prev) => {
      // Check if identical item (same productId, variant, notes) already exists
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.variantName === newItem.variantName &&
          i.notes === newItem.notes
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
    } else {
      setCart((prev) => {
        const updated = [...prev];
        updated[index].quantity = newQty;
        return updated;
      });
    }
  };

  const handleRemoveItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setServiceChargeEnabled(false);
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === 'ALL' || p.categoryId === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.variants && p.variants.some((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Calculate current grand total
  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  let discountAmount = 0;
  if (discountValue > 0) {
    discountAmount = discountType === 'percent' ? (subTotal * discountValue) / 100 : discountValue;
  }
  const serviceChargeAmount =
    orderType === 'DINE_IN' && serviceChargeEnabled ? (subTotal - discountAmount) * 0.1 : 0;
  const currentGrandTotal = Math.max(0, subTotal - discountAmount + serviceChargeAmount);

  // Trigger KOT print preview
  const handlePrintKot = () => {
    if (cart.length === 0) return;
    const assignedTable = tables.find((t) => t.id === selectedTable);
    const mockOrder = {
      orderNumber: Math.floor(1000 + Math.random() * 9000),
      orderType,
      table: assignedTable,
      items: cart,
      createdAt: new Date().toISOString(),
      user: api.getCurrentUser(),
      notes: orderType === 'DINE_IN' ? `Table ${assignedTable?.number || ''}` : 'Takeaway order',
    };
    setKotOrder(mockOrder);
  };

  // Complete checkout handler
  const handleConfirmCheckout = async ({ paymentMethod, tenderedAmount, changeAmount }) => {
    if (orderType === 'DINE_IN' && !selectedTable) {
      alert('Please select a dining table for Dine-In orders!');
      return;
    }

    const assignedTable = tables.find((t) => t.id === selectedTable);

    // 1. Create order on backend
    const createdOrder = await api.createOrder({
      orderType,
      tableId: orderType === 'DINE_IN' ? selectedTable : null,
      items: cart,
      discount: discountAmount,
      tax: serviceChargeAmount,
      paymentMethod,
      isPaid: true,
      notes: orderType === 'DINE_IN' ? `Table ${assignedTable?.number || ''}` : 'Counter Takeaway',
    });

    // 2. Refresh tables status
    onRefreshTables();

    // 3. Set Receipt info for thermal print
    setReceiptOrder(createdOrder);
    setCheckoutInfo({ tenderedAmount, changeAmount });

    // 4. Close checkout modal and reset cart
    setIsCheckoutOpen(false);
    handleClearCart();
    setSelectedTable('');
  };

  const handleAppendItemsToTable = async () => {
    if (cart.length === 0 || !existingOrder) return;
    try {
      const assignedTable = tables.find((t) => t.id === selectedTable);
      const res = await api.addItemsToOrder(
        existingOrder.id,
        cart,
        `Table ${assignedTable?.number || ''} extra items`
      );
      onRefreshTables();

      // Trigger KOT print for the newly added items
      setKotOrder({
        orderNumber: existingOrder.orderNumber,
        orderType: 'DINE_IN',
        table: assignedTable,
        items: cart,
        createdAt: new Date().toISOString(),
        user: api.getCurrentUser(),
        notes: `ADDITIONAL KOT for Table ${assignedTable?.number || ''}`,
      });

      handleClearCart();
      if (onClearTargetTable) onClearTargetTable();
      alert(`Successfully added items to Table ${assignedTable?.number || ''}! KOT slip is ready to print.`);
    } catch (err) {
      alert('Failed to add items to table: ' + err.message);
    }
  };

  const selectedTableName = tables.find((t) => t.id === selectedTable)?.number || '';

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT PANEL: Menu & Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">
        {/* Search & Category Filter Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Rice & Curry, Kottu, Short Eats, Faluda..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('ALL')}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 ${
                selectedCategoryId === 'ALL'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              All Menu
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition active:scale-95 ${
                  selectedCategoryId === cat.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <p className="text-base font-semibold">No food items found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for something else</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Active Cart / Bill Summary */}
      <div className="w-80 md:w-96 shrink-0 h-full">
        <CartSummary
          cart={cart}
          orderType={orderType}
          setOrderType={setOrderType}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          tables={tables}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          serviceChargeEnabled={serviceChargeEnabled}
          setServiceChargeEnabled={setServiceChargeEnabled}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onPrintKotPreview={handlePrintKot}
          existingOrder={existingOrder}
          onAppendItemsToTable={handleAppendItemsToTable}
        />
      </div>

      {/* MODALS */}
      <VariantModal
        product={activeProductForVariant}
        isOpen={Boolean(activeProductForVariant)}
        onClose={() => setActiveProductForVariant(null)}
        onAddToCart={addToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={currentGrandTotal}
        orderType={orderType}
        tableName={selectedTableName}
        onConfirmCheckout={handleConfirmCheckout}
      />

      <ReceiptPrint
        order={receiptOrder}
        checkoutInfo={checkoutInfo}
        onClose={() => setReceiptOrder(null)}
      />

      <KotPrint
        order={kotOrder}
        onClose={() => setKotOrder(null)}
      />
    </div>
  );
}
