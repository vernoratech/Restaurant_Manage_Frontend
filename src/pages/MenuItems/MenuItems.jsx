import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiUpload, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Skeleton from '../Skeleton/Skeleton';
import categoryService from '../../services/categoryService';
import menuService from '../../services/menuService';

const resolveRestaurantId = (value) => {
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
      const resolved = resolveRestaurantId(value._id);
      if (resolved) return resolved;
    }

    if ('id' in value) {
      const resolved = resolveRestaurantId(value.id);
      if (resolved) return resolved;
    }

    if ('restaurantId' in value) {
      const resolved = resolveRestaurantId(value.restaurantId);
      if (resolved) return resolved;
    }

    if ('resId' in value) {
      const resolved = resolveRestaurantId(value.resId);
      if (resolved) return resolved;
    }

    if ('restaurant' in value) {
      const resolved = resolveRestaurantId(value.restaurant);
      if (resolved) return resolved;
    }
  }

  return null;
};

const MenuItems = ({ isNewItem = false }) => {
  const { user, restaurantData } = useAuth();
  const navigate = useNavigate();
  
  // State for menu items and UI
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // State for categories and category management
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Categories' },
  ]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    isActive: true,
    isDefault: false,
  });
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // State for add item modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    quantity: '',
    category: 'veg',
    productCategoryId: '',
    prepTime: '',
    calories: '',
    spicyLevel: '',
    rating: '',
    ingredients: '',
    isAvailable: true,
    imageUrl: ''
  });

  // Get restaurant ID from auth context
  const restaurantId = useMemo(() => {
    const immediateCandidates = [
      restaurantData?._id,
      restaurantData?.id,
      restaurantData?.restaurantId,
      restaurantData?.resId,
      restaurantData,
      user?.resId,
      user?.restaurantId,
      user,
    ];

    for (const candidate of immediateCandidates) {
      const resolved = resolveRestaurantId(candidate);
      if (resolved) return resolved;
    }

    try {
      const stored = localStorage.getItem('restaurantData');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedCandidates = [
          parsed,
          parsed?._id,
          parsed?.id,
          parsed?.restaurantId,
          parsed?.resId,
          parsed?.restaurant,
        ];

        for (const candidate of storedCandidates) {
          const resolved = resolveRestaurantId(candidate);
          if (resolved) return resolved;
        }
      }
    } catch (error) {
      console.error('Failed to parse stored restaurant data:', error);
    }

    return null;
  }, [restaurantData, user]);

  // Filter categories for menu item form (exclude 'all')
  const menuCategories = useMemo(() => {
    return categories.filter(cat => cat.id !== 'all');
  }, [categories]);

  const getDefaultCategoryId = useCallback(() => {
    return menuCategories.length > 0 ? menuCategories[0].id : '';
  }, [menuCategories]);

  const createEmptyNewItem = useCallback(() => ({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    quantity: '',
    category: 'veg',
    productCategoryId: getDefaultCategoryId(),
    prepTime: '',
    calories: '',
    spicyLevel: '',
    rating: '',
    ingredients: '',
    isAvailable: true,
    imageUrl: ''
  }), [getDefaultCategoryId]);

  useEffect(() => {
    if (!menuCategories.length) return;

    setNewItem(prev => {
      if (prev.productCategoryId && menuCategories.some(cat => cat.id === prev.productCategoryId)) {
        return prev;
      }

      return {
        ...prev,
        productCategoryId: menuCategories[0].id,
      };
    });
  }, [menuCategories]);

  // Food image URLs for different categories
  const foodImages = {
    veg: [
      'https://images.unsplash.com/photo-1478144592103-25e218a04891?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=300&h=200&fit=crop'
    ],
    'non-veg': [
      'https://images.unsplash.com/photo-1604908176997-12518821ad01?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=200&fit=crop'
    ],
    appetizers: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b49f?w=300&h=200&fit=crop'
    ],
    'main-course': [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-087703934569?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1544025162-0e1a1d09e8c1?w=300&h=200&fit=crop'
    ],
    desserts: [
      'https://images.unsplash.com/photo-1551024601-bec78aea704c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1509443769591-2f0d278aba34?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1551024601-bfcfd0f2a94f?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo 1488477181946-6428a0291777?w=300&h=200&fit=crop'
    ],
    beverages: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1551024601-b789e04f7ff2?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1513558164603-84f228e1e0e2?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1513558161294-52b27d0daa89?w=300&h=200&fit=crop'
    ]
  };

  // Handle input change for new item form
  const handleNewItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    const resolvedValue = type === 'checkbox' ? checked : value;

    setNewItem((prev) => {
      const updated = {
        ...prev,
        [name]: resolvedValue,
      };

      if (name === 'category') {
        const randomImage = getRandomImage(resolvedValue);
        updated.imageUrl = randomImage;
      }

      return updated;
    });
  };

  const handleImageSelect = (categoryType) => {
    setNewItem((prev) => {
      const key = typeof categoryType === 'string' && categoryType ? categoryType : prev.category;
      const images = foodImages[key] || [];
      const randomImage = images[Math.floor(Math.random() * images.length)] || 'https://via.placeholder.com/300x200?text=No+Image';

      return {
        ...prev,
        imageUrl: randomImage,
      };
    });
  };

  // Handle form submission
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!restaurantId) {
      toast.error('Restaurant information is missing. Please try reloading the page.');
      return;
    }

    if (!newItem.productCategoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!menuCategories.some(cat => cat.id === newItem.productCategoryId)) {
      toast.error('Please select a valid category');
      return;
    }

    setIsSavingItem(true);

    try {
      const fallbackImage = getRandomImage(newItem.category);
      const payload = {
        itemName: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        discountPrice: newItem.discountPrice ? parseFloat(newItem.discountPrice) : undefined,
        quantity: newItem.quantity,
        itemCategory: newItem.category,
        productCategory: newItem.productCategoryId,
        prepTime: newItem.prepTime,
        calories: newItem.calories ? parseInt(newItem.calories) : undefined,
        spicyLevel: newItem.spicyLevel,
        rating: newItem.rating ? parseFloat(newItem.rating) : undefined,
        ingredients: newItem.ingredients ? newItem.ingredients.split(',').map(i => i.trim()).filter(Boolean) : [],
        image: newItem.imageUrl ? [newItem.imageUrl] : fallbackImage ? [fallbackImage] : [],
        isAvailable: newItem.isAvailable
      };

      const { item: createdItem } = await menuService.createMenuItem(restaurantId, payload);
      
      if (createdItem) {
        setMenuItems(prev => [createdItem, ...prev]);
        setFilteredItems(prev => [createdItem, ...prev]);
        toast.success('Menu item added successfully!');
        
        // Reset form and close modal
        setNewItem(createEmptyNewItem());

        setIsAddItemModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error(error.message || 'Failed to create menu item');
    } finally {
      setIsSavingItem(false);
    }
  };
  // Function to get a random image for a category
  const getRandomImage = (category) => {
    const images = foodImages[category] || [];
    return images[Math.floor(Math.random() * images.length)] || 'https://via.placeholder.com/300x200?text=No+Image';
  };

  // Load menu items from API
  useEffect(() => {
    const loadMenuItems = async () => {
      if (!restaurantId) {
        console.log('No restaurant ID available, skipping menu items load');
        setIsLoading(false);
        return;
      }

      if (isNewItem) {
        setMenuItems([]);
        setFilteredItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { items } = await menuService.getMenuItems(restaurantId);
        
        setMenuItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Error loading menu items:', error);
        toast.error(error.message || 'Failed to load menu items');
        setMenuItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuItems();
  }, [restaurantId, isNewItem]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      if (!restaurantId) {
        return;
      }

      try {
        setIsCategoriesLoading(true);
        const { categories: fetchedCategories } = await categoryService.getCategories(restaurantId);
        
        // Add 'All Categories' option for filtering
        const categoriesWithAll = [
          { id: 'all', name: 'All Categories' },
          ...fetchedCategories
        ];
        
        setCategories(categoriesWithAll);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error(error.message || 'Failed to load categories');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [restaurantId]);

  // Filter and search functionality
  useEffect(() => {
    let result = [...menuItems];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [menuItems, searchTerm, selectedCategory]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Handle file selection for bulk upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (CSV or Excel)
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid CSV or Excel file');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      // Here you would typically send the file to your API
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // const response = await fetch(`/api/restaurants/${restaurantData._id}/menu/import`, {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Menu items imported successfully!');
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      // Refresh the menu items
      // fetchMenuItems();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to import menu items');
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    if (!restaurantId) {
      toast.error('Restaurant information is missing. Please try reloading the page.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await menuService.deleteMenuItem(restaurantId, itemId);
      
      // Update local state
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setFilteredItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      toast.success('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error(error.message || 'Failed to delete menu item');
    }
  };

  // Toggle item availability
  const toggleAvailability = async (itemId, currentStatus) => {
    if (!restaurantId) {
      toast.error('Restaurant information is missing. Please try reloading the page.');
      return;
    }

    try {
      const currentItem = menuItems.find(item => item.id === itemId);
      if (!currentItem) {
        toast.error('Menu item not found');
        return;
      }

      const { item: updatedItem } = await menuService.updateMenuItem(
        restaurantId,
        itemId,
        { ...currentItem, isAvailable: !currentStatus }
      );
      
      if (updatedItem) {
        // Update local state
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? updatedItem : item
          )
        );
        
        setFilteredItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? updatedItem : item
          )
        );
      }
      
      toast.success(`Item ${currentStatus ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast.error(error.message || 'Failed to update item availability');
    }
  };

  // Category form handlers
  const handleCategoryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category.id);
      setCategoryForm({
        name: category.name,
        isActive: category.isActive !== undefined ? Boolean(category.isActive) : true,
        isDefault: category.isDefault !== undefined ? Boolean(category.isDefault) : false,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        isActive: true,
        isDefault: false,
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      isActive: true,
      isDefault: false,
    });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!restaurantId) {
      toast.error('Restaurant information is missing. Please try reloading the page.');
      return;
    }

    setIsSavingCategory(true);

    try {
      if (editingCategory) {
        // Update existing category
        const { category: updated } = await categoryService.updateCategory(
          restaurantId,
          editingCategory,
          categoryForm
        );
        
        setCategories(prevCategories =>
          prevCategories.map(cat =>
            cat.id === editingCategory
              ? { ...cat, ...updated, id: updated.id || editingCategory }
              : cat
          )
        );
        
        toast.success('Category updated successfully');
      } else {
        // Create new category
        const { category: created } = await categoryService.createCategory(
          restaurantId,
          categoryForm
        );
        
        if (created) {
          setCategories(prevCategories => [...prevCategories, created]);
          toast.success('Category created successfully');
        }
      }
      
      handleCloseCategoryModal();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId || categoryId === 'all') return;
    
    if (!restaurantId) {
      toast.error('Restaurant information is missing. Please try reloading the page.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await categoryService.deleteCategory(restaurantId, categoryId);
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
      
      // Reset selected category if it was deleted
      if (selectedCategory === categoryId) {
        setSelectedCategory('all');
      }
      
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  // Export menu items to CSV
  const exportToCSV = () => {
    // Convert menu items to CSV format
    const headers = ['Name', 'Description', 'Category', 'Price', 'Available'];
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    menuItems.forEach(item => {
      const row = [
        `"${item.name}"`,
        `"${item.description}"`,
        `"${item.category}"`,
        item.price,
        item.isAvailable ? 'Yes' : 'No'
      ];
      csvRows.push(row.join(','));
    });
    
    // Create CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `menu-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Menu exported successfully');
  };

  if (isLoading) {
    return (
      // <div className="flex items-center justify-center min-h-screen bg-gray-50">
      //   <div className="text-center">
      //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      //     <p className="mt-4 text-gray-600">
      //       {isNewItem ? 'Preparing new menu item...' : 'Loading menu items...'}
      //     </p>
      //   </div>
      // </div>
      <Skeleton />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col">
          <div className="mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <svg 
                className="-ml-0.5 mr-2 h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Dashboard</span>
            </button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your restaurant's menu items, categories, and pricing
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3 mb-4">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <FiUpload className="mr-2" /> Bulk Import
            </Button>
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => handleOpenCategoryModal()}
              disabled={!restaurantId}
            >
              <FiPlus className="mr-2" /> Add Category
            </Button>
            <Button
              variant="outline"
              className="flex items-center"
              onClick={exportToCSV}
            >
              <FiDownload className="mr-2" /> Export
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center"
              onClick={() => {
                // Reset the form when opening the modal
                setNewItem(createEmptyNewItem());
                setIsAddItemModalOpen(true);
              }}
            >
              <FiPlus className="mr-2" /> Add New Item
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
              </span>
              <span className="text-sm text-gray-400">|</span>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {currentItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <FiFilter className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {isNewItem ? 'No items added yet' : 'No menu items found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isNewItem 
              ? 'Start by adding a new menu item.'
              : searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding a new menu item.'
            }
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            {isNewItem && (
              <Button
                onClick={() => navigate('/menu/items')}
                variant="outline"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Menu Items
              </Button>
            )}
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                // Reset the form when opening the modal
                setNewItem(createEmptyNewItem());
                setIsAddItemModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              {isNewItem ? 'Add Your First Item' : 'Add Menu Item'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {currentItems.map((item) => (
              <li key={item.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                        <img
                          className="h-full w-full object-cover"
                          src={item.imageUrl || '/dummylogo.jpg'}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = '/dummylogo.jpg';
                            e.target.onerror = null; // Prevent infinite loop if fallback also fails
                            e.target.className = 'h-full w-full object-contain p-1 bg-white';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {item.name}
                          </p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {item.productCategoryName || menuCategories.find(cat => cat.id === item.productCategoryId)?.name || 'Uncategorized'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                        {item.ingredients && item.ingredients.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Ingredients: {item.ingredients.slice(0, 3).join(', ')}{item.ingredients.length > 3 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                      <div className="text-right">
                        {item.discountPrice && item.discountPrice < item.basePrice ? (
                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              ${parseFloat(item.discountPrice).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              ${parseFloat(item.basePrice).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">
                            ${parseFloat(item.price).toFixed(2)}
                          </p>
                        )}
                        {item.prepTime && (
                          <p className="text-xs text-gray-500">{item.prepTime}</p>
                        )}
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => toggleAvailability(item.id, item.isAvailable)}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${item.isAvailable ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                        <button
                          onClick={() => navigate(`/menu/items/${item.id}/edit`)}
                          className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiEdit2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiTrash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredItems.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredItems.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">First</span>
                      «
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      ‹
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show current page in the middle when possible
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum 
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      ›
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Last</span>
                      »
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsUploadModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <FiUpload className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Bulk Import Menu Items
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Upload a CSV or Excel file to import multiple menu items at once.
                      <a href="/menu-import-template.csv" className="text-blue-600 hover:text-blue-500 ml-1" download>
                        Download template
                      </a>
                    </p>
                  </div>
                  <div className="mt-6">
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">CSV or Excel up to 10MB</p>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-sm text-gray-700">
                        <p>Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <Button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  onClick={handleBulkUpload}
                  disabled={!selectedFile}
                >
                  Import Items
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setIsUploadModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Menu Item</h2>
                <button
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddItem}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newItem.name}
                        onChange={handleNewItemChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newItem.description}
                        onChange={handleNewItemChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Price
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            name="discountPrice"
                            value={newItem.discountPrice}
                            onChange={handleNewItemChange}
                            step="0.01"
                            min="0"
                            className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="text"
                          name="quantity"
                          value={newItem.quantity}
                          onChange={handleNewItemChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 1 plate, 500ml"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prep Time
                        </label>
                        <input
                          type="text"
                          name="prepTime"
                          value={newItem.prepTime}
                          onChange={handleNewItemChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 15 min"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Calories
                        </label>
                        <input
                          type="number"
                          name="calories"
                          value={newItem.calories}
                          onChange={handleNewItemChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spicy Level
                        </label>
                        <select
                          name="spicyLevel"
                          value={newItem.spicyLevel}
                          onChange={handleNewItemChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select level</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating
                        </label>
                        <input
                          type="number"
                          name="rating"
                          value={newItem.rating}
                          onChange={handleNewItemChange}
                          step="0.1"
                          min="0"
                          max="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0 - 5.0"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredients
                      </label>
                      <input
                        type="text"
                        name="ingredients"
                        value={newItem.ingredients}
                        onChange={handleNewItemChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., cheese, tomato, flour (comma separated)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <input
                            type="number"
                            name="price"
                            value={newItem.price}
                            onChange={handleNewItemChange}
                            step="0.01"
                            min="0"
                            className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Food Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-6">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="category"
                              value="veg"
                              checked={newItem.category === 'veg'}
                              onChange={handleNewItemChange}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                              required
                            />
                            Veg
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="category"
                              value="non-veg"
                              checked={newItem.category === 'non-veg'}
                              onChange={handleNewItemChange}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                            />
                            Non Veg
                          </label>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="productCategoryId"
                          value={newItem.productCategoryId}
                          onChange={handleNewItemChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="" disabled hidden>
                            {menuCategories.length ? 'Select a category' : 'No categories available'}
                          </option>
                          {menuCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={newItem.isAvailable}
                        onChange={handleNewItemChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                        Available
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Image Preview */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {newItem.imageUrl ? (
                          <div className="relative">
                            <img
                              src={newItem.imageUrl}
                              alt="Preview"
                              className="mx-auto h-48 w-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageSelect(newItem.category)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              Change Image
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="text-sm text-gray-600">
                              <button
                                type="button"
                                onClick={() => handleImageSelect(newItem.category)}
                                className="font-medium text-blue-600 hover:text-blue-500"
                              >
                                Select an image
                              </button>
                              <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Select a category to see image options
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddItemModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    loading={isSavingItem}
                    disabled={isSavingItem}
                  >
                    Add Item
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={handleCloseCategoryModal}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Content */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-50">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  {/* Modal Header */}
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>

                  {/* Form */}
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    {/* Category Name */}
                    <div>
                      <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="categoryName"
                        value={categoryForm.name}
                        onChange={handleCategoryFormChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., Appetizers, Main Course"
                        required
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="categoryIsActive"
                        checked={Boolean(categoryForm.isActive)}
                        onChange={handleCategoryFormChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="categoryIsActive" className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>

                    {/* Default Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isDefault"
                        id="categoryIsDefault"
                        checked={Boolean(categoryForm.isDefault)}
                        onChange={handleCategoryFormChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="categoryIsDefault" className="text-sm font-medium text-gray-700">
                        Default Category
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <Button
                        type="submit"
                        className="w-full justify-center sm:col-start-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        loading={isSavingCategory}
                        disabled={isSavingCategory}
                      >
                        {editingCategory ? 'Update Category' : 'Add Category'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3 w-full justify-center sm:mt-0 sm:col-start-1 cursor-pointer"
                        onClick={handleCloseCategoryModal}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuItems;
