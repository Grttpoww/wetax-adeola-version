// Test script for admin panel functionality
// Run with: node test-admin.js

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testAdminLogin() {
  console.log('🔐 Testing admin login...')

  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@wetax.ch',
        password: 'SuperAdmin123!',
      }),
    })

    const result = await response.json()

    if (response.ok && result.token) {
      console.log('✅ Admin login successful')
      console.log('🎫 Token:', result.token.substring(0, 20) + '...')
      return result.token
    } else {
      console.log('❌ Admin login failed:', result)
      return null
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message)
    return null
  }
}

async function testDashboard(token) {
  console.log('\n📊 Testing dashboard...')

  try {
    const response = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Dashboard loaded successfully')
      console.log('📈 User stats:', result.stats?.userStats)
      console.log('💰 Tax return stats:', result.stats?.taxReturnStats)
    } else {
      console.log('❌ Dashboard failed:', result)
    }
  } catch (error) {
    console.log('❌ Dashboard error:', error.message)
  }
}

async function testGetUsers(token) {
  console.log('\n👥 Testing get users...')

  try {
    const response = await fetch(`${BASE_URL}/admin/users?page=1&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Users loaded successfully')
      console.log('📊 Total users:', result.pagination?.total)
      console.log('👤 First user:', result.users?.[0]?.ahvNummer)
    } else {
      console.log('❌ Get users failed:', result)
    }
  } catch (error) {
    console.log('❌ Get users error:', error.message)
  }
}

async function testSystemHealth(token) {
  console.log('\n🏥 Testing system health...')

  try {
    const response = await fetch(`${BASE_URL}/admin/system/health`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ System health checked successfully')
      console.log('💚 Status:', result.status)
      console.log('⏱️ Uptime:', result.checks?.uptime)
    } else {
      console.log('❌ System health failed:', result)
    }
  } catch (error) {
    console.log('❌ System health error:', error.message)
  }
}

async function runTests() {
  console.log('🚀 Starting Admin Panel Tests')
  console.log('================================')

  // Test login
  const token = await testAdminLogin()

  if (!token) {
    console.log('\n❌ Cannot continue tests without valid token')
    return
  }

  // Test other endpoints
  await testDashboard(token)
  await testGetUsers(token)
  await testSystemHealth(token)

  console.log('\n🎉 Admin Panel Tests Complete!')
  console.log('================================')
}

// Run tests
runTests().catch(console.error)
