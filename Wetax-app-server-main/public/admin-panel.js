console.log('Admin panel script loading...')
let authToken = null
const API_BASE = 'https://wetaxorg.ch/api/admin'

async function makeRequest(endpoint, options = {}) {
  const url = API_BASE + endpoint
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
  }

  console.log('Making request to:', url, 'with config:', config)

  try {
    const response = await fetch(url, config)
    console.log('Response status:', response.status, response.statusText)

    // Read as text first to avoid JSON parse errors on empty/204/non-JSON
    const rawText = await response.text()
    console.log('Raw response text:', rawText)

    let parsed
    try {
      parsed = rawText ? JSON.parse(rawText) : null
    } catch (e) {
      console.log('JSON parse error, using raw text:', e)
      // Fallback to text when not valid JSON
      parsed = rawText
    }

    if (!response.ok) {
      const msg =
        (parsed && typeof parsed === 'object' && parsed.message) ||
        (typeof parsed === 'string' && parsed) ||
        'Request failed'
      console.error('Request failed:', response.status, msg)
      throw new Error(`HTTP ${response.status}: ${msg}`)
    }

    console.log('Successful response:', parsed)
    return { success: true, data: parsed }
  } catch (error) {
    console.error('Request error:', error)
    return { success: false, error: error.message || String(error) }
  }
}

function showResult(elementId, result, data = null) {
  const element = document.getElementById(elementId)

  // Clear existing classes and add Bootstrap alert classes
  element.className = `alert ${result.success ? 'alert-success' : 'alert-danger'}`
  element.style.display = 'block'

  if (result.success) {
    if (data) {
      if (typeof data === 'object') {
        element.innerHTML = `<div><strong>Success!</strong></div><pre style="margin-top: 10px; white-space: pre-wrap;">${JSON.stringify(
          data,
          null,
          2,
        )}</pre>`
      } else {
        element.textContent = data
      }
    } else {
      element.innerHTML = '<strong>Success!</strong>'
    }
  } else {
    element.innerHTML = `<strong>Error:</strong> ${result.error}`
  }
}

async function adminLogin() {
  console.log('adminLogin function called')
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const result = await makeRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (result.success) {
    authToken = result.data.token

    // Store login credentials and token in localStorage
    localStorage.setItem('wetax_admin_token', authToken)
    localStorage.setItem('wetax_admin_email', email)
    localStorage.setItem('wetax_admin_password', password)

    console.log('Login successful, hiding login section and showing admin section')

    // Force hide login section and show admin section
    const loginSection = document.getElementById('loginSection')
    const adminSection = document.getElementById('adminSection')

    if (loginSection) {
      loginSection.style.display = 'none'
      loginSection.classList.add('hidden')
      console.log('Login section hidden')
    }

    if (adminSection) {
      adminSection.style.display = 'flex'
      adminSection.classList.remove('hidden')
      console.log('Admin section shown')
    }

    // Show dashboard section and load dashboard data
    setTimeout(() => {
      console.log('Attempting to show dashboard section')

      // First, hide all content sections
      document.querySelectorAll('.content-section').forEach((section) => {
        section.style.display = 'none'
      })

      // Then show the dashboard section
      const dashboardElement = document.getElementById('dashboard')
      if (dashboardElement) {
        dashboardElement.style.display = 'block'
        console.log('Dashboard element display set to block')
      } else {
        console.error('Dashboard element not found!')
      }

      // Call showSection if available for additional navigation updates
      // if (typeof showSection === 'function') {
      //   console.log('showSection function is available, calling it')
      //   showSection('dashboard')
      // }

      console.log('Loading dashboard data')
      loadDashboard()
    }, 100)

    showResult('loginResult', result, { message: 'Login successful!', user: result.data.user })
  } else {
    showResult('loginResult', result)
  }
}

