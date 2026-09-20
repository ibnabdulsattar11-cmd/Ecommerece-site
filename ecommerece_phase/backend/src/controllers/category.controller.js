import { Category } from '../models/index.js';
import slugify from '../utils/slugify.js';
import { Op } from 'sequelize';

// GET /api/categories  (public) - tree or flat list
 const getCategories = async (req, res, next) => {
  try {
    const { tree } = req.query;

    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['nameEn', 'ASC']],
    });

    if (tree === 'true') {
      const byId = {};
      categories.forEach((c) => (byId[c.id] = { ...c.toJSON(), children: [] }));
      const roots = [];
      categories.forEach((c) => {
        if (c.parentId && byId[c.parentId]) {
          byId[c.parentId].children.push(byId[c.id]);
        } else {
          roots.push(byId[c.id]);
        }
      });
      return res.json({ success: true, data: roots });
    }

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:slug (public)
 const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug, isActive: true },
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories (admin)
 const createCategory = async (req, res, next) => {
  try {
    const { nameEn, nameAr, descriptionEn, descriptionAr, parentId, image, sortOrder } = req.body;

    const baseSlug = slugify(nameEn);
    let slug = baseSlug;
    let counter = 1;
    while (await Category.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const category = await Category.create({
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      parentId: parentId || null,
      image,
      sortOrder: sortOrder || 0,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id (admin)
 const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const allowedFields = [
      'nameEn', 'nameAr', 'descriptionEn', 'descriptionAr',
      'parentId', 'image', 'sortOrder', 'isActive',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) category[field] = req.body[field];
    });

    if (req.body.nameEn && req.body.nameEn !== category.nameEn) {
      const baseSlug = slugify(req.body.nameEn);
      let slug = baseSlug;
      let counter = 1;
      while (await Category.findOne({ where: { slug, id: { [Op.ne]: category.id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      category.slug = slug;
    }

    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id (admin) - soft delete via isActive
 const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const childCount = await Category.count({ where: { parentId: category.id } });
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a category that has subcategories. Reassign or delete them first.',
      });
    }

    category.isActive = false;
    await category.save();
    res.json({ success: true, message: 'Category deactivated' });
  } catch (err) {
    next(err);
  }
};

export { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
export default { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };