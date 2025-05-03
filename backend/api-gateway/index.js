import express from 'express';
import healthcheckRouter from './app/routes/healthcheck.routes.js';

const app = express();

app.use(express.json());
app.use('/api/v1/healthcheck', healthcheckRouter);

app.listen(3000, () => {
  console.log('Server is running on port: 3000');
});