// backend/utils/dateUtils.js
const getValidDateRange = (startDateStr, endDateStr) => {
    let startDate;
    let endDate;

    if (startDateStr) {
        startDate = new Date(startDateStr);
    } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
    }
    startDate.setHours(0, 0, 0, 0);

    if (endDateStr) {
        endDate = new Date(endDateStr);
    } else {
        endDate = new Date();
    }
    endDate.setHours(23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
    }
    
    const formatSqlDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return { 
        startDate: formatSqlDateTime(startDate),
        endDate: formatSqlDateTime(endDate)
    };
};

module.exports = { getValidDateRange };