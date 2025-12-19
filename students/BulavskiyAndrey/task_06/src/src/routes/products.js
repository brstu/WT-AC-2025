const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productsController');
const { validate, createProductSchema, updateProductSchema } = require('../middleware/validate');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductBase:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *     
 *     ProductRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/ProductBase'
 *     
 *     ProductResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ProductBase'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *             createdAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       403:
 *         description: Access denied
 */
router.post('/', auth, admin, validate(createProductSchema), createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 */
router.put('/:id', auth, admin, validate(updateProductSchema), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;