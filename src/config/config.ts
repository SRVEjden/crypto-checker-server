import dotenv from 'dotenv';
import { Config } from '../interfaces/types';
dotenv.config();

const config: Config = {
	redisPort: Number(process.env.REDIS_PORT),
	redisHost: process.env.REDIS_HOST || '127.0.0.1',
	port: Number(process.env.PORT),
	nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;
