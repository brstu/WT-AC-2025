#!/usr/bin/env node

const http = require('http')
const https = require('https')
const { execSync } = require('child_process')

const SERVICES = [
  {
    name: 'Development Server',
    url: 'http://localhost:3000',
    method: 'GET',
    timeout: 5000,
  },
  {
    name: 'JSON Server API',
    url: 'http://localhost:3001/books',
    method: 'GET',
    timeout: 5000,
  },
]

async function checkService(service) {
  return new Promise((resolve) => {
    const { url, method, timeout } = service
    const protocol = url.startsWith('https') ? https : http

    const req = protocol.request(url, { method, timeout }, (res) => {
      const isOk = res.statusCode >= 200 && res.statusCode < 300
      resolve({
        service: service.name,
        status: isOk ? '✅ OK' : '❌ FAILED',
        statusCode: res.statusCode,
        message: isOk ? 'Service is responding correctly' : `Received status code: ${res.statusCode}`,
      })
    })

    req.on('error', (error) => {
      resolve({
        service: service.name,
        status: '❌ ERROR',
        statusCode: null,
        message: error.message,
      })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({
        service: service.name,
        status: '⏰ TIMEOUT',
        statusCode: null,
        message: `Request timed out after ${timeout}ms`,
      })
    })

    req.end()
  })
}

async function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'pipe' })
    return {
      service: 'Docker',
      status: '✅ OK',
      statusCode: null,
      message: 'Docker is installed and available',
    }
  } catch (error) {
    return {
      service: 'Docker',
      status: '❌ ERROR',
      statusCode: null,
      message: 'Docker is not installed or not in PATH',
    }
  }
}

async function checkNodeVersion() {
  try {
    const version = process.version
    const requiredMajor = 18
    const currentMajor = parseInt(version.slice(1).split('.')[0])
    const isOk = currentMajor >= requiredMajor

    return {
      service: 'Node.js',
      status: isOk ? '✅ OK' : '❌ FAILED',
      statusCode: null,
      message: isOk ? `Version ${version} meets requirement (>=${requiredMajor})` : `Version ${version} does not meet requirement (>=${requiredMajor})`,
    }
  } catch (error) {
    return {
      service: 'Node.js',
      status: '❌ ERROR',
      statusCode: null,
      message: `Error checking Node version: ${error.message}`,
    }
  }
}

async function runHealthChecks() {
  console.log('🏥 Running health checks...\n')

  const checks = [
    ...SERVICES.map(checkService),
    checkDocker(),
    checkNodeVersion(),
  ]

  const results = await Promise.all(checks)

  // Print results
  results.forEach((result) => {
    console.log(`${result.status} ${result.service}`)
    console.log(`   ${result.message}`)
    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`)
    }
    console.log()
  })

  // Summary
  const failed = results.filter(r => r.status.includes('❌') || r.status.includes('⏰'))
  if (failed.length > 0) {
    console.log(`❌ ${failed.length} service(s) failed`)
    process.exit(1)
  } else {
    console.log('✅ All services are healthy')
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  runHealthChecks().catch(console.error)
}

module.exports = { runHealthChecks }