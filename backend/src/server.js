import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🍃 MongoDB Atlas Connected Successfully!');
} catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
}

// Start Express server
app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/v1/health`);
});