// Function to load stored credentials and auto-fill login form
function loadStoredCredentials() {
  const storedEmail = localStorage.getItem('wetax_admin_email')
  const storedPassword = localStorage.getItem('wetax_admin_password')
  const storedToken = localStorage.getItem('wetax_admin_token')

  if (storedEmail && storedPassword) {
    document.getElementById('email').value = storedEmail
    document.getElementById('password').value = storedPassword
    console.log('Stored credentials loaded into form')
  }

  if (storedToken) {
    console.log('Found stored token, attempting auto-login')
    autoLogin(storedToken)
  }
}

// Function to attempt auto-login with stored token
async function autoLogin(token) {
  try {
    // Test if the token is still valid
    const response = await fetch('https://wetaxorg.ch/api/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      console.log('Token is valid, auto-logging in')
      authToken = token

      // Force hide login section and show admin section
      const loginSection = document.getElementById('loginSection')
      const adminSection = document.getElementById('adminSection')

      if (loginSection) {
        loginSection.style.display = 'none'
        loginSection.classList.add('hidden')
        console.log('Auto-login: Login section hidden')
      }

      if (adminSection) {
        adminSection.style.display = 'flex'
        adminSection.classList.remove('hidden')
        console.log('Auto-login: Admin section shown')
      }

      setTimeout(() => {
        console.log('Auto-login: Attempting to show dashboard section')

        // First, hide all content sections
        document.querySelectorAll('.content-section').forEach((section) => {
          section.style.display = 'none'
        })

        // Then show the dashboard section
        const dashboardElement = document.getElementById('dashboard')
        if (dashboardElement) {
          dashboardElement.style.display = 'block'
          console.log('Auto-login: Dashboard element display set to block')
        } else {
          console.error('Auto-login: Dashboard element not found!')
        }

        // Call showSection if available for additional navigation updates
        // if (typeof showSection === 'function') {
        //   showSection('dashboard')
        // }

        loadDashboard()
      }, 100)
    } else {
      console.log('Token is invalid, clearing stored credentials')
      clearStoredCredentials()
    }
  } catch (error) {
    console.log('Auto-login failed:', error)
    clearStoredCredentials()
  }
}

// Function to clear stored credentials
function clearStoredCredentials() {
  localStorage.removeItem('wetax_admin_token')
  localStorage.removeItem('wetax_admin_email')
  localStorage.removeItem('wetax_admin_password')
}

async function loadDashboard() {
  console.log('loadDashboard called')
  const result = await makeRequest('/dashboard')
  console.log('Dashboard API result:', result)

  if (result.success) {
    const stats = result.data.stats
    console.log('Dashboard stats:', stats)
    const statsHtml = `
          <div class="col-md-3">
            <div class="card text-center p-3">
              <h5>Total Users</h5>
              <h3 class="text-primary">${(stats.userStats && stats.userStats.totalUsers) || 0}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center p-3">
              <h5>Active Users</h5>
              <h3 class="text-success">${(stats.userStats && stats.userStats.activeUsers) || 0}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center p-3">
              <h5>Tax Returns</h5>
              <h3 class="text-info">${
                (stats.taxReturnStats && stats.taxReturnStats.totalReturns) || 0
              }</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center p-3">
              <h5>Completed Returns</h5>
              <h3 class="text-warning">${
                (stats.taxReturnStats && stats.taxReturnStats.completedReturns) || 0
              }</h3>
            </div>
          </div>
        `
    console.log('Setting dashboard stats HTML')
    document.getElementById('dashboardStats').innerHTML = statsHtml
  }

  showResult('dashboardResult', result, result.data)
}

async function loadUsers() {
  const page = document.getElementById('userPage').value
  const limit = document.getElementById('userLimit').value
  const search = document.getElementById('userSearch').value

  let query = `?page=${page}&limit=${limit}`
  if (search) query += `&search=${encodeURIComponent(search)}`

  const result = await makeRequest(`/users${query}`)

  if (result.success && result.data.users) {
    displayUserList(result.data.users, 'usersResult')
  } else {
    showResult('usersResult', result, result.data)
  }
}

