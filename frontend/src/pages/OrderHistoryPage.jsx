import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';
import { getCachedOrders } from '../database/db';
import { OrderFilterBar } from '../components/orders/OrderFilterBar';
import { OrderTable } from '../components/orders/OrderTable';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import { Pagination } from '../components/common/Pagination';
import { exportToCSV } from '../utils/export';
import { NotificationToast } from '../components/common/NotificationToast';

export const OrderHistoryPage = ({ isOnline }) => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [orderStatus, setOrderStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    const params = {
      search,
      paymentStatus,
      orderStatus,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit: 10,
    };

    if (isOnline) {
      try {
        const data = await orderService.getOrders(params);
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch (err) {
        console.warn('Backend unavailable, falling back to local IndexedDB cache.');
        const cached = await getCachedOrders(params);
        setOrders(cached);
        setPagination({ total: cached.length, page: 1, limit: 10, totalPages: 1 });
      }
    } else {
      const cached = await getCachedOrders(params);
      setOrders(cached);
      setPagination({ total: cached.length, page: 1, limit: 10, totalPages: 1 });
    }
    setLoading(false);
  }, [search, paymentStatus, orderStatus, startDate, endDate, sortBy, sortOrder, isOnline]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = async () => {
    try {
      let dataToExport = orders;
      if (isOnline) {
        dataToExport = await orderService.exportOrders({ search, paymentStatus, orderStatus, startDate, endDate });
      }
      const headers = {
        externalOrderId: 'Order ID',
        customerName: 'Customer Name',
        merchantName: 'Merchant Store',
        orderDate: 'Order Date',
        totalAmount: 'Total Amount (PHP)',
        paymentMethod: 'Payment Method',
        paymentStatus: 'Payment Status',
        orderStatus: 'Order Status',
      };
      exportToCSV('TRAKZ_Orders', dataToExport, headers);
      setToast({ message: 'Orders exported to CSV successfully.', type: 'success' });
    } catch (e) {
      setToast({ message: 'Failed to export orders.', type: 'error' });
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <OrderFilterBar
        search={search}
        setSearch={setSearch}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        orderStatus={orderStatus}
        setOrderStatus={setOrderStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onRefresh={() => fetchOrders(pagination.page)}
        onExportCSV={handleExportCSV}
      />

      <OrderTable
        orders={orders}
        onSelectOrder={handleOpenDetail}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalRecords={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => fetchOrders(p)}
      />

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />

      {toast && (
        <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
