const express = require('express');
const cors = require('cors');
// IMPORT THE ROUTE
const fileRoutes = require('./routes/fileRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

// USE THE ROUTE
// This means the URL will be: http://localhost:5000/api/files/upload
app.use('/api/files', fileRoutes); 

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});