import { PrismaClient } from '@prisma/client';
import { loggingMiddleware } from '../middlewares/loggingMiddleware.js';

const prisma = new PrismaClient();
prisma.$use(loggingMiddleware);

export default prisma;