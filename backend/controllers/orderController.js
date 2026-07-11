import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    couponCode
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items found');
  }

  // Deduct stock for each item ordered and check availability
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.title}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${product.title}. Only ${product.stock} left.`);
    }
    
    // Decrement stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    couponCode
  });

  const createdOrder = await order.save();

  // Clear user's cart in DB and save address to savedAddresses if unique
  const user = await User.findById(req.user._id);
  user.cart = [];
  
  const addressExists = user.savedAddresses.some(
    (addr) =>
      addr.address.toLowerCase() === shippingAddress.address.toLowerCase() &&
      addr.city.toLowerCase() === shippingAddress.city.toLowerCase() &&
      addr.postalCode.toLowerCase() === shippingAddress.postalCode.toLowerCase()
  );
  if (!addressExists) {
    user.savedAddresses.push(shippingAddress);
  }
  await user.save();

  // Print mock email notification
  console.log(`
================================================================================
[MAIL SERVICE MOCK] Order Confirmation Email Sent!
--------------------------------------------------------------------------------
To: ${req.user.email}
Subject: Thank you for your order! Reference: #${createdOrder._id}

Hello ${req.user.name},

Your order has been placed successfully. Here is your summary:
Order ID: #${createdOrder._id}
Payment Method: ${createdOrder.paymentMethod}
Items Price: $${createdOrder.itemsPrice.toFixed(2)}
GST (18%): $${createdOrder.taxPrice.toFixed(2)}
Shipping Price: $${createdOrder.shippingPrice.toFixed(2)}
Discount: -$${createdOrder.discountAmount.toFixed(2)}
Total Paid: $${createdOrder.totalPrice.toFixed(2)}

Delivery Address:
${createdOrder.shippingAddress.address}, ${createdOrder.shippingAddress.city}, ${createdOrder.shippingAddress.postalCode}, ${createdOrder.shippingAddress.country}

Items Ordered:
${createdOrder.orderItems.map(item => `- ${item.title} (x${item.quantity}) - $${item.price.toFixed(2)}`).join('\n')}

We will notify you once your order is confirmed and shipped!
================================================================================
  `);

  res.status(201).json(createdOrder);

  // Trigger notification
  try {
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed Successfully',
      message: `Your order #${createdOrder._id.toString().slice(-8).toUpperCase()} has been placed successfully.`,
      type: 'Order'
    });
  } catch (err) {
    console.error('Failed to trigger order placement notification:', err);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'brand title');

  if (order) {
    // Check if user is owner of the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied to view this order');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order payment status (Mock Payment)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Confirmed';
    order.paymentResult = {
      id: req.body.id || `MOCK_PAYMENT_${Date.now()}`,
      status: req.body.status || 'COMPLETED',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.email_address || req.user.email
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);

    // Trigger notification
    try {
      await Notification.create({
        user: order.user,
        title: 'Payment Confirmed',
        message: `Your payment of $${order.totalPrice.toFixed(2)} for order #${order._id.toString().slice(-8).toUpperCase()} was successful.`,
        type: 'Order'
      });
    } catch (err) {
      console.error('Failed to trigger payment notification:', err);
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order shipping status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'].includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }
    if (status === 'Cancelled' || status === 'Returned') {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);

    // Trigger notification
    try {
      await Notification.create({
        user: order.user,
        title: `Order Status: ${status}`,
        message: `Your order #${order._id.toString().slice(-8).toUpperCase()} is now: ${status}.`,
        type: 'Order'
      });
    } catch (err) {
      console.error('Failed to trigger status update notification:', err);
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get dashboard metrics & sales analytics (Admin only)
// @route   GET /api/orders/stats/dashboard
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  // 1. Core aggregates
  const orders = await Order.find({});
  const totalSales = orders.reduce((acc, order) => order.isPaid || order.paymentMethod === 'COD' ? acc + order.totalPrice : acc, 0);
  const totalOrders = orders.length;
  
  const usersCount = await User.countDocuments({ role: 'customer' });
  const productsCount = await Product.countDocuments({});

  // 2. Low stock alert (stock <= 5)
  const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
    .select('title stock price brand')
    .limit(10);

  // 3. Sales statistics by category
  const categories = await Category.find({});
  const categorySales = [];
  for (const cat of categories) {
    const productsInCat = await Product.find({ category: cat._id }).select('_id');
    const productIds = productsInCat.map(p => p._id);
    
    // Sum total price of orderItems matching these productIds in paid orders
    let catRevenue = 0;
    orders.forEach(order => {
      if (order.isPaid || order.status === 'Delivered') {
        order.orderItems.forEach(item => {
          if (productIds.some(id => id.toString() === item.product.toString())) {
            catRevenue += item.price * item.quantity;
          }
        });
      }
    });

    categorySales.push({
      category: cat.name,
      revenue: Math.round(catRevenue * 100) / 100
    });
  }

  // 4. Sales analytics over the last 7 days
  const salesHistory = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const dayOrders = orders.filter(o => 
      o.createdAt >= startOfDay && 
      o.createdAt <= endOfDay && 
      (o.isPaid || o.status === 'Delivered')
    );

    const daySales = dayOrders.reduce((acc, o) => acc + o.totalPrice, 0);

    salesHistory.push({
      day: dayName,
      sales: Math.round(daySales * 100) / 100,
      count: dayOrders.length
    });
  }

  res.json({
    metrics: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      usersCount,
      productsCount,
      lowStockCount: await Product.countDocuments({ stock: { $lte: 5 } })
    },
    lowStockProducts,
    categorySales,
    salesHistory
  });
});

// @desc    Cancel an order (Customer action)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (!['Order Placed', 'Confirmed'].includes(order.status)) {
      res.status(400);
      throw new Error('Order cannot be cancelled as it is already packed/shipped');
    }

    order.status = 'Cancelled';
    
    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);

    // Trigger notification
    try {
      await Notification.create({
        user: order.user,
        title: 'Order Cancelled',
        message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled successfully.`,
        type: 'Order'
      });
    } catch (err) {
      console.error('Failed to trigger cancellation notification:', err);
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Request a return/refund (Customer action)
// @route   PUT /api/orders/:id/return
// @access  Private
export const returnOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to return this order');
    }

    if (order.status !== 'Delivered') {
      res.status(400);
      throw new Error('Only delivered orders can be returned');
    }

    order.status = 'Returned';
    
    // Restore product stock on return approval
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);

    // Trigger notification
    try {
      await Notification.create({
        user: order.user,
        title: 'Return Request Filed',
        message: `A return request has been submitted for order #${order._id.toString().slice(-8).toUpperCase()}.`,
        type: 'Order'
      });
    } catch (err) {
      console.error('Failed to trigger return request notification:', err);
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
