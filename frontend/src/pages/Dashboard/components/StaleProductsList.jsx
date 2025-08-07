// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\StaleProductsList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import GenericProductList from './GenericProductList';
import { FiLayers } from 'react-icons/fi';

function StaleProductsList({ loading, staleProducts = [] }) {
    return (
        <GenericProductList
            loading={loading}
            items={staleProducts}
            title="Produk Kurang Laku"
            icon={<FiLayers size={22} />}
            renderItemValue={(item) => `Stok: ${item.stock} (${item.lastSoldDate ? `Terjual ${new Date(item.lastSoldDate).toLocaleDateString('id-ID')}` : 'Belum Pernah Terjual'})`}
            emptyMessage="Semua produk Anda laris! Tidak ada produk yang tidak laku."
        />
    );
}

StaleProductsList.propTypes = {
    loading: PropTypes.bool.isRequired,
    staleProducts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            stock: PropTypes.number.isRequired,
            lastSoldDate: PropTypes.string
        })
    )
};

export default StaleProductsList;