require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { buildOpenApiSpec } = require('./swagger');

async function main() {
  const spec = buildOpenApiSpec();
  const outPath = path.resolve(process.cwd(), 'openapi.json');
  await fs.writeFile(outPath, JSON.stringify(spec, null, 2), 'utf-8');
  console.log(`openapi.json generated: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
