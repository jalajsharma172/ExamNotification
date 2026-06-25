import app from './src/app.js';
import env from './src/config/env.js';

const PORT = env.port || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Express Backend running on port ${PORT}`);
});
