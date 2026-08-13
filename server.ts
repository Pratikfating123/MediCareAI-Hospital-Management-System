import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Route Imports
import authRoutes from './src/backend/routes/authRoutes';
import userRoutes from './src/backend/routes/userRoutes';
import departmentRoutes from './src/backend/routes/departmentRoutes';
import doctorRoutes from './src/backend/routes/doctorRoutes';
import patientRoutes from './src/backend/routes/patientRoutes';
import appointmentRoutes from './src/backend/routes/appointmentRoutes';
import medicalRecordRoutes from './src/backend/routes/medicalRecordRoutes';
import prescriptionRoutes from './src/backend/routes/prescriptionRoutes';
import medicineRoutes from './src/backend/routes/medicineRoutes';
import inventoryRoutes from './src/backend/routes/inventoryRoutes';
import labRoutes from './src/backend/routes/labRoutes';
import billingRoutes from './src/backend/routes/billingRoutes';
import notificationRoutes from './src/backend/routes/notificationRoutes';
import reportRoutes from './src/backend/routes/reportRoutes';
import auditRoutes from './src/backend/routes/auditRoutes';
import aiRoutes from './src/backend/routes/aiRoutes';
import { errorHandler } from './src/backend/middleware/errorHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allowed for Vite preview
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'MediCare AI Hospital Management System',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

// Vite Integration
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🏥 MediCare AI Hospital Server running on port ${PORT}`);
  });
}

setupVite();
