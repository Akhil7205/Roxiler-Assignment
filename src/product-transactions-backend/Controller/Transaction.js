const axios = require('axios');
const Transaction = require('./models/transaction');

// Fetch data from the third-party API and initialize the database
const fetchDataAndInitializeDB = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        // Seed data into MongoDB
        await Transaction.deleteMany({});
        await Transaction.insertMany(transactions);

        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all transactions with search and pagination
const getAllTransactions = async (req, res) => {
    const { page = 1, perPage = 10, search = '' } = req.query;

    const query = {
        $or: [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { price: { $regex: search } },
        ]
    };

    const transactions = await Transaction.find(query)
        .limit(perPage)
        .skip((page - 1) * perPage);
    const total = await Transaction.countDocuments(query);

    res.json({ transactions, total });
};

// Get statistics for a selected month
const getStatistics = async (req, res) => {
    const month = req.params.month;
    const startDate = new Date(`2023-${month}-01`);
    const endDate = new Date(`2023-${month + 1}-01`);

    const totalSold = await Transaction.countDocuments({ sold: true, dateOfSale: { $gte: startDate, $lt: endDate } });
    const totalNotSold = await Transaction.countDocuments({ sold: false, dateOfSale: { $gte: startDate, $lt: endDate } });
    const totalSales = await Transaction.aggregate([
        { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: null, totalAmount: { $sum: '$price' } } }
    ]);

    res.json({
        totalSold,
        totalNotSold,
        totalSales: totalSales[0]?.totalAmount || 0
    });
};

// Get bar chart data
const getBarChartData = async (req, res) => {
    const month = req.params.month;
    const startDate = new Date(`2023-${month}-01`);
    const endDate = new Date(`2023-${month + 1}-01`);

    const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Infinity }
    ];

    const results = await Promise.all(priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
            price: { $gte: range.min, $lte: range.max },
            dateOfSale: { $gte: startDate, $lt: endDate }
        });
        return { range: `${range.min}-${range.max}`, count };
    }));

    res.json(results);
};

// Get pie chart data
const getPieChartData = async (req, res) => {
    const month = req.params.month;
    const startDate = new Date(`2023-${month}-01`);
    const endDate = new Date(`2023-${month + 1}-01`);

    const categories = await Transaction.aggregate([
        { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json(categories);
};

// Get combined data from all APIs
const getCombinedData = async (req, res) => {
    const month = req.params.month;
    const statistics = await getStatistics(month);
    const barChartData = await getBarChartData(month);
    const pieChartData = await getPieChartData(month);

    res.json({ statistics, barChartData, pieChartData });
};

module.exports = {
    fetchDataAndInitializeDB,
    getAllTransactions,
    getStatistics,
    getBarChartData,
    getPieChartData,
    getCombinedData
};
