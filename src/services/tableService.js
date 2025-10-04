import apiClient from './apiClient';

const normalizeBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return defaultValue;
};

const normalizeTable = (table) => {
  if (!table) {
    return null;
  }

  return {
    id: table.id || table._id || table.tableId || table.table_id || null,
    tableNumber: table.tableNumber || '',
    capacity: Number(table.capacity) || 0,
    status: table.status || 'available',
    location: table.location || '',
    description: table.description || '',
    reservedStatus: normalizeBoolean(table.reservedStatus, false),
    isActive: normalizeBoolean(table.isActive, true),
    restaurantId: table.restaurantId || table.restaurant_id || null,
    raw: table,
  };
};

const extractTablesArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.tables)) return response.tables;
  if (response.data && Array.isArray(response.data.tables)) return response.data.tables;
  return [];
};

export const tableService = {
  async getTables(restaurantId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to fetch tables');
    }

    const endpoint = `/restaurants/get-tables/${restaurantId}/tables`;
    const response = await apiClient.request(endpoint, {
      method: 'GET',
    });

    const tables = extractTablesArray(response).map(normalizeTable).filter(Boolean);

    return {
      success: true,
      tables,
      raw: response,
    };
  },

  async getTableById(restaurantId, tableId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to fetch a table');
    }
    if (!tableId) {
      throw new Error('Table ID is required to fetch a table');
    }

    const endpoint = `/restaurants/get-table/${restaurantId}/tables/${tableId}`;
    const response = await apiClient.request(endpoint, {
      method: 'GET',
    });

    const table = normalizeTable(response.data || response.table || response);

    return {
      success: Boolean(table),
      table,
      raw: response,
    };
  },

  async createTable(restaurantId, payload) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to create a table');
    }

    const endpoint = `/restaurants/create-table/${restaurantId}/tables`;
    const response = await apiClient.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const table = normalizeTable(response.data || response.table || response);

    return {
      success: Boolean(table),
      table,
      raw: response,
    };
  },

  async updateTable(restaurantId, tableId, payload) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to update a table');
    }
    if (!tableId) {
      throw new Error('Table ID is required to update a table');
    }

    const endpoint = `/restaurants/update-table/${restaurantId}/tables/${tableId}`;
    const response = await apiClient.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const table = normalizeTable(response.data || response.table || response);

    return {
      success: Boolean(table),
      table,
      raw: response,
    };
  },

  async deleteTable(restaurantId, tableId) {
    if (!restaurantId) {
      throw new Error('Restaurant ID is required to delete a table');
    }
    if (!tableId) {
      throw new Error('Table ID is required to delete a table');
    }

    const endpoint = `/restaurants/delete-table/${restaurantId}/tables/${tableId}`;
    const response = await apiClient.request(endpoint, {
      method: 'DELETE',
    });

    return {
      success: true,
      raw: response,
    };
  },
};

export default tableService;
