
// const apiBaseUrl = process.env.REACT_APP_API_URL
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, TextField, MenuItem } from '@mui/material';
import axios from 'axios';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'title', headerName: 'Title', width: 200 },
  { field: 'description', headerName: 'Description', width: 200 },
  { field: 'price', headerName: 'Price', width: 150 },
  { field: 'category', headerName: 'Category', width: 200 },
  { field: 'sold', headerName: 'Sold', width: 150 },
  { field: 'image', headerName: 'Image', width: 200 }
];

const months = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [month, setMonth] = useState('03'); // Default to March

  useEffect(() => {
    fetchTransactions();
  }, [month, page, searchTerm]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL="http://localhost:5173"}/api/transactions`, {
        params: {
          month,
          page,
          search: searchTerm,
        },
      });
      setTransactions(response.data.data); // Map data if necessary
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  return (
    <Box sx={{ height: 400, width: '100%', padding: 2 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {months.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <DataGrid
        rows={transactions}
        columns={columns}
        pageSize={10}
        checkboxSelection
        onPageChange={(newPage) => setPage(newPage + 1)}
      />
    </Box>
  );
};

export default TransactionsTable;
