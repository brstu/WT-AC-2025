const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({ 
      data: cart,
      total 
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Get user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true }
    });

    if (!cart) {
      // Create cart if it doesn't exist
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id
        },
        include: { items: true }
      });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true }
      });

      return res.json({
        message: 'Item quantity updated in cart',
        data: updatedItem
      });
    }

    // Add new item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Item added to cart',
      data: cartItem
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        cart: true,
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check if user owns this cart
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { id: parseInt(id) }
      });

      return res.json({ message: 'Item removed from cart' });
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    res.json({
      message: 'Cart item updated',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { cart: true }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check if user owns this cart
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id }
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};