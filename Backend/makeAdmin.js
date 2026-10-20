require('dotenv').config();

const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            throw new Error('ADMIN_EMAIL is missing in .env');
        }

        const user = await userModel.findOne({
            email: adminEmail.toLowerCase()
        });

        if (!user) {
            throw new Error('Admin email account not found');
        }

        user.role = 'admin';
        await user.save();

        console.log(`Admin role assigned to ${user.email}`);
    } catch (error) {
        console.error('Failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

makeAdmin();