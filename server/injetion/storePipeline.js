const insertSales = require("../etl/loader");

async function processRow(row) {
    await insertSales(row);
}
