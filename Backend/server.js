require('dotenv').config();
const app = require('./src/app')

const connectDB = require('./src/db/db')

connectDB();

const server = app.listen(3000, () => {
    console.log('server is running on port 3000')
})
server.on('error', (err) => {
    console.error('Server error:', err.message);
});