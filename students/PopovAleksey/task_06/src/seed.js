const { sequelize, User, Task } = require('./models');
const bcrypt = require('bcrypt');

async function seed() {
  await sequelize.sync({ force: true });
  const p = await bcrypt.hash('password', 10);
  const u = await User.create({ username: 'alice', passwordHash: p });
  await Task.bulkCreate([
    { title: 'Событие 1', description: 'Описание 1', ownerId: u.id },
    { title: 'Событие 2', description: 'Описание 2', ownerId: u.id },
  ]);
  console.log('Seed done. username=alice password=password');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
