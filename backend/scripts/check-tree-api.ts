import User from '../models/User';
import mongoose from 'mongoose';
import { getTree } from '../controllers/genealogyController';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mlm';

const checkApi = async () => {
  await mongoose.connect(MONGO_URI);
  
  // Mock Req/Res
  const req = { query: {} } as Request;
  const res = {
    json: (data: any) => {
      console.log('API Response Root Attributes:', JSON.stringify(data.attributes, null, 2));
      process.exit(0);
    },
    status: (code: number) => ({ json: (d: any) => console.log('Error', code, d) })
  } as unknown as Response;

  try {
     await getTree(req, res);
  } catch (e) {
     console.error(e);
  }
};

checkApi();
