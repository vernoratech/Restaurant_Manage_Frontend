import apiClient from './apiClient';

const normalizeFlag = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === '1' || lower === 'true') return true;
    if (lower === '0' || lower === 'false') return false;
  }
  return defaultValue;
};

const buildCategoryId = (category) => {
  if (!category) return null;
  if (category.id) return String(category.id);
  if (category._id) return String(category._id);
  if (category.categoryId) return String(category.categoryId);
  if (category.slug) return String(category.slug);
  if (category.name) return category.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return null;
};

const normalizeCategory = (category) => {
  if (!category) return null;

  const id = buildCategoryId(category);

  return {
    id,
    name: category.name || category.categoryName || 'Untitled Category',
    isActive: normalizeFlag(category.isActive, true),
    isDefault: normalizeFlag(category.isDefault, false),
    restaurantId: category.restaurantId || category.resId || category.restaurant_id || null,
    raw: category,
  };
};

const extractCategories = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.categories)) return response.categories;
  if (response.data && Array.isArray(response.data.categories)) return response.data.categories;
  if (response.category && Array.isArray(response.category)) return response.category;
  return [];
};

export const categoryService = {
  async getCategories(restaurantId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to fetch categories');
    }

    const endpoint = `/restaurants/category/get-category/${restaurantId}/categories`;
    const response = await apiClient.request(endpoint, {
      method: 'GET',
    });

    const categories = extractCategories(response)
      .map(normalizeCategory)
      .filter(Boolean);

    return {
      success: true,
      categories,
      raw: response,
    };
  },

  async createCategory(restaurantId, payload) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to create a category');
    }
    if (!payload || !payload.name) {
      throw new Error('Category name is required');
    }

    const endpoint = `/restaurants/category/create-category/${restaurantId}/categories`;
    const response = await apiClient.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        restaurantId,
        isActive: payload.isActive ? 1 : 0,
        isDefault: payload.isDefault ? 1 : 0,
      }),
    });

    const normalized = normalizeCategory(response.data || response.category || response);

    return {
      success: Boolean(normalized),
      category: normalized,
      raw: response,
    };
  },

  async updateCategory(restaurantId, categoryId, payload) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to update a category');
    }
    if (!categoryId) {
      throw new Error('Category ID is required to update a category');
    }

    const endpoint = `/restaurants/category/update-category/${restaurantId}/categories/${categoryId}`;
    const response = await apiClient.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        isActive: payload.isActive ? 1 : 0,
        isDefault: payload.isDefault ? 1 : 0,
      }),
    });

    const normalized = normalizeCategory(response.data || response.category || response);

    return {
      success: Boolean(normalized),
      category: normalized,
      raw: response,
    };
  },

  async deleteCategory(restaurantId, categoryId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to delete a category');
    }
    if (!categoryId) {
      throw new Error('Category ID is required to delete a category');
    }

    const endpoint = `/restaurants/category/delete-category/${restaurantId}/categories/${categoryId}`;
    const response = await apiClient.request(endpoint, {
      method: 'DELETE',
    });

    return {
      success: true,
      raw: response,
    };
  },
};

export default categoryService;
