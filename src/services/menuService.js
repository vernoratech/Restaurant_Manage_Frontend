import apiClient from './apiClient';

const resolveId = (value) => {
  if (!value) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    const normalized = String(value).trim();
    return normalized || null;
  }
  if (typeof value === 'object') {
    if ('$oid' in value && typeof value.$oid === 'string') {
      return value.$oid.trim() || null;
    }
    if ('_id' in value) {
      const resolved = resolveId(value._id);
      if (resolved) return resolved;
    }
    if ('id' in value) {
      const resolved = resolveId(value.id);
      if (resolved) return resolved;
    }
    if ('resId' in value) {
      const resolved = resolveId(value.resId);
      if (resolved) return resolved;
    }
  }
  return null;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((entry) => entry !== null && entry !== undefined && entry !== '');
  }
  return [value].filter((entry) => entry !== null && entry !== undefined && entry !== '');
};

const extractMenuItems = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  if (payload.data && Array.isArray(payload.data.menu)) return payload.data.menu;
  if (Array.isArray(payload.menu)) return payload.menu;
  if (payload.result && Array.isArray(payload.result.items)) return payload.result.items;
  return [];
};

const normalizeMenuItem = (item) => {
  if (!item) return null;

  const id = resolveId(item._id) || resolveId(item.id) || resolveId(item.itemId) || resolveId(item.menuItemId);
  if (!id) return null;

  const basePrice = toNumber(item.price);
  const discountPrice = toNumber(item.discountPrice);
  const displayPrice = discountPrice ?? basePrice ?? 0;
  const images = ensureArray(item.image || item.images || item.imageUrl || item.imageUrls);

  const productCategoryId =
    resolveId(item.productCategory) ||
    resolveId(item.productCategoryId) ||
    resolveId(item.categoryId) ||
    (item.category && typeof item.category === 'object' ? resolveId(item.category) : null);

  const productCategoryName =
    (item.productCategory && typeof item.productCategory === 'object' && item.productCategory.name)
      ? item.productCategory.name
      : item.productCategoryName || item.categoryName ||
          (item.category && typeof item.category === 'object' && item.category.name ? item.category.name : undefined);

  const stringifyIngredients = () => {
    if (Array.isArray(item.ingredients)) return item.ingredients;
    if (typeof item.ingredients === 'string') {
      return item.ingredients
        .split(',')
        .map((ingredient) => ingredient.trim())
        .filter(Boolean);
    }
    return [];
  };

  const status = typeof item.status === 'string' ? item.status.toLowerCase() : undefined;
  const availabilityFromStatus = status ? status !== 'inactive' && status !== 'unavailable' : undefined;

  return {
    id,
    name: item.itemName || item.name || 'Untitled Item',
    description: item.description || '',
    price: displayPrice ?? 0,
    basePrice: basePrice ?? displayPrice ?? 0,
    discountPrice,
    quantity: item.quantity || '',
    category: item.itemCategory || item.category || '',
    prepTime: item.prepTime || '',
    calories: toNumber(item.calories),
    spicyLevel: item.spicyLevel || '',
    rating: toNumber(item.rating),
    ingredients: stringifyIngredients(),
    imageUrl: images[0] || '',
    imageUrls: images,
    isAvailable:
      item.isAvailable !== undefined
        ? Boolean(item.isAvailable)
        : availabilityFromStatus !== undefined
          ? availabilityFromStatus
          : true,
    resId: resolveId(item.resId) || resolveId(item.restaurantId) || resolveId(item.restaurant) || null,
    productCategoryId: productCategoryId || '',
    productCategoryName: productCategoryName || '',
    raw: item,
  };
};