function displayUserList(users, elementId) {
  const element = document.getElementById(elementId)
  element.className = 'result success'
  element.style.display = 'block'

  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Users (${users.length} found)</h4>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>AHV Number</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Validated</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `

  users.forEach((user) => {
    html += `
      <tr>
        <td><strong>${user.ahvNummer}</strong></td>
        <td>${user.email || 'N/A'}</td>
        <td>${user.phoneNumber}</td>
        <td><span class="badge bg-${user.role === 'super-admin' ? 'danger' : 'primary'}">${
      user.role || 'user'
    }</span></td>
        <td><span class="badge bg-${user.validated ? 'success' : 'warning'}">${
      user.validated ? 'Yes' : 'No'
    }</span></td>
        <td><span class="badge bg-${user.isActive ? 'success' : 'secondary'}">${
      user.isActive ? 'Yes' : 'No'
    }</span></td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editUser('${user._id}')" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-info me-1" onclick="viewUserDetails('${
            user._id
          }')" title="View Details">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  element.innerHTML = html
}

async function loadTaxReturns() {
  console.log('loadTaxReturns called')
  const page = document.getElementById('taxReturnPage')?.value || 1
  const limit = document.getElementById('taxReturnLimit')?.value || 10
  const year = document.getElementById('taxReturnYear')?.value
  const userId = document.getElementById('taxReturnUserId')?.value
  const dateFrom = document.getElementById('taxReturnDateFrom')?.value
  const dateTo = document.getElementById('taxReturnDateTo')?.value

  console.log('Tax return search params:', { page, limit, year, userId, dateFrom, dateTo })

  let query = `?page=${page}&limit=${limit}`
  if (year) query += `&year=${year}`
  if (userId) query += `&userId=${userId}`
  if (dateFrom) query += `&dateFrom=${dateFrom}`
  if (dateTo) query += `&dateTo=${dateTo}`

  console.log('Tax return query:', query)

  const result = await makeRequest(`/tax-returns${query}`)

  console.log('Tax return result:', result)

  if (result.success && result.data.taxReturns) {
    displayTaxReturnList(result.data.taxReturns, 'taxReturnsResult')
  } else {
    showResult('taxReturnsResult', result, result.data)
  }
}

function displayTaxReturnList(taxReturns, elementId) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found:', elementId)
    return
  }

  element.className = 'result success'
  element.style.display = 'block'

  let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Tax Returns (${taxReturns.length} found)</h4>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Year</th>
            <th>User AHV</th>
            <th>Created</th>
            <th>Archived</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `

  taxReturns.forEach((tr) => {
    html += `
      <tr>
        <td><small><code>${tr._id}</code></small></td>
        <td><strong>${tr.year}</strong></td>
        <td>${tr.user?.ahvNummer || 'N/A'}</td>
        <td>${new Date(tr.created).toLocaleDateString()}</td>
        <td><span class="badge bg-${tr.archived ? 'warning' : 'success'}">${
      tr.archived ? 'Yes' : 'No'
    }</span></td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="viewTaxReturnDetails('${
            tr._id
          }')" title="View Details">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteTaxReturn('${tr._id}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  element.innerHTML = html
}

// User CRUD Functions
function toggleUserForm() {
  console.log('toggleUserForm called')
  const form = document.getElementById('userForm')
  console.log('Form element found:', !!form)
  console.log('Form has hidden class:', form?.classList.contains('hidden'))
  console.log('Form display style:', form?.style.display)

  if (form.classList.contains('hidden') || form.style.display === 'none') {
    console.log('Showing form')
    form.classList.remove('hidden')
    form.style.display = 'block'
    clearUserForm()
    document.getElementById('userFormTitle').textContent = 'Create New User'
  } else {
    console.log('Hiding form')
    form.classList.add('hidden')
    form.style.display = 'none'
  }
}

function clearUserForm() {
  document.getElementById('editUserId').value = ''
  document.getElementById('userAhv').value = ''
  document.getElementById('userPhone').value = ''
  document.getElementById('userEmail').value = ''
  document.getElementById('userRole').value = 'user'
  document.getElementById('userValidated').value = 'true'
  document.getElementById('userActive').value = 'true'
  document.getElementById('userFormResult').style.display = 'none'
}

function cancelUserForm() {
  const form = document.getElementById('userForm')
  form.classList.add('hidden')
  form.style.display = 'none'
  clearUserForm()
}

