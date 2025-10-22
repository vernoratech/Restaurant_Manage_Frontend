import apiClient from './apiClient';

const menuServiceWithFiles = {
  async createMenuItemWithFiles(restaurantId, formData) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to create a menu item');
    }

    const endpoint = `/restaurants/menu/create-menu/${restaurantId}/items`;
    
    const response = await apiClient.request(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    const source = response.data || response.item || response.createdItem || response.menu || response;
    
    return {
      success: Boolean(source),
      item: source,
      raw: response,
    };
  },

  async updateMenuItemWithFiles(restaurantId, itemId, formData) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to update a menu item');
    }
    if (!itemId) {
      throw new Error('Menu item ID is required to update');
    }

    const endpoint = `/restaurants/menu/update-menu/${restaurantId}/items/${itemId}`;

    const response = await apiClient.request(endpoint, {
      method: 'PUT',
      body: formData,
    });

    const source = response.data || response.item || response.updatedItem || response.menu || response;
    
    return {
      success: Boolean(source),
      item: source,
      raw: response,
    };
  },
};

export default menuServiceWithFiles;