const prepareMenuPayload = (data, restaurantId) => {
  if (!data) {
    throw new Error('Menu item payload is required');
  }

  const price = toNumber(data.price ?? data.basePrice);
  if (price === null) {
    throw new Error('Item price is required');
  }

  const productCategory =
    resolveId(data.productCategory) ||
    resolveId(data.productCategoryId);

  if (!productCategory || !String(productCategory).trim()) {
    throw new Error('Product category is required');
  }

  const payload = {
    itemName: data.itemName || data.name,
    description: data.description || '',
    price,
    discountPrice: toNumber(data.discountPrice),
    quantity: data.quantity || '',
    itemCategory: data.itemCategory || data.category || '',
    productCategory,
    prepTime: data.prepTime || '',
    calories: toNumber(data.calories),
    spicyLevel: data.spicyLevel || '',
    rating: toNumber(data.rating),
    ingredients: Array.isArray(data.ingredients)
      ? data.ingredients
      : typeof data.ingredients === 'string'
        ? data.ingredients
            .split(',')
            .map((ingredient) => ingredient.trim())
            .filter(Boolean)
        : [],
    image: ensureArray(data.image || data.imageUrl || data.imageUrls),
    resId: resolveId(data.resId) || resolveId(restaurantId) || (restaurantId ? String(restaurantId) : null),
    status: data.status,
    isAvailable: data.isAvailable,
  };

  if (!payload.itemName || !payload.itemName.trim()) {
    throw new Error('Item name is required');
  }

  if (!payload.resId) {
    throw new Error('Restaurant ID is required to manage menu items');
  }

  if (!payload.image.length) {
    delete payload.image;
  }
  if (!payload.quantity) {
    delete payload.quantity;
  }
  if (!payload.prepTime) {
    delete payload.prepTime;
  }
  if (!payload.itemCategory) {
    delete payload.itemCategory;
  }
  if (payload.discountPrice === null) {
    delete payload.discountPrice;
  }
  if (payload.calories === null) {
    delete payload.calories;
  }
  if (payload.rating === null) {
    delete payload.rating;
  }
  if (!payload.ingredients.length) {
    delete payload.ingredients;
  }
  if (!payload.spicyLevel) {
    delete payload.spicyLevel;
  }
  if (payload.isAvailable === undefined) {
    delete payload.isAvailable;
  }
  if (!payload.status) {
    delete payload.status;
  }

  return payload;
};

const menuService = {
  async getMenuItems(restaurantId, params = {}) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to fetch menu items');
    }

    const queryParams = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (entry === undefined || entry === null || entry === '') return;
          queryParams.append(key, entry);
        });
        return;
      }

      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const endpointBase = `/restaurants/menu/getmenus/${restaurantId}/items/`;
    const endpoint = queryString ? `${endpointBase}?${queryString}` : endpointBase;

    const response = await apiClient.request(endpoint, { method: 'GET' });

    const items = extractMenuItems(response)
      .map(normalizeMenuItem)
      .filter(Boolean);

    const total = response?.data?.total ?? response?.total ?? response?.data?.pagination?.total ?? response?.pagination?.total ?? items.length;
    const page = response?.data?.page ?? response?.page ?? params.page ?? 1;
    const limit = response?.data?.limit ?? response?.limit ?? params.limit ?? items.length;

    return {
      success: true,
      items,
      total: Number(total) || 0,
      page: Number(page) || 1,
      limit: Number(limit) || items.length || 0,
      raw: response,
    };
  },

  async getMenuItem(restaurantId, itemId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to fetch a menu item');
    }
    if (!itemId) {
      throw new Error('Menu item ID is required');
    }

    const endpoint = `/restaurants/menu/get-menu/${restaurantId}/items/${itemId}`;
    const response = await apiClient.request(endpoint, { method: 'GET' });

    const source = response.data || response.item || response.menu || response.result || response;
    const normalized = normalizeMenuItem(source);

    return {
      success: Boolean(normalized),
      item: normalized,
      raw: response,
    };
  },

  async createMenuItem(restaurantId, data) {
    const payload = prepareMenuPayload(data, restaurantId);
    const endpoint = `/restaurants/menu/create-menu/${payload.resId}/items`;

    const response = await apiClient.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const source = response.data || response.item || response.createdItem || response.menu || response;
    const normalized = normalizeMenuItem(source);

    return {
      success: Boolean(normalized),
      item: normalized,
      raw: response,
    };
  },

  async updateMenuItem(restaurantId, itemId, data) {
    if (!itemId) {
      throw new Error('Menu item ID is required to update');
    }

    const payload = prepareMenuPayload({ ...data, resId: restaurantId }, restaurantId);
    const endpoint = `/restaurants/menu/update-menu/${payload.resId}/items/${itemId}`;

    const response = await apiClient.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const source = response.data || response.item || response.updatedItem || response.menu || response;
    const normalized = normalizeMenuItem(source);

    return {
      success: Boolean(normalized),
      item: normalized,
      raw: response,
    };
  },

  async deleteMenuItem(restaurantId, itemId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to delete a menu item');
    }
    if (!itemId) {
      throw new Error('Menu item ID is required to delete');
    }

    const endpoint = `/restaurants/menu/delete-menu/${restaurantId}/items/${itemId}`;
    const response = await apiClient.request(endpoint, {
      method: 'DELETE',
    });

    return {
      success: true,
      raw: response,
    };
  },
};

export { normalizeMenuItem, prepareMenuPayload };
export default menuService;
