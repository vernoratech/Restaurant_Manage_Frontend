import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiUpload, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Skeleton from '../Skeleton/Skeleton';

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
  
  // State for add item modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'appetizers',
    isAvailable: true,
    imageUrl: ''
  });

  // Sample categories
  const categories = [
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'main-course', name: 'Main Course' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'beverages', name: 'Beverages' },
  ];

  // Food image URLs for different categories
  const foodImages = {
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
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image selection
  const handleImageSelect = (category) => {
    const images = foodImages[category] || [];
    const randomImage = images[Math.floor(Math.random() * images.length)] || '';
    setNewItem(prev => ({
      ...prev,
      imageUrl: randomImage,
      category
    }));
  };

  // Handle form submission
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, you would make an API call here
    const newMenuItem = {
      ...newItem,
      _id: Date.now().toString(),
      price: parseFloat(newItem.price).toFixed(2)
    };

    setMenuItems(prev => [newMenuItem, ...prev]);
    setFilteredItems(prev => [newMenuItem, ...prev]);
    
    // Reset form and close modal
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: 'appetizers',
      isAvailable: true,
      imageUrl: ''
    });
    
    setIsAddItemModalOpen(false);
    toast.success('Menu item added successfully!');
  };

  // Function to get a random image for a category
  const getRandomImage = (category) => {
    const images = foodImages[category] || [];
    return images[Math.floor(Math.random() * images.length)] || 'https://via.placeholder.com/300x200?text=No+Image';
  };

  // Load menu items (using mock data)
  useEffect(() => {
    const loadMenuItems = () => {
      try {
        setIsLoading(true);
        
        // If we're creating a new item, skip loading existing items
        if (isNewItem) {
          setMenuItems([]);
          setFilteredItems([]);
          setIsLoading(false);
          return;
        }
        
        // Simulate API call with timeout
        const timer = setTimeout(() => {
          // Mock data with specific items as requested
          const mockMenuItems = [
            {
              _id: 'item-1',
              name: 'Menu Item 1',
              description: 'Delicious menu item number 1 with amazing flavors',
              price: '18.74',
              category: 'beverages',
              isAvailable: false,
              imageUrl: getRandomImage('beverages'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-2',
              name: 'Menu Item 2',
              description: 'Delicious menu item number 2 with amazing flavors',
              price: '20.22',
              category: 'main-course',
              isAvailable: true,
              imageUrl: getRandomImage('main-course'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-3',
              name: 'Menu Item 3',
              description: 'Delicious menu item number 3 with amazing flavors',
              price: '22.91',
              category: 'appetizers',
              isAvailable: true,
              imageUrl: getRandomImage('appetizers'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-4',
              name: 'Menu Item 4',
              description: 'Delicious menu item number 4 with amazing flavors',
              price: '12.20',
              category: 'desserts',
              isAvailable: true,
              imageUrl: getRandomImage('desserts'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-5',
              name: 'Menu Item 5',
              description: 'Delicious menu item number 5 with amazing flavors',
              price: '22.78',
              category: 'appetizers',
              isAvailable: true,
              imageUrl: getRandomImage('appetizers'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-6',
              name: 'Menu Item 6',
              description: 'Delicious menu item number 6 with amazing flavors',
              price: '14.59',
              category: 'desserts',
              isAvailable: false,
              imageUrl: getRandomImage('desserts'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-7',
              name: 'Menu Item 7',
              description: 'Delicious menu item number 7 with amazing flavors',
              price: '9.02',
              category: 'desserts',
              isAvailable: true,
              imageUrl: getRandomImage('desserts'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-8',
              name: 'Menu Item 8',
              description: 'Delicious menu item number 8 with amazing flavors',
              price: '17.17',
              category: 'beverages',
              isAvailable: true,
              imageUrl: getRandomImage('beverages'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-9',
              name: 'Menu Item 9',
              description: 'Delicious menu item number 9 with amazing flavors',
              price: '21.84',
              category: 'main-course',
              isAvailable: true,
              imageUrl: getRandomImage('main-course'),
              createdAt: new Date().toISOString(),
            },
            {
              _id: 'item-10',
              name: 'Menu Item 10',
              description: 'Delicious menu item number 10 with amazing flavors',
              price: '17.47',
              category: 'desserts',
              isAvailable: true,
              imageUrl: getRandomImage('desserts'),
              createdAt: new Date().toISOString(),
            },
            // Add 15 more items to make it 25 total
            ...Array.from({ length: 15 }, (_, i) => {
              const category = categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id;
              const itemNum = i + 11;
              return {
                _id: `item-${itemNum}`,
                name: `Menu Item ${itemNum}`,
                description: `Delicious menu item number ${itemNum} with amazing flavors`,
                price: (Math.random() * 20 + 5).toFixed(2),
                category: category,
                isAvailable: Math.random() > 0.3,
                imageUrl: getRandomImage(category),
                createdAt: new Date().toISOString(),
              };
            })
          ];
          
          setMenuItems(mockMenuItems);
          setFilteredItems(mockMenuItems);
          setIsLoading(false);
        }, 500); // Simulate network delay
        
        return () => clearTimeout(timer);
        
      } catch (error) {
        console.error('Error loading menu items:', error);
        toast.error('Failed to load menu items');
        setIsLoading(false);
      }
    };

    loadMenuItems();
  }, [isNewItem]);

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
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        // Here you would typically call your API to delete the item
        // await fetch(`/api/restaurants/${restaurantData._id}/menu/${itemId}`, {
        //   method: 'DELETE',
        // });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state
        setMenuItems(prevItems => prevItems.filter(item => item._id !== itemId));
        toast.success('Menu item deleted successfully');
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  // Toggle item availability
  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      // Here you would typically call your API to update the item
      // const response = await fetch(`/api/restaurants/${restaurantData._id}/menu/${itemId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isAvailable: !currentStatus }),
      // });
      // const updatedItem = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update local state
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId
            ? { ...item, isAvailable: !currentStatus }
            : item
        )
      );
      
      toast.success(`Item ${currentStatus ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast.error('Failed to update item availability');
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
              onClick={() => toast.info('Category management is coming soon!')}
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
                setNewItem({
                  name: '',
                  description: '',
                  price: '',
                  category: 'appetizers',
                  isAvailable: true,
                  imageUrl: ''
                });
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
                setNewItem({
                  name: '',
                  description: '',
                  price: '',
                  category: 'appetizers',
                  isAvailable: true,
                  imageUrl: ''
                });
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
              <li key={item._id} className="hover:bg-gray-50">
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
                            {categories.find(cat => cat.id === item.category)?.name || 'Uncategorized'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                      <p className="text-lg font-semibold text-gray-900">
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => toggleAvailability(item._id, item.isAvailable)}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${item.isAvailable ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                        <button
                          onClick={() => navigate(`/menu/items/${item._id}/edit`)}
                          className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiEdit2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
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
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="category"
                          value={newItem.category}
                          onChange={(e) => {
                            handleNewItemChange(e);
                            handleImageSelect(e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {categories.map((category) => (
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
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
