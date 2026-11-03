import React, { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/paymentService';
import { getCachedPayments } from '../database/db';
import { PaymentSummaryCards } from '../components/payments/PaymentSummaryCards';
import { PaymentFilterBar } from '../components/payments/PaymentFilterBar';
import { PaymentTable } from '../components/payments/PaymentTable';
import { PaymentDetailModal } from '../components/payments/PaymentDetailModal';
import { Pagination } from '../components/common/Pagination';
import { exportToCSV } from '../utils/export';
import { NotificationToast } from '../components/common/NotificationToast';

export const PaymentHistoryPage = ({ isOnline }) => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Selected Payment Modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchPaymentsData = useCallback(async (page = 1) => {
    setLoading(true);
    const params = {
      search,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit: 10,
    };

    if (isOnline) {
      try {
        const [pData, pStats] = await Promise.all([
          paymentService.getPayments(params),
          paymentService.getStatistics(),
        ]);
        setPayments(pData.payments);
        setPagination(pData.pagination);
        setStats(pStats);
      } catch (err) {
        console.warn('Backend unavailable, reading payments from local cache.');
        const cached = await getCachedPayments(params);
        setPayments(cached);
        setPagination({ total: cached.length, page: 1, limit: 10, totalPages: 1 });
      }
    } else {
      const cached = await getCachedPayments(params);
      setPayments(cached);
      setPagination({ total: cached.length, page: 1, limit: 10, totalPages: 1 });
    }
    setLoading(false);
  }, [search, paymentMethod, paymentStatus, startDate, endDate, sortBy, sortOrder, isOnline]);

  useEffect(() => {
    fetchPaymentsData(1);
  }, [fetchPaymentsData]);

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
      let dataToExport = payments;
      if (isOnline) {
        dataToExport = await paymentService.exportPayments({ search, paymentMethod, paymentStatus, startDate, endDate });
      }
      const headers = {
        externalPaymentId: 'Transaction ID',
        externalOrderId: 'Order ID',
        customerName: 'Customer',
        merchantName: 'Merchant Store',
        paymentDate: 'Payment Date',
        paymentMethod: 'Payment Method',
        referenceNumber: 'Reference Number',
        amount: 'Amount (PHP)',
        paymentStatus: 'Status',
      };
      exportToCSV('TRAKZ_Payments', dataToExport, headers);
      setToast({ message: 'Payment transactions exported to CSV.', type: 'success' });
    } catch (e) {
      setToast({ message: 'Failed to export payment records.', type: 'error' });
    }
  };

  const handleOpenDetail = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PaymentSummaryCards stats={stats} />

      <PaymentFilterBar
        search={search}
        setSearch={setSearch}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onRefresh={() => fetchPaymentsData(pagination.page)}
        onExportCSV={handleExportCSV}
      />

      <PaymentTable
        payments={payments}
        onSelectPayment={handleOpenDetail}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalRecords={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => fetchPaymentsData(p)}
      />

      <PaymentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payment={selectedPayment}
      />

      {toast && (
        <NotificationToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
