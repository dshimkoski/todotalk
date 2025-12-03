import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.task.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()

  console.log('✨ Creating users...')

  // Create users with hashed passwords
  const password = await bcrypt.hash('demo123', 10)

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password,
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      password,
    },
  })

  const charlie = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Davis',
      password,
    },
  })

  console.log('✨ Creating teams...')

  const team1 = await prisma.team.create({
    data: {
      name: 'Engineering',
      slug: 'engineering',
    },
  })

  const team2 = await prisma.team.create({
    data: {
      name: 'Product',
      slug: 'product',
    },
  })

  console.log('✨ Adding team members...')

  await prisma.teamMember.createMany({
    data: [
      { userId: alice.id, teamId: team1.id, role: 'admin' },
      { userId: bob.id, teamId: team1.id, role: 'member' },
      { userId: charlie.id, teamId: team1.id, role: 'member' },
      { userId: alice.id, teamId: team2.id, role: 'member' },
      { userId: charlie.id, teamId: team2.id, role: 'admin' },
    ],
  })

  console.log('✨ Creating tasks...')

  await prisma.task.createMany({
    data: [
      {
        title: 'Setup project infrastructure',
        description: 'Initialize Next.js project with TypeScript and Tailwind',
        status: 'done',
        priority: 'high',
        order: 0,
        teamId: team1.id,
        assigneeId: alice.id,
      },
      {
        title: 'Implement user authentication',
        description: 'Add NextAuth.js with credentials provider',
        status: 'in_progress',
        priority: 'high',
        order: 1,
        teamId: team1.id,
        assigneeId: bob.id,
      },
      {
        title: 'Design dashboard UI',
        description: 'Create mockups for the main dashboard',
        status: 'todo',
        priority: 'medium',
        order: 2,
        teamId: team1.id,
        assigneeId: charlie.id,
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated deployment',
        status: 'todo',
        priority: 'medium',
        order: 3,
        teamId: team1.id,
      },
      {
        title: 'Write product documentation',
        description: 'Document features and user flows',
        status: 'in_progress',
        priority: 'low',
        order: 0,
        teamId: team2.id,
        assigneeId: charlie.id,
      },
      {
        title: 'Conduct user research',
        description: 'Interview potential users about their needs',
        status: 'todo',
        priority: 'high',
        order: 1,
        teamId: team2.id,
        assigneeId: alice.id,
      },
    ],
  })

  console.log('✨ Creating messages...')

  await prisma.message.createMany({
    data: [
      {
        content:
          'Hey team! Just finished setting up the project. Ready to roll! 🚀',
        teamId: team1.id,
        authorId: alice.id,
      },
      {
        content: "Awesome work Alice! I'll start on the auth implementation.",
        teamId: team1.id,
        authorId: bob.id,
      },
      {
        content: 'Let me know if you need any help with the UI components!',
        teamId: team1.id,
        authorId: charlie.id,
      },
      {
        content:
          'Starting the product documentation. Will share a draft by EOD.',
        teamId: team2.id,
        authorId: charlie.id,
      },
      {
        content: "Perfect! I'll schedule some user interviews for next week.",
        teamId: team2.id,
        authorId: alice.id,
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('Demo accounts:')
  console.log('- alice@example.com (password: demo123)')
  console.log('- bob@example.com (password: demo123)')
  console.log('- charlie@example.com (password: demo123)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
