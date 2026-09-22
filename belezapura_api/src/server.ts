import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { routes } from './infrastructure/http/routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Usar rotas definidas
app.use('/api', routes);

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
