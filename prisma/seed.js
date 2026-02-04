const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // 1. Upsert the Group
  // We don't create a 'creator' relation here to keep it simple and avoid unique constraint errors on rerun
  const group = await prisma.group.upsert({
    where: { id: 'g1' },
    update: {},
    create: {
      id: 'g1',
      name: 'Demo Group',
      // We must connect to a creator. We'll create one inline or expect one.
      // For safety in this specific schema, let's create the admin user first.
      creator: {
        create: {
            email: "admin@demo.com",
            name: "Admin",
        }
      }
    },
  })
  console.log('Ensured Group "g1" exists')

  // 2. Create Users and Connect to Group
  const usersData = [
    { id: 'u1', name: 'Alice', email: 'alice@demo.com' },
    { id: 'u2', name: 'Bob', email: 'bob@demo.com' },
    { id: 'u3', name: 'Charlie', email: 'charlie@demo.com' },
    { id: 'u4', name: 'Diana', email: 'diana@demo.com' },
    { id: 'u5', name: 'Shivam', email: 'shivam@demo.com' },
  ]

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        // If user exists, ensure they are connected to the group
        groups: {
            connect: { id: 'g1' }
        }
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        groups: {
            connect: { id: 'g1' }
        }
      },
    })
  }
  console.log('Seeded Users and connected them to Group g1')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })