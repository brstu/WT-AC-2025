const express = require('express');
const router = express.Router();
const GadgetModel = require('../models/gadget');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  validate,
  createGadgetSchema, 
  updateGadgetSchema, 
  queryParamsSchema,
  idParamSchema,
  GADGET_CATEGORIES
} = require('../schemas/gadgetSchemas');

/**
 * @swagger
 * /gadgets:
 *   get:
 *     summary: Get all gadgets with filtering, searching and pagination
 *     tags: [Gadgets]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search in name, brand, description, category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, other, all]
 *         description: Filter by category
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, brand, category, price, rating, releaseDate, createdAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (alternative to offset)
 *     responses:
 *       200:
 *         description: List of gadgets with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gadget'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', validate(queryParamsSchema), asyncHandler(async (req, res) => {
  // Convert page to offset if provided
  if (req.query.page && !req.query.offset) {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    req.query.offset = (page - 1) * limit;
  }

  const result = await GadgetModel.findAll(req.query);
  
  res.status(200).json({
    success: true,
    ...result
  });
}));

/**
 * @swagger
 * /gadgets/stats:
 *   get:
 *     summary: Get gadgets statistics
 *     tags: [Gadgets]
 *     responses:
 *       200:
 *         description: Statistics about gadgets collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     inStock:
 *                       type: integer
 *                     outOfStock:
 *                       type: integer
 *                     categories:
 *                       type: object
 *                     brands:
 *                       type: object
 *                     averagePrice:
 *                       type: number
 *                     averageRating:
 *                       type: number
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await GadgetModel.getStats();
  
  res.status(200).json({
    success: true,
    data: stats
  });
}));

/**
 * @swagger
 * /gadgets/{id}:
 *   get:
 *     summary: Get gadget by ID
 *     tags: [Gadgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     responses:
 *       200:
 *         description: Gadget details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       404:
 *         description: Gadget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate(idParamSchema), asyncHandler(async (req, res) => {
  const gadget = await GadgetModel.findById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: gadget
  });
}));

/**
 * @swagger
 * /gadgets:
 *   post:
 *     summary: Create a new gadget
 *     tags: [Gadgets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brand, category, price]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "iPhone 15 Pro"
 *               brand:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "Apple"
 *               category:
 *                 type: string
 *                 enum: [smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, other]
 *                 example: "smartphone"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 99999.99
 *                 example: 999.99
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Latest flagship smartphone"
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-09-15"
 *               inStock:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Gadget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createGadgetSchema), asyncHandler(async (req, res) => {
  const gadget = await GadgetModel.create(req.body);
  
  res.status(201).json({
    success: true,
    data: gadget
  });
}));

/**
 * @swagger
 * /gadgets/{id}:
 *   patch:
 *     summary: Update gadget by ID (partial update)
 *     tags: [Gadgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               brand:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               category:
 *                 type: string
 *                 enum: [smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, other]
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 99999.99
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               inStock:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Gadget updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       404:
 *         description: Gadget not found
 *       422:
 *         description: Validation error
 */
router.patch('/:id', validate(idParamSchema), validate(updateGadgetSchema), asyncHandler(async (req, res) => {
  const gadget = await GadgetModel.update(req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    data: gadget
  });
}));

/**
 * @swagger
 * /gadgets/{id}:
 *   put:
 *     summary: Replace gadget by ID (full update)
 *     tags: [Gadgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, brand, category, price]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               brand:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               category:
 *                 type: string
 *                 enum: [smartphone, laptop, tablet, smartwatch, headphones, camera, gaming, other]
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 99999.99
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               inStock:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Gadget replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       404:
 *         description: Gadget not found
 *       422:
 *         description: Validation error
 */
router.put('/:id', validate(idParamSchema), validate(createGadgetSchema), asyncHandler(async (req, res) => {
  const gadget = await GadgetModel.update(req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    data: gadget
  });
}));

/**
 * @swagger
 * /gadgets/{id}:
 *   delete:
 *     summary: Delete gadget by ID
 *     tags: [Gadgets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     responses:
 *       204:
 *         description: Gadget deleted successfully
 *       404:
 *         description: Gadget not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', validate(idParamSchema), asyncHandler(async (req, res) => {
  await GadgetModel.delete(req.params.id);
  
  res.status(204).send();
}));

module.exports = router;