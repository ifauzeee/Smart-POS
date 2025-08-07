// C:\Users\Ibnu\Project\smart-pos\frontend\src\pages\Dashboard\components\StockInfoList.jsx

import React from 'react';
import PropTypes from 'prop-types';
import GenericProductList from './GenericProductList';
import { FiArchive } from 'react-icons/fi';

function StockInfoList({ loading, stockInfo = [] }) {
    const getStockColor = (stock) => {
        if (stock <= 10) return 'var(--red-color)';
        if (stock <= 40) return '#FFA500';
        return 'var(--green-color)';
    };

    return (
        <GenericProductList
            loading={loading}
            items={stockInfo}
            title="Informasi Stok"
            icon={<FiArchive size={22} />}
            renderItemValue={(item) => `${item.stock} unit`}
            emptyMessage="Tidak ada produk untuk ditampilkan."
            showImage
            getStockColor={getStockColor}
        />
    );
}

StockInfoList.propTypes = {
    loading: PropTypes.bool.isRequired,
    stockInfo: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            stock: PropTypes.number.isRequired,
            image_url: PropTypes.string
        })
    )
};

export default StockInfoList;