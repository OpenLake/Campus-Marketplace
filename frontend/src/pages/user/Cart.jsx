import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  Truck, 
  Shield, 
  ChevronRight, 
  Heart, 
  Clock, 
  Gift, 
  BookOpen,
  Home,
  Bike,
  Percent,
  ArrowLeft,
  Sparkles,
  Store,
  Info
} from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
 
const CartPage = ({ user }) => {
  // Mock cart data with campus-specific items
  const [cartItems, setCartItems] = useState([
    { 
      id: 1, 
      name: 'Introduction to Algorithms', 
      author: 'Thomas H. Cormen',
      condition: 'Like New',
      price: 45.00, 
      originalPrice: 89.99,
      quantity: 1, 
      seller: 'Rahul K. (CSE 2024)',
      image: '/api/placeholder/100/120',
      category: 'Textbook',
      saved: 44.99
    },
    { 
      id: 2, 
      name: 'Dorm Study Lamp', 
      color: 'Black',
      condition: 'Good',
      price: 25.00,
      originalPrice: 49.99,
      quantity: 2, 
      seller: 'Anjali P. (ME 2023)',
      image: '/api/placeholder/100/120',
      category: 'Electronics',
      saved: 24.99
    },
    { 
      id: 3, 
      name: 'Campus Hoodie', 
      size: 'L',
      color: 'Navy Blue',
      condition: 'New with tags',
      price: 35.00,
      originalPrice: 59.99,
      quantity: 1, 
      seller: 'Campus Store',
      image: '/api/placeholder/100/120',
      category: 'Apparel',
      saved: 24.99
    },
    { 
      id: 4, 
      name: 'Hero Bicycle', 
      color: 'Red',
      condition: 'Good',
      price: 120.00,
      originalPrice: 249.99,
      quantity: 1, 
      seller: 'Vikram S. (PhD)',
      image: '/api/placeholder/100/120',
      category: 'Bicycle',
      saved: 129.99
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedItems, setSelectedItems] = useState([1, 2, 3, 4]); // All selected by default

  // Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price * item.quantity), 
    0
  );
  
  const totalSavings = cartItems.reduce(
    (acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 
    0
  );
  
  const shipping = subtotal > 100 ? 0 : 15;
  const campusFee = 2.50;
  const total = subtotal + shipping + campusFee;

  // Handle quantity changes
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
    setSelectedItems(items => items.filter(itemId => itemId !== id));
  };

  // Toggle item selection
  const toggleItemSelection = (id) => {
    setSelectedItems(current =>
      current.includes(id)
        ? current.filter(itemId => itemId !== id)
        : [...current, id]
    );
  };

  // Select all items
  const selectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  // Apply promo code
  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'FIRST10') {
      setAppliedPromo({ code: 'FIRST10', discount: 10 });
    } else if (promoCode.toUpperCase() === 'STUDENT') {
      setAppliedPromo({ code: 'STUDENT', discount: 15 });
    } else {
      alert('Invalid promo code');
    }
  };

  const selectedCount = selectedItems.length;
  const selectedSubtotal = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const breadcrumbItems = [
    { label: "Cart", link: "/cart" },
    { label: `${cartItems.length} items` }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
     
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header with Progress */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="text-emerald-600" size={32} />
            Your Campus Cart
          </h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <span className="ml-2 text-sm font-bold text-gray-900 hidden sm:inline">Cart</span>
            </div>
            <div className="w-12 h-0.5 bg-emerald-600"></div>
            <div className="flex items-center">
              <span className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <span className="ml-2 text-sm text-gray-500 hidden sm:inline">Checkout</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <span className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <span className="ml-2 text-sm text-gray-500 hidden sm:inline">Complete</span>
            </div>
          </div>
        </div>

        {/* Main Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-8">
            {/* Cart Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onChange={selectAll}
                    className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({cartItems.length} items)
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <button 
                  onClick={() => setSelectedItems(cartItems.map(item => item.id))}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Select All
                </button>
                <button 
                  onClick={() => setSelectedItems([])}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Checkbox */}
                    <div className="flex items-start pt-2">
                      <input 
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="w-24 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                      {item.category === 'Textbook' && (
                        <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 text-center">
                          {item.category}
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                          {item.author && (
                            <p className="text-sm text-gray-500">by {item.author}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            {item.color && (
                              <span className="text-gray-600">Color: {item.color}</span>
                            )}
                            {item.size && (
                              <span className="text-gray-600">Size: {item.size}</span>
                            )}
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Tag size={14} />
                              {item.condition}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Store size={12} />
                            Seller: {item.seller}
                          </p>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <span className="font-bold text-xl text-gray-900">
                            ${item.price.toFixed(2)}
                          </span>
                          <p className="text-xs text-gray-400 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-emerald-600 font-bold mt-1">
                            Save ${item.saved.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-1.5 font-medium text-gray-900 border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors text-sm"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                          
                          <button className="flex items-center gap-1 text-gray-400 hover:text-emerald-600 transition-colors text-sm">
                            <Heart size={16} />
                            Save for later
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="font-bold text-emerald-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Campus Pickup Notice */}
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <Truck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900">Campus Delivery Available</h4>
                <p className="text-sm text-gray-600">
                  All items can be delivered to IIT Bhilai campus. Free shipping on orders over $100.
                </p>
              </div>
            </div>

            {/* Continue Shopping */}
            <Link 
              to="/listings" 
              className="inline-flex items-center gap-2 mt-6 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({selectedCount} items)</span>
                  <span className="font-medium text-gray-900">${selectedSubtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Campus Safety Fee</span>
                  <span className="font-medium text-gray-900">${campusFee.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-${appliedPromo.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Total Savings</span>
                  <span className="font-bold text-emerald-600">-${totalSavings.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-2xl font-bold mb-6">
                <span className="text-gray-900">Total</span>
                <span className="text-emerald-600">
                  ${(selectedSubtotal + shipping + campusFee - (appliedPromo?.discount || 0)).toFixed(2)}
                </span>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus Promo Code
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code" 
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <button 
                    onClick={applyPromo}
                    className="px-4 py-3 bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-main)] font-medium rounded-lg hover:bg-[var(--surface-hover)] transition"
                  >
                    Apply
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Gift size={12} className="text-emerald-600" />
                    FIRST10 - 10% off your first purchase
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Percent size={12} className="text-emerald-600" />
                    STUDENT - 15% off on textbooks
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout">
                <button 
                  disabled={selectedCount === 0}
                  className={`w-full font-bold py-4 rounded-lg transition flex items-center justify-center gap-2 ${
                    selectedCount > 0 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Checkout
                  <ChevronRight size={18} />
                </button>
              </Link>

              {/* Security Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={14} className="text-emerald-600" />
                  Secure campus payment
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={14} className="text-emerald-600" />
                  Delivery in 2-3 days
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles size={14} className="text-emerald-600" />
                  Verified IIT Bhilai sellers
                </div>
              </div>

              {/* Recommended Categories */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Popular on Campus</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/cat/textbooks" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition">
                    <BookOpen size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium">Textbooks</span>
                  </Link>
                  <Link to="/cat/furniture" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition">
                    <Home size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium">Furniture</span>
                  </Link>
                  <Link to="/cat/electronics" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition">
                    <ShoppingBag size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium">Electronics</span>
                  </Link>
                  <Link to="/cat/bicycles" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition">
                    <Bike size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium">Bicycles</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State - Show when cart is empty */}
        {cartItems.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any campus goodies yet</p>
            <Link 
              to="/listings"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-emerald-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </main>
 
    </div>
  );
};

export default CartPage;