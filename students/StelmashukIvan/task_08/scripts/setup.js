#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Setting up project for Lab 8...')

// Create necessary directories
const directories = [
  'tests/unit',
  'tests/integration',
  'tests/e2e',
  'tests/fixtures',
  '.github/workflows',
  'docker',
  'lighthouse/reports',
  'lighthouse/screenshots',
  '.husky',
  'scripts',
  'docs/api',
  'docs/deployment',
  'docs/testing',
  'configs',
]

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`📁 Created directory: ${dir}`)
  }
})

// Copy example environment files
const envExample = `# Application Configuration
VITE_API_URL=http://localhost:3001

# Docker
DOCKER_USERNAME=yourusername
DOCKER_PASSWORD=yourpassword

# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Lighthouse
LHCI_GITHUB_APP_TOKEN=your_github_token

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
`

const envLocal = `# Local Development
VITE_API_URL=http://localhost:3001
`

const envProduction = `# Production
VITE_API_URL=https://api.yourdomain.com
`

const envFiles = [
  { name: '.env.example', content: envExample },
  { name: '.env.local', content: envLocal },
  { name: '.env.production', content: envProduction },
]

envFiles.forEach(envFile => {
  if (!fs.existsSync(envFile.name)) {
    fs.writeFileSync(envFile.name, envFile.content)
    console.log(`📄 Created ${envFile.name}`)
  }
})

// Create example database file
const dbExample = {
  books: [
    {
      id: '1',
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction novel and cautionary tale.',
      publishedYear: 1949,
      genre: 'Dystopian',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
      rating: 4.5,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A novel about the serious issues of rape and racial inequality.',
      publishedYear: 1960,
      genre: 'Fiction',
      rating: 4.8,
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z',
    },
  ],
  reviews: [
    {
      id: '1',
      bookId: '1',
      author: 'John Doe',
      content: 'A timeless classic that remains relevant today.',
      rating: 5,
      createdAt: '2024-01-16T09:15:00Z',
    },
    {
      id: '2',
      bookId: '1',
      author: 'Jane Smith',
      content: 'Chilling and thought-provoking.',
      rating: 4,
      createdAt: '2024-01-17T11:45:00Z',
    },
  ],
}

if (!fs.existsSync('db.example.json')) {
  fs.writeFileSync('db.example.json', JSON.stringify(dbExample, null, 2))
  console.log('📄 Created db.example.json')
}

// Initialize Husky
console.log('🐶 Setting up Husky...')
try {
  execSync('npx husky install', { stdio: 'inherit' })
  
  // Make pre-commit executable
  const preCommitPath = path.join('.husky', 'pre-commit')
  if (fs.existsSync(preCommitPath)) {
    fs.chmodSync(preCommitPath, '755')
  }
  
  console.log('✅ Husky set up')
} catch (error) {
  console.error('❌ Error setting up Husky:', error.message)
}

// Install Playwright browsers
console.log('🌐 Installing Playwright browsers...')
try {
  execSync('npx playwright install chromium', { stdio: 'inherit' })
  console.log('✅ Playwright browsers installed')
} catch (error) {
  console.error('❌ Error installing Playwright:', error.message)
}

// Install Lighthouse CI
console.log('📊 Installing Lighthouse CI...')
try {
  execSync('npm install -g @lhci/cli', { stdio: 'inherit' })
  console.log('✅ Lighthouse CI installed')
} catch (error) {
  console.error('❌ Error installing Lighthouse CI:', error.message)
}

console.log('\n🎉 Setup completed!')
console.log('\nNext steps:')
console.log('1. Fill in your .env files based on .env.example')
console.log('2. Run tests: npm test')
console.log('3. Run Lighthouse: npm run lighthouse')
console.log('4. Build Docker image: npm run docker:build')