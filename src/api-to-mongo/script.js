require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const axios = require('axios');

// Connect to MongoDB using MONGO_URI from the .env file
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Define a schema for product transactions
const productSchema = new mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: String
});

const ProductTransaction = mongoose.model('ProductTransaction', productSchema);

// Function to fetch data from API and save it to MongoDB
const fetchDataAndSave = async () => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        // Save each product to MongoDB
        await ProductTransaction.insertMany(products);

        console.log('Data successfully saved to MongoDB');
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    } finally {
        mongoose.connection.close(); // Close the connection once the data is saved
    }
};

// Fetch and save data
fetchDataAndSave();
