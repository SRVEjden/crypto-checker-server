"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = __importDefault(require("./config/config"));
const app = new app_1.App(config_1.default.redisPort, config_1.default.redisHost).getApp();
app.listen(config_1.default.port, () => {
    console.log(`Server started on http://localhost:${config_1.default.port}`);
});
