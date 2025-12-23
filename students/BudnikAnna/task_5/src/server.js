require('dotenv').config();

const { createApp } = require('./app');

const PORT = Number(process.env.PORT || 3000);

async function main() {
  const app = await createApp();

  app.listen(PORT, () => {
    console.log(`API is running on http://localhost:${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/docs`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