async function saveUser() {
  console.log('saveUser called')
  const userId = document.getElementById('editUserId').value
  const isEdit = !!userId

  // Get form values
  const ahvNumber = document.getElementById('userAhv').value.trim()
  const phoneNumber = document.getElementById('userPhone').value.trim()
  const email = document.getElementById('userEmail').value.trim()
  const role = document.getElementById('userRole').value

  // Validate required fields
  if (!ahvNumber) {
    showResult('userFormResult', { success: false, error: 'AHV Number is required' })
    return
  }
  if (!phoneNumber) {
    showResult('userFormResult', { success: false, error: 'Phone Number is required' })
    return
  }

  let userData

  if (isEdit) {
    // For updates, include all fields
    userData = {
      ahvNumber: ahvNumber,
      phoneNumber: phoneNumber,
      email: email || undefined,
      role: role,
      validated: document.getElementById('userValidated').value === 'true',
      isActive: document.getElementById('userActive').value === 'true',
    }
  } else {
    // For creation, only include fields that are in AdminCreateUserBody
    userData = {
      ahvNumber: ahvNumber,
      phoneNumber: phoneNumber,
      email: email || undefined,
      role: role,
      isSuperAdmin: role === 'super_admin',
    }
  }

  console.log('User data to be sent:', userData)

  const endpoint = isEdit ? `/users/${userId}` : '/users'
  const method = isEdit ? 'PUT' : 'POST'

  console.log('Making request to:', endpoint, 'with method:', method)

  const result = await makeRequest(endpoint, {
    method,
    body: JSON.stringify(userData),
  })

  console.log('Result from saveUser request:', result)

  showResult('userFormResult', result, result.data)

  if (result.success) {
    cancelUserForm()
    loadUsers() // Refresh the user list
  }
}

async function editUser(userId) {
  const result = await makeRequest(`/users/${userId}`)

  if (result.success) {
    const user = result.data
    document.getElementById('editUserId').value = user._id
    document.getElementById('userAhv').value = user.ahvNummer
    document.getElementById('userPhone').value = user.phoneNumber
    document.getElementById('userEmail').value = user.email || ''
    document.getElementById('userRole').value = user.role || 'user'
    document.getElementById('userValidated').value = user.validated.toString()
    document.getElementById('userActive').value = (user.isActive || false).toString()

    document.getElementById('userFormTitle').textContent = 'Edit User'
    const form = document.getElementById('userForm')
    form.classList.remove('hidden')
    form.style.display = 'block'
  } else {
    alert(`Failed to load user: ${result.error}`)
  }
}

async function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    const result = await makeRequest(`/users/${userId}`, { method: 'DELETE' })

    if (result.success) {
      alert('User deleted successfully')
      loadUsers() // Refresh the user list
    } else {
      alert(`Failed to delete user: ${result.error}`)
    }
  }
}

async function viewUserDetails(userId) {
  const result = await makeRequest(`/users/${userId}`)

  if (result.success) {
    const detailsWindow = window.open('', '_blank', 'width=600,height=400')
    detailsWindow.document.write(`
            <html>
              <head><title>User Details</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>User Details</h2>
                <pre>${JSON.stringify(result.data, null, 2)}</pre>
                <button onclick="window.close()">Close</button>
              </body>
            </html>
          `)
  } else {
    alert(`Failed to load user details: ${result.error}`)
  }
}

// Bulk Actions
async function performBulkAction() {
  const userIds = document
    .getElementById('bulkUserIds')
    .value.split(',')
    .map((id) => id.trim())
    .filter((id) => id)
  const action = document.getElementById('bulkAction').value

  if (userIds.length === 0) {
    alert('Please enter at least one user ID')
    return
  }

  if (confirm(`Are you sure you want to ${action} ${userIds.length} user(s)?`)) {
    const result = await makeRequest('/users/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ userIds, action }),
    })

    showResult('bulkActionResult', result, result.data)

    if (result.success) {
      document.getElementById('bulkUserIds').value = ''
      loadUsers() // Refresh the user list
    }
  }
}

