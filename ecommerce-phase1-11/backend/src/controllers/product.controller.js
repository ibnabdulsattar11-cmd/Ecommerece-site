const { Product, Category, ProductImage, ProductVariant, Review, sequelize } = require('../models');
const { Op } = require('sequelize');
const slugify = require('../utils/slugify');

const includeFull = [
  { model: ProductImage, as: 'images', order: [['order', 'ASC']] },
  { model: ProductVariant, as: 'variants' },
  { model: Category, as: 'category', attributes: ['id', 'nameEn', 'nameAr', 'slug'] },
];

// GET /api/products (public)
// Supports: ?page=1&limit=20&search=&category=slug&minPrice=&maxPrice=
//           &brand=&sort=price_asc|price_desc|newest|rating|popular&inStock=true
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const where = { status: 'active' };
    const include = [...includeFull];

    // --- Search (bilingual, matches name/desc/sku/brand) ---
    if (req.query.search) {
      const term = `%${req.query.search}%`;
      where[Op.or] = [
        { nameEn: { [Op.iLike]: term } },
        { nameAr: { [Op.iLike]: term } },
        { sku: { [Op.iLike]: term } },
        { brand: { [Op.iLike]: term } },
      ];
    }

    // --- Category filter (by slug, includes subcategory products) ---
    if (req.query.category) {
      const category = await Category.findOne({ where: { slug: req.query.category } });
      if (category) {
        const children = await Category.findAll({ where: { parentId: category.id } });
        const categoryIds = [category.id, ...children.map((c) => c.id)];
        where.categoryId = { [Op.in]: categoryIds };
      } else {
        // unknown category slug -> empty result set, not an error
        return res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
      }
    }

    // --- Price range ---
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }

    // --- Brand filter (comma separated) ---
    if (req.query.brand) {
      const brands = req.query.brand.split(',').map((b) => b.trim());
      where.brand = { [Op.in]: brands };
    }

    // --- Stock filter ---
    if (req.query.inStock === 'true') {
      where.stock = { [Op.gt]: 0 };
    }

    // --- Sorting ---
    let order = [['createdAt', 'DESC']]; // newest first, default
    switch (req.query.sort) {
      case 'price_asc':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
        order = [['price', 'DESC']];
        break;
      case 'rating':
        order = [['avgRating', 'DESC']];
        break;
      case 'popular':
        order = [['viewCount', 'DESC']];
        break;
      case 'newest':
      default:
        order = [['createdAt', 'DESC']];
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true, // needed for correct count with hasMany includes
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:slug (public) - detail + related products
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { slug: req.params.slug, status: 'active' },
      include: includeFull,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // fire-and-forget view count increment (don't block response)
    product.increment('viewCount').catch(() => {});

    // Related products: same category, excluding current product
    const related = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        status: 'active',
        id: { [Op.ne]: product.id },
      },
      include: [{ model: ProductImage, as: 'images', limit: 1 }],
      limit: 8,
      order: [['avgRating', 'DESC']],
    });

    // Recommended: top rated across catalog (simple version;
    // swap for a real recommendation engine later if needed)
    const recommended = await Product.findAll({
      where: {
        status: 'active',
        id: { [Op.notIn]: [product.id, ...related.map((r) => r.id)] },
      },
      include: [{ model: ProductImage, as: 'images', limit: 1 }],
      order: [['avgRating', 'DESC'], ['reviewCount', 'DESC']],
      limit: 8,
    });

    res.json({
      success: true,
      data: product,
      related,
      recommended,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/recently-viewed?ids=id1,id2,id3
// Frontend keeps recently-viewed product IDs in localStorage and
// asks the backend to hydrate them with fresh data in one call.
exports.getRecentlyViewed = async (req, res, next) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) {
      return res.json({ success: true, data: [] });
    }

    const products = await Product.findAll({
      where: { id: { [Op.in]: ids }, status: 'active' },
      include: [{ model: ProductImage, as: 'images', limit: 1 }],
    });

    // preserve the order the frontend sent (most-recent-first)
    const ordered = ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    res.json({ success: true, data: ordered });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/filters/meta - distinct brands + price range for filter UI
exports.getFilterMeta = async (req, res, next) => {
  try {
    const brands = await Product.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('brand')), 'brand']],
      where: { status: 'active', brand: { [Op.ne]: null } },
      raw: true,
    });

    const priceRange = await Product.findOne({
      attributes: [
        [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
        [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice'],
      ],
      where: { status: 'active' },
      raw: true,
    });

    res.json({
      success: true,
      data: {
        brands: brands.map((b) => b.brand).filter(Boolean),
        priceRange,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------- ADMIN ----------

// POST /api/products (admin)
exports.createProduct = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      nameEn, nameAr, descEn, descAr, sku, brand,
      price, salePrice, stock, categoryId, status,
      variants, // [{ size, color, colorHex, sku, stock, priceModifier, isDefault }]
    } = req.body;

    const baseSlug = slugify(nameEn);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await Product.create(
      {
        nameEn, nameAr, descEn, descAr, sku, brand,
        price, salePrice, stock: stock || 0, categoryId,
        status: status || 'draft', slug,
      },
      { transaction: t }
    );

    if (Array.isArray(variants) && variants.length) {
      await ProductVariant.bulkCreate(
        variants.map((v) => ({ ...v, productId: product.id })),
        { transaction: t }
      );
    }

    // Images come from a prior upload call (multipart) which returns URLs;
    // this endpoint just links already-uploaded image URLs to the product.
    if (Array.isArray(req.body.images) && req.body.images.length) {
      await ProductImage.bulkCreate(
        req.body.images.map((img, i) => ({
          productId: product.id,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          altTextEn: img.altTextEn,
          altTextAr: img.altTextAr,
          order: i,
          isPrimary: i === 0,
        })),
        { transaction: t }
      );
    }

    await t.commit();

    const full = await Product.findByPk(product.id, { include: includeFull });
    res.status(201).json({ success: true, data: full });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// PUT /api/products/:id (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allowedFields = [
      'nameEn', 'nameAr', 'descEn', 'descAr', 'sku', 'brand',
      'price', 'salePrice', 'stock', 'categoryId', 'status',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    if (req.body.nameEn && req.body.nameEn !== product.nameEn) {
      const baseSlug = slugify(req.body.nameEn);
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ where: { slug, id: { [Op.ne]: product.id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      product.slug = slug;
    }

    await product.save();
    const full = await Product.findByPk(product.id, { include: includeFull });
    res.json({ success: true, data: full });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id (admin) - soft delete via status
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.status = 'INACTIVE';
    await product.save();
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/admin/:id (admin) - full detail incl. DRAFT/INACTIVE
exports.getProductByIdAdmin = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: includeFull });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
