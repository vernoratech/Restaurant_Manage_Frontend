import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { BsQrCodeScan } from 'react-icons/bs';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import QRCodeModal from '../../components/QRCodeModal';

const Tables = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantData } = location.state || {};

  console.log("restaurantData", restaurantData);

  // State for tables and UI
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRTable, setSelectedQRTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 2,
    status: 'available', // available, occupied, reserved, out-of-service
    location: '',
    description: ''
  });

  // Load tables
  useEffect(() => {
    const loadTables = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch tables from your API
        // const response = await fetch(`/api/restaurants/${user.resId}/tables`);
        // const data = await response.json();

        // Mock data for demonstration
        const mockTables = [
          { id: '1', tableNumber: 'T-01', capacity: 4, status: 'available', location: 'Main Hall', description: 'Window view' },
          { id: '2', tableNumber: 'T-02', capacity: 6, status: 'occupied', location: 'Main Hall', description: 'Center table' },
          { id: '3', tableNumber: 'T-03', capacity: 2, status: 'reserved', location: 'Terrace', description: 'Outdoor seating' },
        ];

        setTables(mockTables);
      } catch (error) {
        console.error('Error loading tables:', error);
        toast.error('Failed to load tables');
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, [user, restaurantData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tableNumber) {
      toast.error('Table number is required');
      return;
    }

    try {
      if (isEditing) {
        // Update existing table
        setTables(prevTables =>
          prevTables.map(table =>
            table.id === isEditing ? { ...formData, id: isEditing } : table
          )
        );
        toast.success('Table updated successfully');
      } else {
        // Add new table
        const newTable = {
          ...formData,
          id: Date.now().toString()
        };
        setTables(prevTables => [...prevTables, newTable]);
        toast.success('Table added successfully');
      }

      // Reset form and close modal
      handleCloseModal();
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Failed to save table');
    }
  };

  // Handle edit
  const handleEdit = (table) => {
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      location: table.location,
      description: table.description
    });
    setIsEditing(table.id);
    setIsAddModalOpen(true);
  };

  const handleOpenQRModal = (table) => {
    setSelectedQRTable(table);
    setIsQRModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedQRTable(null);
  };

  // Handle delete
  const handleDelete = (tableId) => {
    if (window.confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      setTables(tables.filter(table => table.id !== tableId));
      toast.success('Table deleted successfully');
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditing(null);
    setFormData({
      tableNumber: '',
      capacity: 2,
      status: 'available',
      location: '',
      description: ''
    });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'available':
        return `${baseStyle} bg-green-100 text-green-800`;
      case 'occupied':
        return `${baseStyle} bg-red-100 text-red-800`;
      case 'reserved':
        return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case 'out-of-service':
        return `${baseStyle} bg-gray-100 text-gray-800`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col">
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <FiArrowLeft className="-ml-0.5 mr-2 h-4 w-4" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Table Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your restaurant tables and seating arrangements
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center cursor-pointer"
              >
                <FiPlus className="mr-2" /> Add New Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tables added yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new table.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                Add Table
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{table.tableNumber}</div>
                      {table.description && (
                        <div className="text-sm text-gray-500">{table.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{table.capacity} {table.capacity === 1 ? 'person' : 'people'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(table.status)}>
                        {table.status.charAt(0).toUpperCase() + table.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.location || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenQRModal(table)}
                        className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                        title="Generate QR code"
                      >
                        <BsQrCodeScan className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleEdit(table)}
                        className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                        title="Edit table"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(table.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Delete table"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Table Modal */}
      {isAddModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={handleCloseModal}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Content */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-50">
              {/* Close Button */}
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
                  onClick={handleCloseModal}
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  {/* Modal Header */}
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEditing ? 'Edit Table' : 'Add New Table'}
                  </h3>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Table Number */}
                    <div>
                      <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700">
                        Table Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="tableNumber"
                        id="tableNumber"
                        value={formData.tableNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., T-01"
                        required
                      />
                    </div>

                    {/* Capacity */}
                    <div>
                      <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                        Capacity
                      </label>
                      <select
                        id="capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
                        <option value="out-of-service">Out of Service</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., Main Hall, Terrace, etc."
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Any additional details about the table"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <Button
                        type="submit"
                        className="w-full justify-center sm:col-start-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      >
                        <FiSave className="-ml-1 mr-2 h-5 w-5" />
                        {isEditing ? 'Update Table' : 'Add Table'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3 w-full justify-center sm:mt-0 sm:col-start-1 cursor-pointer"
                        onClick={handleCloseModal}
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

      <QRCodeModal
        isOpen={isQRModalOpen}
        table={selectedQRTable}
        onClose={handleCloseQRModal}
        restaurantData={restaurantData}
      />


    </div>
  );
};

export default Tables;
