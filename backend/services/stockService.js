// C:\Users\Ibnu\Project\smart-pos\backend\services\stockService.js

/**
 * @description Fungsi ini mengelola pembaruan stok untuk produk jadi dan bahan baku.
 * Ini adalah bagian perbaikan utama yang memastikan konsistensi stok.
 * @param {object} connection - Koneksi database.
 * @param {Array<object>} items - Daftar item dalam pesanan.
 * @param {number} factor - Faktor pengali untuk stok (1 untuk pesanan baru, -1 untuk pembatalan).
 * @param {boolean} validateOnly - Jika true, hanya memeriksa stok tanpa melakukan pembaruan.
 */
async function handleStockUpdate(connection, items, factor = 1, validateOnly = false) {
    for (const item of items) {
        // Mendapatkan product_id dari variant_id
        const [[variant]] = await connection.query('SELECT product_id FROM product_variants WHERE id = ?', [item.variantId || item.variant_id]);
        if (!variant) {
            throw new Error(`Varian produk dengan ID ${item.variantId || item.variant_id} tidak ditemukan.`);
        }
        const productId = variant.product_id;

        // Langkah 1: SELALU periksa dan kurangi/tambah stok produk jadi
        const [[product]] = await connection.query('SELECT name, stock FROM products WHERE id = ? FOR UPDATE', [productId]);
        if (!product) {
            throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
        }
        if (factor > 0 && product.stock < item.quantity) {
            throw new Error(`Stok untuk produk "${product.name}" tidak mencukupi.`);
        }
        if (!validateOnly) {
            await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity * factor, productId]);
        }

        // Langkah 2: JIKA produk memiliki resep, kurangi/tambah JUGA stok bahan bakunya
        const [recipeItems] = await connection.query('SELECT * FROM recipes WHERE product_id = ?', [productId]);
        if (recipeItems.length > 0) {
            for (const recipeItem of recipeItems) {
                const [[material]] = await connection.query('SELECT name, stock_quantity, unit FROM raw_materials WHERE id = ? FOR UPDATE', [recipeItem.raw_material_id]);
                if (!material) {
                    throw new Error(`Bahan baku dengan ID ${recipeItem.raw_material_id} tidak ditemukan.`);
                }
                const requiredQuantity = recipeItem.quantity_used * item.quantity;
                if (factor > 0 && material.stock_quantity < requiredQuantity) {
                    throw new Error(`Stok bahan baku "${material.name}" tidak cukup untuk membuat ${product.name}. Butuh ${requiredQuantity} ${material.unit}, tersedia ${material.stock_quantity} ${material.unit}.`);
                }
                if (!validateOnly) {
                    await connection.execute('UPDATE raw_materials SET stock_quantity = stock_quantity - ? WHERE id = ?', [requiredQuantity * factor, recipeItem.raw_material_id]);
                }
            }
        }
    }
}

module.exports = { handleStockUpdate };