// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\TopCustomersList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import GenericProductList from './GenericProductList';
import { FiUsers } from 'react-icons/fi';

function TopCustomersList({ loading, topCustomers = [] }) {
    return (
        <GenericProductList
            loading={loading}
            items={topCustomers}
            title="Pelanggan Teratas"
            icon={<FiUsers size={22} />}
            renderItemValue={(item) => `Rp ${new Intl.NumberFormat('id-ID').format(item.totalSpent)} (${item.totalOrders} order)`}
            renderItemLink={(item) => `/customers/${item.id}`}
            emptyMessage="Belum ada data pelanggan."
        />
    );
}

TopCustomersList.propTypes = {
    loading: PropTypes.bool.isRequired,
    topCustomers: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            totalSpent: PropTypes.number.isRequired,
            totalOrders: PropTypes.number.isRequired
        })
    )
};

export default React.memo(TopCustomersList);