// Tax Return Functions
async function uploadTaxPdf() {
  const form = document.getElementById('pdfUploadForm')
  const formData = new FormData()

  const userId = document.getElementById('pdfUserId').value
  const year = document.getElementById('pdfYear').value
  const fileInput = document.getElementById('taxPdf')

  if (!userId || !year || !fileInput.files[0]) {
    alert('Please fill all required fields and select a file')
    return
  }

  const file = fileInput.files[0]
  const fileType = file.type

  // Check if file is PDF or image
  if (!fileType.includes('pdf') && !fileType.startsWith('image/')) {
    alert('Please select a PDF file or image (PNG, JPG, JPEG)')
    return
  }

  formData.append('taxPdf', file)
  formData.append('userId', userId)
  formData.append('year', year)

  try {
    const fileTypeName = fileType.includes('pdf') ? 'PDF' : 'image'
    showResult(
      'pdfUploadResult',
      { success: true },
      { message: `Uploading and processing ${fileTypeName}...` },
    )

    const response = await fetch(API_BASE.replace('/api/admin', '') + '/api/admin/upload-tax-pdf', {
      method: 'POST',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: formData,
    })

    const result = await response.json()

    if (result.success) {
      showResult(
        'pdfUploadResult',
        { success: true },
        {
          message: `${fileTypeName} processed successfully!`,
          extractedData: result.extractedData,
          fileInfo: result.fileInfo,
        },
      )

      // Now create the tax return with the extracted data
      await createTaxReturnWithData(userId, year, result.extractedData)
    } else {
      showResult('pdfUploadResult', { success: false, error: result.error })
    }
  } catch (error) {
    showResult('pdfUploadResult', { success: false, error: error.message })
  }
}

async function createTaxReturnWithData(userId, year, extractedData) {
  const result = await makeRequest('/tax-returns/create-for-user', {
    method: 'POST',
    body: JSON.stringify({ userId, year, extractedData }),
  })

  if (result.success) {
    showResult(
      'pdfUploadResult',
      { success: true },
      {
        message: 'Tax return created successfully!',
        taxReturn: result.data,
      },
    )
    clearPdfForm()
    loadTaxReturns() // Refresh the tax returns list
  } else {
    showResult('pdfUploadResult', { success: false, error: result.error })
  }
}

async function createManualTaxReturn() {
  const userId = document.getElementById('manualUserId').value
  const year = document.getElementById('manualYear').value

  if (!userId || !year) {
    alert('Please fill all required fields')
    return
  }

  const result = await makeRequest('/tax-returns/create-for-user', {
    method: 'POST',
    body: JSON.stringify({ userId, year: parseInt(year) }),
  })

  if (result.success) {
    showResult(
      'manualTaxReturnResult',
      { success: true },
      {
        message: 'Tax return created successfully!',
        taxReturn: result.data,
      },
    )
    document.getElementById('manualUserId').value = ''
    document.getElementById('manualYear').value = new Date().getFullYear()
    loadTaxReturns() // Refresh the tax returns list
  } else {
    showResult('manualTaxReturnResult', { success: false, error: result.error })
  }
}

function clearPdfForm() {
  document.getElementById('pdfUserId').value = ''
  document.getElementById('pdfYear').value = new Date().getFullYear()
  document.getElementById('taxPdf').value = ''
  document.getElementById('pdfUploadResult').className = 'result hidden'
}

async function viewTaxReturnDetails(taxReturnId) {
  if (!taxReturnId) {
    taxReturnId = document.getElementById('selectedTaxReturnId').value
  }

  if (!taxReturnId) {
    alert('Please enter a Tax Return ID')
    return
  }

  const result = await makeRequest(`/tax-returns/${taxReturnId}`)

  if (result.success) {
    const detailsWindow = window.open('', '_blank', 'width=800,height=600')
    detailsWindow.document.write(`
            <html>
              <head><title>Tax Return Details</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Tax Return Details</h2>
                <pre>${JSON.stringify(result.data, null, 2)}</pre>
                <button onclick="window.close()">Close</button>
              </body>
            </html>
          `)
  } else {
    showResult('taxReturnActionResult', result)
  }
}

