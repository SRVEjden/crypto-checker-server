"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    redisPort: Number(process.env.REDIS_PORT),
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV || 'development',
};
exports.default = config;
