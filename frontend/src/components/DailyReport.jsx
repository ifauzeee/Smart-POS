// frontend/src/components/DailyReport.jsx
import React from 'react';

const DailyReport = React.forwardRef(({ data }, ref) => {
    if (!data) {
        return <div ref={ref} style={{ display: 'none' }}></div>;
    }

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
    });

    const formatCurrency = (value) => `Rp ${new Intl.NumberFormat('id-ID').format(value || 0)}`;

    return (
        <div ref={ref} className="printable-content">
            <style>
                {`
                    @media print {
                        @page {
                            size: A4;
                            margin: 20mm;
                        }
                        body * {
                            visibility: hidden;
                        }
                        .printable-content, .printable-content * {
                            visibility: visible;
                        }
                        .printable-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            font-family: 'Poppins', sans-serif;
                            color: #000;
                        }
                        h1, h2, h3 {
                            margin: 0;
                            padding: 0;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 15px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        .report-header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .summary-section {
                            margin-top: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                        }
                        .summary-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 5px 0;
                        }
                    }
                `}
            </style>
            
            <div className="report-header">
                <h1>Laporan Kinerja Harian</h1>
                <p>Periode: {formatDate(data.startDate)} - {formatDate(data.endDate)}</p>
            </div>

            <div className="summary-section">
                <h3>Ringkasan Umum</h3>
                <div className="summary-item">
                    <span>Total Pendapatan:</span>
                    <strong>{formatCurrency(data.totalRevenue)}</strong>
                </div>
                <div className="summary-item">
                    <span>Total Perkiraan Laba:</span>
                    <strong>{formatCurrency(data.totalProfit)}</strong>
                </div>
                <div className="summary-item">
                    <span>Jumlah Transaksi:</span>
                    <strong>{data.totalTransactions}</strong>
                </div>
                <div className="summary-item">
                    <span>Total Produk Terjual:</span>
                    <strong>{data.totalSoldUnits} unit</strong>
                </div>
                <div className="summary-item">
                    <span>Pelanggan Baru:</span>
                    <strong>{data.newCustomers} orang</strong>
                </div>
            </div>

            <h3>Produk Terlaris (Berdasarkan Kuantitas)</h3>
            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Nama Produk</th>
                        <th>Total Terjual</th>
                    </tr>
                </thead>
                <tbody>
                    {data.topProducts && data.topProducts.length > 0 ? (
                        data.topProducts.map((product, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{product.name}</td>
                                <td>{product.totalSold} unit</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>Tidak ada data produk terlaris pada periode ini.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
});

export default DailyReport;