async function deleteTaxReturn(taxReturnId) {
  if (!taxReturnId) {
    taxReturnId = document.getElementById('selectedTaxReturnId').value
  }

  if (!taxReturnId) {
    alert('Please enter a Tax Return ID')
    return
  }

  if (confirm('Are you sure you want to delete this tax return? This action cannot be undone.')) {
    const result = await makeRequest(`/tax-returns/${taxReturnId}`, { method: 'DELETE' })

    if (result.success) {
      showResult(
        'taxReturnActionResult',
        { success: true },
        { message: 'Tax return deleted successfully' },
      )
      loadTaxReturns() // Refresh the list
    } else {
      showResult('taxReturnActionResult', result)
    }
  }
}

async function exportTaxReturns() {
  const year = document.getElementById('taxReturnYear').value

  let endpoint = '/export/tax-returns?format=json'
  if (year) endpoint += `&year=${year}`

  const result = await makeRequest(endpoint)

  if (result.success) {
    // Create a download link for the exported data
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tax-returns' + (year ? '-' + year : '') + '.json'
    a.click()
    URL.revokeObjectURL(url)

    showResult('taxReturnActionResult', { success: true }, { message: 'Export completed successfully' })
  } else {
    showResult('taxReturnActionResult', result)
  }
}

async function checkSystemHealth() {
  const result = await makeRequest('/system/health')
  showResult('healthResult', result, result.data)
}

function logout() {
  console.log('Logout function called')
  authToken = null

  // Clear stored credentials
  clearStoredCredentials()

  // Force show login section and hide admin section
  const loginSection = document.getElementById('loginSection')
  const adminSection = document.getElementById('adminSection')

  if (loginSection) {
    loginSection.style.display = 'block'
    loginSection.classList.remove('hidden')
    console.log('Logout: Login section shown')
  }

  if (adminSection) {
    adminSection.style.display = 'none'
    adminSection.classList.add('hidden')
    console.log('Logout: Admin section hidden')
  }

  // Clear all results
  document.querySelectorAll('.result').forEach((el) => {
    el.style.display = 'none'
  })
  document.getElementById('dashboardStats').innerHTML = ''

  // Hide user form if open
  const userForm = document.getElementById('userForm')
  if (userForm) {
    userForm.classList.add('hidden')
  }

  // Clear form fields
  document.getElementById('email').value = ''
  document.getElementById('password').value = ''

  console.log('Logout completed')
}

// Expose functions globally for inline onclick handlers (browser only)
if (typeof window !== 'undefined') {
  window.adminLogin = adminLogin
  window.loadDashboard = loadDashboard
  window.loadUsers = loadUsers
  window.toggleUserForm = toggleUserForm
  window.clearUserForm = clearUserForm
  window.cancelUserForm = cancelUserForm
  window.saveUser = saveUser
  window.editUser = editUser
  window.deleteUser = deleteUser
  window.viewUserDetails = viewUserDetails
  window.performBulkAction = performBulkAction
  window.loadTaxReturns = loadTaxReturns
  window.uploadTaxPdf = uploadTaxPdf
  window.createManualTaxReturn = createManualTaxReturn
  window.clearPdfForm = clearPdfForm
  window.viewTaxReturnDetails = viewTaxReturnDetails
  window.deleteTaxReturn = deleteTaxReturn
  window.exportTaxReturns = exportTaxReturns
  window.checkSystemHealth = checkSystemHealth
  window.loadActivityLog = loadActivityLog
  window.logout = logout
  window.loadStoredCredentials = loadStoredCredentials
  window.autoLogin = autoLogin
  window.clearStoredCredentials = clearStoredCredentials

  // Debug: Check if functions are properly defined
  console.log('Functions defined:', {
    adminLogin: typeof adminLogin,
    loadDashboard: typeof loadDashboard,
    loadUsers: typeof loadUsers,
    makeRequest: typeof makeRequest,
    loadStoredCredentials: typeof loadStoredCredentials,
  })
}
