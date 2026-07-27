import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, CreditCard, Wallet, ChevronLeft, Lock, 
  MapPin, Home, Phone, Mail, User, Truck, Shield,
  Edit, BookOpen, Bike, Coffee
} from 'lucide-react';
import siteLogo from '../../assets/site_logo.png';

const CheckoutPage = () => {
  const [shippingMethod, setShippingMethod] = useState('free');
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Mock cart data
  const cartItems = [
    { id: 1, name: 'Introduction to Algorithms', author: 'Cormen', price: 45.00, quantity: 1, image: '/api/placeholder/80/80' },
    { id: 2, name: 'Dorm Desk Lamp', color: 'Black', price: 25.00, quantity: 1, image: '/api/placeholder/80/80' },
    { id: 3, name: 'Campus Hoodie', size: 'L', price: 35.00, quantity: 2, image: '/api/placeholder/80/80' },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = shippingMethod === 'express' ? 15 : shippingMethod === 'pickup' ? 5 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header - Simplified for checkout */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/cart" className="text-gray-600 hover:text-emerald-600 flex items-center gap-2">
                <ChevronLeft size={20} />
                <span>Back to Cart</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <img src={siteLogo} alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg hidden sm:block">Campus Marketplace</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield size={16} className="text-emerald-600" />
              <span className="text-gray-600 hidden sm:block">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-12">
          <div className="flex items-center flex-1">
            <div className="flex items-center text-emerald-600">
              <CheckCircle2 size={24} className="fill-emerald-50" />
              <span className="ml-2 text-sm font-medium hidden sm:inline">Cart</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-emerald-600"></div>
          </div>
          <div className="flex items-center flex-1">
            <div className="flex items-center">
              <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <span className="ml-2 text-sm font-bold text-gray-900 hidden sm:inline">Details</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-gray-300"></div>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">3</span>
            <span className="ml-2 text-sm font-medium text-gray-500 hidden sm:inline">Complete</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                <span className="text-xs text-gray-500">IIT Bhilai Students Only</span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="John" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Doe" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="john.doe@iitbhilai.ac.in" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Use your institute email ID</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                <MapPin size={20} className="text-emerald-600" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hostel / Building Name</label>
                  <div className="relative">
                    <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="e.g., Hostel B, Room 402" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street / Campus Area</label>
                  <input 
                    type="text" 
                    placeholder="IIT Bhilai, GEC Campus" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      value="Raipur" 
                      readOnly 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input 
                      type="text" 
                      placeholder="492015" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="differentBilling" 
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="differentBilling" className="text-sm text-gray-600">
                    Use a different address for billing (optional)
                  </label>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Shipping Method</h2>
                <Truck size={20} className="text-emerald-600" />
              </div>

              <div className="space-y-3">
                <label 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    shippingMethod === 'free' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="free"
                      checked={shippingMethod === 'free'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Free Campus Delivery</span>
                      <p className="text-xs text-gray-500 mt-1">Delivered to your hostel room (3-5 days)</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">$0.00</span>
                </label>

                <label 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    shippingMethod === 'express' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Express Delivery</span>
                      <p className="text-xs text-gray-500 mt-1">Priority handling (1-2 days)</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">$15.00</span>
                </label>

                <label 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    shippingMethod === 'pickup' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="pickup"
                      checked={shippingMethod === 'pickup'}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Campus Pickup Point</span>
                      <p className="text-xs text-gray-500 mt-1">Pick up from Central Library (24h)</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">$5.00</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                <CreditCard size={20} className="text-emerald-600" />
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <label 
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <CreditCard size={20} className="text-gray-600" />
                    <span className="font-medium text-gray-900">Credit / Debit Card</span>
                  </label>

                  <label 
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'upi' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment" 
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Wallet size={20} className="text-gray-600" />
                    <span className="font-medium text-gray-900">UPI / Wallet</span>
                  </label>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input 
                          type="text" 
                          placeholder="123" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="username@okhdfcbank" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.author && `by ${item.author}`}
                        {item.color && `Color: ${item.color}`}
                        {item.size && `Size: ${item.size}`}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Campus Discount</span>
                  <span className="font-medium text-emerald-600">-$5.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-emerald-600">${(total - 5).toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <button className="px-4 py-2 bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-main)] font-medium rounded-lg hover:bg-[var(--surface-hover)] transition">
                    Apply
                  </button>
                </div>
              </div>

              {/* Applied Promo Example */}
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">FIRST10</span>
                </div>
                <button className="text-xs text-gray-500 hover:text-red-500">Remove</button>
              </div>

              {/* Place Order Button */}
              <button className="w-full mt-6 bg-emerald-600 text-white font-bold py-4 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                <Lock size={18} />
                Place Order • ${(total - 5).toFixed(2)}
              </button>

              {/* Security Notice */}
              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                <Shield size={14} className="text-emerald-600" />
                Secure payment powered by campus partners
              </p>

              {/* Campus Pickup Notice */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <Truck size={14} />
                  Delivery to IIT Bhilai campus only. Student ID required at pickup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;