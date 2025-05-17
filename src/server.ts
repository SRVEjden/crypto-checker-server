import { App } from './app';
import config from './config/config';

const app = new App(config.redisPort, config.redisHost).getApp();

app.listen(config.port, () => {
	console.log(`Server started on http://localhost:${config.port}`);
});
