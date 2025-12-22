import { AppDataSource } from './config/database';
import { Role, RoleName } from './entities/Role';
import { User } from './entities/User';
import bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  const roleRepository = AppDataSource.getRepository(Role);
  const userRepository = AppDataSource.getRepository(User);

  // Create default roles
  const roles = [
    {
      name: RoleName.ADMIN,
      canCreateClients: true,
      canEditAllClients: true,
      canDeleteClients: true,
      canCreateDeals: true,
      canEditAllDeals: true,
      canDeleteDeals: true,
    },
    {
      name: RoleName.MANAGER,
      canCreateClients: true,
      canEditAllClients: true,
      canDeleteClients: false,
      canCreateDeals: true,
      canEditAllDeals: true,
      canDeleteDeals: false,
    },
    {
      name: RoleName.USER,
      canCreateClients: true,
      canEditAllClients: false,
      canDeleteClients: false,
      canCreateDeals: true,
      canEditAllDeals: false,
      canDeleteDeals: false,
    },
  ];

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({ where: { name: roleData.name } });
    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`Created role: ${role.name}`);
    }
  }

  // Create admin user
  const adminRole = await roleRepository.findOne({ where: { name: RoleName.ADMIN } });
  const existingAdmin = await userRepository.findOne({ where: { email: 'admin@crm.com' } });

  if (!existingAdmin && adminRole) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = userRepository.create({
      email: 'admin@crm.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: adminRole,
    });

    await userRepository.save(adminUser);
    console.log('Created admin user: admin@crm.com / Admin123!');
  }

  console.log('Seeding completed!');
  await AppDataSource.destroy();
}

seed().catch(console.error);
