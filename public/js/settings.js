// ============================================
// CONFIGURATION-COMPLETE.JS
// Full CRUD for ALL Modules
// ============================================

const API_URL = '/api';

// Global data storage
let currentUser = null;
let currentEditType = null;
let currentEditId = null;

let universities = [];
let admins = [];
let institutes = [];
let departments = [];
let faculty = [];
let classes = [];
let labs = [];
let routines = [];

// ===== INITIALIZE =====
window.onload = async function() {
    console.log('🚀 Initializing Complete Configuration System...');
    
    await checkAuth();
    loadUserInfo();
    initializeNavigation();
    await loadAllData();
    
    console.log('✅ System initialized - All modules loaded');
};

// ===== AUTHENTICATION =====
async function checkAuth() {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
        alert('⚠️ Please login first!');
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    console.log('✅ User authenticated:', currentUser.name);
}

function loadUserInfo() {
    if (!currentUser) return;
    
    const initials = currentUser.name.split(' ').map(n => n[0].toUpperCase()).join('');
    document.getElementById('headerAvatar').textContent = initials;
    document.getElementById('headerUserName').textContent = currentUser.name.toUpperCase();
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const blockId = this.getAttribute('data-block');
            showBlock(blockId);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showBlock(blockId) {
    document.querySelectorAll('.config-block').forEach(block => {
        block.classList.remove('active');
    });
    
    const selectedBlock = document.getElementById(`block-${blockId}`);
    if (selectedBlock) {
        selectedBlock.classList.add('active');
    }
}

// ===== LOAD ALL DATA =====
async function loadAllData() {
    console.log('📥 Loading all modules...');
    
    await Promise.all([
        loadUniversities(),
        loadAdmins(),
        loadInstitutes(),
        loadDepartments(),
        loadFaculty(),
        loadClasses(),
        loadLabs(),
        loadRoutines()
    ]);
    
    updateAllDropdowns();
    console.log('✅ All modules loaded');
}

// ===== GENERIC LOAD FUNCTION =====
async function loadData(endpoint, dataArray, displayFunction) {
    try {
        const response = await fetch(`${API_URL}/config/${endpoint}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        
        if (result.success) {
            Object.assign(dataArray, result.data);
            if (displayFunction) displayFunction();
            console.log(`📥 Loaded ${endpoint}:`, result.data.length);
        }
    } catch (error) {
        console.error(`Error loading ${endpoint}:`, error);
    }
}

// ===== LOAD FUNCTIONS FOR EACH MODULE =====
async function loadUniversities() {
    await loadData('universities', universities, displayUniversities);
}

async function loadAdmins() {
    await loadData('admins', admins, displayAdmins);
}

async function loadInstitutes() {
    await loadData('institutes', institutes, displayInstitutes);
}

async function loadDepartments() {
    await loadData('departments', departments, displayDepartments);
}

async function loadFaculty() {
    await loadData('faculty', faculty, displayFaculty);
}

async function loadClasses() {
    await loadData('classes', classes, displayClasses);
}

async function loadLabs() {
    await loadData('labs', labs, displayLabs);
}

async function loadRoutines() {
    await loadData('routines', routines, displayRoutines);
}

// ===== DISPLAY FUNCTIONS =====
function displayUniversities() {
    const tbody = document.getElementById('universityTableBody');
    const count = document.getElementById('universityCount');
    
    count.textContent = universities.length;
    
    if (universities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No universities configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    universities.forEach(uni => {
        const statusClass = uni.status === 'active' ? 'status-active' : 'status-inactive';
        const row = `
            <tr>
                <td><strong>${uni.name}</strong></td>
                <td>${uni.code}</td>
                <td>${uni.established || 'N/A'}</td>
                <td>${uni.type || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${(uni.status || 'active').toUpperCase()}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('university', '${uni.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('university', '${uni.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('universities', '${uni.id}', '${uni.name}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displayAdmins() {
    const tbody = document.getElementById('adminTableBody');
    const count = document.getElementById('adminCount');
    
    count.textContent = admins.length;
    
    if (admins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No admins configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    admins.forEach(admin => {
        const row = `
            <tr>
                <td><strong>${admin.name}</strong></td>
                <td>${admin.adminId}</td>
                <td>${admin.email}</td>
                <td><span class="status-badge status-active">${admin.role || 'ADMIN'}</span></td>
                <td><span class="status-badge status-active">ACTIVE</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('admin', '${admin.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('admin', '${admin.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('admins', '${admin.id}', '${admin.name}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displayInstitutes() {
    const tbody = document.getElementById('instituteTableBody');
    const count = document.getElementById('instituteCount');
    
    count.textContent = institutes.length;
    
    if (institutes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No institutes configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    institutes.forEach(inst => {
        const row = `
            <tr>
                <td><strong>${inst.name}</strong></td>
                <td>${inst.code}</td>
                <td>${inst.type || 'N/A'}</td>
                <td>${inst.deanName || 'N/A'}</td>
                <td>${inst.principalName || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('institute', '${inst.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('institute', '${inst.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('institutes', '${inst.id}', '${inst.name}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displayDepartments() {
    const tbody = document.getElementById('departmentTableBody');
    const count = document.getElementById('departmentCount');
    
    count.textContent = departments.length;
    
    if (departments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8;">No departments configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    departments.forEach(dept => {
        const inst = institutes.find(i => i.id === dept.instituteId);
        const row = `
            <tr>
                <td><strong>${dept.name}</strong></td>
                <td>${dept.code}</td>
                <td>${inst ? inst.name : 'N/A'}</td>
                <td>${dept.hodName || 'N/A'}</td>
                <td>${dept.totalStudents || 0}</td>
                <td>${dept.totalFaculty || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('department', '${dept.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('department', '${dept.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('departments', '${dept.id}', '${dept.name}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displayFaculty() {
    const tbody = document.getElementById('facultyTableBody');
    const count = document.getElementById('facultyCount');
    
    count.textContent = faculty.length;
    
    if (faculty.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8;">No faculty configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    faculty.forEach(fac => {
        const dept = departments.find(d => d.id === fac.departmentId);
        const row = `
            <tr>
                <td><strong>${fac.name}</strong></td>
                <td>${fac.facultyId}</td>
                <td>${dept ? dept.name : 'N/A'}</td>
                <td>${fac.email}</td>
                <td>${fac.designation || 'N/A'}</td>
                <td>${fac.specialization || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('faculty', '${fac.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('faculty', '${fac.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('faculty', '${fac.id}', '${fac.name}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displayClasses() {
    const tbody = document.getElementById('classTableBody');
    const count = document.getElementById('classCount');
    
    count.textContent = classes.length;
    
    if (classes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8;">No classes configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    classes.forEach(cls => {
        const dept = departments.find(d => d.id === cls.departmentId);
        const row = `
            <tr>
                <td><strong>${cls.classId}</strong></td>
                <td>${dept ? dept.name : 'N/A'}</td>
                <td>Semester ${cls.semester}</td>
                <td>Section ${cls.section}</td>
                <td>${cls.totalStudents}</td>
                <td>${cls.room || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('class', '${cls.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('class', '${cls.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('classes', '${cls.id}', '${cls.classId}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displayLabs() {
    const tbody = document.getElementById('labTableBody');
    const count = document.getElementById('labCount');
    
    count.textContent = labs.length;
    
    if (labs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8;">No labs configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    labs.forEach(lab => {
        const dept = departments.find(d => d.id === lab.departmentId);
        const statusClass = lab.status === 'operational' ? 'status-active' : 'status-inactive';
        const row = `
            <tr>
                <td><strong>${lab.name}</strong></td>
                <td>${lab.code}</td>
                <td>${dept ? dept.name : 'N/A'}</td>
                <td>${lab.room}</td>
                <td>${lab.capacity}</td>
                <td><span class="status-badge ${statusClass}">${(lab.status || 'operational').toUpperCase()}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('lab', '${lab.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('lab', '${lab.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('labs', '${lab.id}', '${lab.name}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function displayRoutines() {
    const tbody = document.getElementById('routineTableBody');
    const count = document.getElementById('routineCount');
    
    count.textContent = routines.length;
    
    if (routines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8;">No routines configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    routines.forEach(routine => {
        const cls = classes.find(c => c.id === routine.classId);
        const fac = faculty.find(f => f.id === routine.facultyId);
        const row = `
            <tr>
                <td><strong>${cls ? cls.classId : 'N/A'}</strong></td>
                <td>${routine.day}</td>
                <td>${routine.startTime} - ${routine.endTime}</td>
                <td>${routine.subject}</td>
                <td>${fac ? fac.name : 'N/A'}</td>
                <td>${routine.room || 'N/A'}</td>
                <td><span class="status-badge status-active">${(routine.type || 'theory').toUpperCase()}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-view" onclick="viewItem('routine', '${routine.id}')">👁️ VIEW</button>
                        <button class="action-btn action-btn-edit" onclick="editItem('routine', '${routine.id}')">✏️ EDIT</button>
                        <button class="action-btn action-btn-delete" onclick="deleteItem('routines', '${routine.id}', '${routine.subject}')">🗑️ DELETE</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== UPDATE DROPDOWNS =====
function updateAllDropdowns() {
    console.log('🔄 Updating all dropdowns...');
    
    // Update institute dropdowns
    updateDropdown('dept_institute', institutes, 'name', 'code');
    
    // Update department dropdowns
    updateDropdown('fac_dept', departments, 'name', 'code');
    updateDropdown('class_dept', departments, 'name', 'code');
    updateDropdown('lab_dept', departments, 'name', 'code');
    
    // Update faculty dropdowns
    updateDropdown('class_coordinator', faculty, 'name', 'facultyId');
    updateDropdown('lab_incharge', faculty, 'name', 'facultyId');
    updateDropdown('routine_faculty', faculty, 'name', 'facultyId');
    
    // Update class dropdowns
    updateDropdown('routine_class', classes, 'classId', 'semester', true);
    
    console.log('✅ All dropdowns updated');
}

function updateDropdown(selectId, dataArray, nameField, codeField, isClass = false) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select --</option>';
    dataArray.forEach(item => {
        const displayText = isClass 
            ? `${item[nameField]} - Sem ${item.semester}, Sec ${item.section}`
            : `${item[nameField]} (${item[codeField]})`;
        select.innerHTML += `<option value="${item.id}">${displayText}</option>`;
    });
}

// ===== GENERIC VIEW FUNCTION =====
function viewItem(type, id) {
    let item, details;
    
    switch(type) {
        case 'university':
            item = universities.find(u => u.id === id);
            details = getUniversityDetails(item);
            break;
        case 'admin':
            item = admins.find(a => a.id === id);
            details = getAdminDetails(item);
            break;
        case 'institute':
            item = institutes.find(i => i.id === id);
            details = getInstituteDetails(item);
            break;
        case 'department':
            item = departments.find(d => d.id === id);
            details = getDepartmentDetails(item);
            break;
        case 'faculty':
            item = faculty.find(f => f.id === id);
            details = getFacultyDetails(item);
            break;
        case 'class':
            item = classes.find(c => c.id === id);
            details = getClassDetails(item);
            break;
        case 'lab':
            item = labs.find(l => l.id === id);
            details = getLabDetails(item);
            break;
        case 'routine':
            item = routines.find(r => r.id === id);
            details = getRoutineDetails(item);
            break;
    }
    
    if (!item) return;
    
    document.getElementById('viewModalTitle').textContent = `📋 VIEW ${type.toUpperCase()} DETAILS`;
    document.getElementById('viewModalContent').innerHTML = details;
    openModal('viewModal');
}

// ===== DETAIL BUILDERS =====
function createDetailItem(label, value) {
    return `
        <div class="detail-item">
            <div class="detail-label">${label}</div>
            <div class="detail-value">${value || 'N/A'}</div>
        </div>
    `;
}

function getUniversityDetails(uni) {
    return `
        ${createDetailItem('UNIVERSITY NAME', uni.name)}
        ${createDetailItem('CODE', uni.code)}
        ${createDetailItem('ESTABLISHED', uni.established)}
        ${createDetailItem('TYPE', uni.type)}
        ${createDetailItem('CHANCELLOR', uni.chancellorName)}
        ${createDetailItem('VICE CHANCELLOR', uni.viceChancellorName)}
        ${createDetailItem('WEBSITE', uni.website)}
        ${createDetailItem('EMAIL', uni.email)}
        ${createDetailItem('PHONE', uni.phone)}
        ${createDetailItem('STATUS', uni.status ? uni.status.toUpperCase() : 'ACTIVE')}
    `;
}

function getAdminDetails(admin) {
    return `
        ${createDetailItem('NAME', admin.name)}
        ${createDetailItem('ADMIN ID', admin.adminId)}
        ${createDetailItem('EMAIL', admin.email)}
        ${createDetailItem('ROLE', admin.role)}
        ${createDetailItem('PHONE', admin.phone)}
        ${createDetailItem('CREATED AT', new Date(admin.createdAt).toLocaleString())}
    `;
}

function getInstituteDetails(inst) {
    return `
        ${createDetailItem('INSTITUTE NAME', inst.name)}
        ${createDetailItem('CODE', inst.code)}
        ${createDetailItem('TYPE', inst.type)}
        ${createDetailItem('ESTABLISHED', inst.established)}
        ${createDetailItem('DEAN', inst.deanName)}
        ${createDetailItem('PRINCIPAL', inst.principalName)}
        ${createDetailItem('EMAIL', inst.email)}
        ${createDetailItem('PHONE', inst.phone)}
    `;
}

function getDepartmentDetails(dept) {
    const inst = institutes.find(i => i.id === dept.instituteId);
    return `
        ${createDetailItem('DEPARTMENT NAME', dept.name)}
        ${createDetailItem('CODE', dept.code)}
        ${createDetailItem('INSTITUTE', inst ? inst.name : 'N/A')}
        ${createDetailItem('HOD', dept.hodName)}
        ${createDetailItem('HOD DESIGNATION', dept.hodDesignation)}
        ${createDetailItem('ESTABLISHED', dept.established)}
        ${createDetailItem('TOTAL STUDENTS', dept.totalStudents)}
        ${createDetailItem('TOTAL FACULTY', dept.totalFaculty)}
    `;
}

function getFacultyDetails(fac) {
    const dept = departments.find(d => d.id === fac.departmentId);
    return `
        ${createDetailItem('NAME', fac.name)}
        ${createDetailItem('FACULTY ID', fac.facultyId)}
        ${createDetailItem('DEPARTMENT', dept ? dept.name : 'N/A')}
        ${createDetailItem('EMAIL', fac.email)}
        ${createDetailItem('DESIGNATION', fac.designation)}
        ${createDetailItem('QUALIFICATION', fac.qualification)}
        ${createDetailItem('SPECIALIZATION', fac.specialization)}
        ${createDetailItem('PHONE', fac.phone)}
        ${createDetailItem('REQUIRES APPROVAL', fac.requiresApproval === 'yes' ? 'YES' : 'NO')}
    `;
}

function getClassDetails(cls) {
    const dept = departments.find(d => d.id === cls.departmentId);
    const coord = faculty.find(f => f.id === cls.coordinator);
    return `
        ${createDetailItem('CLASS ID', cls.classId)}
        ${createDetailItem('DEPARTMENT', dept ? dept.name : 'N/A')}
        ${createDetailItem('SEMESTER', 'Semester ' + cls.semester)}
        ${createDetailItem('SECTION', 'Section ' + cls.section)}
        ${createDetailItem('TOTAL STUDENTS', cls.totalStudents)}
        ${createDetailItem('COORDINATOR', coord ? coord.name : 'Not Assigned')}
        ${createDetailItem('ROOM', cls.room)}
        ${createDetailItem('CLASS TYPE', cls.type ? cls.type.toUpperCase() : 'REGULAR')}
    `;
}

function getLabDetails(lab) {
    const dept = departments.find(d => d.id === lab.departmentId);
    const incharge = faculty.find(f => f.id === lab.incharge);
    return `
        ${createDetailItem('LAB NAME', lab.name)}
        ${createDetailItem('CODE', lab.code)}
        ${createDetailItem('DEPARTMENT', dept ? dept.name : 'N/A')}
        ${createDetailItem('ROOM', lab.room)}
        ${createDetailItem('CAPACITY', lab.capacity + ' Students')}
        ${createDetailItem('TYPE', lab.type)}
        ${createDetailItem('INCHARGE', incharge ? incharge.name : 'Not Assigned')}
        ${createDetailItem('STATUS', lab.status ? lab.status.toUpperCase() : 'OPERATIONAL')}
        <div class="detail-item" style="grid-column: 1 / -1;">
            <div class="detail-label">EQUIPMENT</div>
            <div class="detail-value">${lab.equipment || 'Not specified'}</div>
        </div>
        <div class="detail-item" style="grid-column: 1 / -1;">
            <div class="detail-label">SAFETY REQUIREMENTS</div>
            <div class="detail-value">${lab.safety || 'Not specified'}</div>
        </div>
    `;
}

function getRoutineDetails(routine) {
    const cls = classes.find(c => c.id === routine.classId);
    const fac = faculty.find(f => f.id === routine.facultyId);
    return `
        ${createDetailItem('CLASS', cls ? cls.classId : 'N/A')}
        ${createDetailItem('DAY', routine.day)}
        ${createDetailItem('TIME', routine.startTime + ' - ' + routine.endTime)}
        ${createDetailItem('SUBJECT', routine.subject)}
        ${createDetailItem('FACULTY', fac ? fac.name : 'N/A')}
        ${createDetailItem('ROOM', routine.room)}
        ${createDetailItem('TYPE', routine.type ? routine.type.toUpperCase() : 'THEORY')}
    `;
}

// // ===== FORM SAVE FUNCTIONS =====

// // Save University
// async function saveUniversity(event) {
//     event.preventDefault();
    
//     const data = {
//         name: document.getElementById('uni_name').value,
//         code: document.getElementById('uni_code').value,
//         established: document.getElementById('uni_year').value,
//         type: document.getElementById('uni_type').value,
//         chancellorName: document.getElementById('uni_chancellor').value,
//         viceChancellorName: document.getElementById('uni_vice_chancellor').value,
//         address: document.getElementById('uni_address').value,
//         website: document.getElementById('uni_website').value,
//         email: document.getElementById('uni_email').value,
//         phone: document.getElementById('uni_phone').value,
//         status: document.getElementById('uni_status').value
//     };
    
//     await saveDataToServer('universities', data, 'universityForm');
// }

// // Save Admin
// async function saveAdmin(event) {
//     event.preventDefault();
    
//     const data = {
//         name: document.getElementById('admin_name').value,
//         adminId: document.getElementById('admin_id').value,
//         email: document.getElementById('admin_email').value,
//         password: document.getElementById('admin_password').value,
//         role: document.getElementById('admin_role').value,
//         phone: document.getElementById('admin_phone').value
//     };
    
//     await saveDataToServer('users', data, 'adminForm');
// }

// // Save Institute
// async function saveInstitute(event) {
//     event.preventDefault();
    
//     const data = {
//         name: document.getElementById('inst_name').value,
//         code: document.getElementById('inst_code').value,
//         established: document.getElementById('inst_year').value,
//         type: document.getElementById('inst_type').value,
//         deanName: document.getElementById('inst_dean').value,
//         principalName: document.getElementById('inst_principal').value,
//         email: document.getElementById('inst_email').value,
//         phone: document.getElementById('inst_phone').value
//     };
    
//     await saveDataToServer('institutes', data, 'instituteForm');
// }

// // Save Department
// async function saveDepartment(event) {
//     event.preventDefault();
    
//     const data = {
//         instituteId: document.getElementById('dept_institute').value,
//         name: document.getElementById('dept_name').value,
//         code: document.getElementById('dept_code').value,
//         established: document.getElementById('dept_year').value,
//         hodName: document.getElementById('dept_hod').value,
//         hodDesignation: document.getElementById('dept_hod_designation').value,
//         totalStudents: document.getElementById('dept_students').value,
//         totalFaculty: document.getElementById('dept_faculty').value
//     };
    
//     await saveDataToServer('departments', data, 'departmentForm');
// }

// // Save Faculty
// async function saveFaculty(event) {
//     event.preventDefault();
    
//     const data = {
//         departmentId: document.getElementById('fac_dept').value,
//         name: document.getElementById('fac_name').value,
//         facultyId: document.getElementById('fac_id').value,
//         email: document.getElementById('fac_email').value,
//         password: document.getElementById('fac_password').value,
//         designation: document.getElementById('fac_designation').value,
//         qualification: document.getElementById('fac_qualification').value,
//         specialization: document.getElementById('fac_specialization').value,
//         phone: document.getElementById('fac_phone').value,
//         requiresApproval: document.getElementById('fac_approval').value
//     };
//     console.log('users')
//     await saveDataToServer('users', data, 'facultyForm');
// }

// // Save Class
// async function saveClass(event) {
//     event.preventDefault();
    
//     const data = {
//         departmentId: document.getElementById('class_dept').value,
//         classId: document.getElementById('class_id').value,
//         semester: document.getElementById('class_semester').value,
//         section: document.getElementById('class_section').value,
//         totalStudents: document.getElementById('class_students').value,
//         coordinator: document.getElementById('class_coordinator').value,
//         room: document.getElementById('class_room').value,
//         type: document.getElementById('class_type').value
//     };
    
//     await saveDataToServer('classes', data, 'classForm');
// }

// // Save Lab
// async function saveLab(event) {
//     event.preventDefault();
    
//     const data = {
//         name: document.getElementById('lab_name').value,
//         code: document.getElementById('lab_code').value,
//         departmentId: document.getElementById('lab_dept').value,
//         room: document.getElementById('lab_room').value,
//         capacity: document.getElementById('lab_capacity').value,
//         type: document.getElementById('lab_type').value,
//         equipment: document.getElementById('lab_equipment').value,
//         safety: document.getElementById('lab_safety').value,
//         incharge: document.getElementById('lab_incharge').value,
//         status: document.getElementById('lab_status').value
//     };
    
//     await saveDataToServer('labs', data, 'labForm');
// }

// // Save Routine
// async function saveRoutine(event) {
//     event.preventDefault();
    
//     const data = {
//         classId: document.getElementById('routine_class').value,
//         day: document.getElementById('routine_day').value,
//         startTime: document.getElementById('routine_start').value,
//         endTime: document.getElementById('routine_end').value,
//         subject: document.getElementById('routine_subject').value,
//         facultyId: document.getElementById('routine_faculty').value,
//         room: document.getElementById('routine_room').value,
//         type: document.getElementById('routine_type').value
//     };
    
//     await saveDataToServer('routines', data, 'routineForm');
// }

// // Generic save function
// async function saveDataToServer(endpoint, data, formId) {
//     try {
//         console.log(`💾 Saving ${endpoint}:`, data);
        
//         const response = await fetch(`${API_URL}/config/${endpoint}`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`
//             },
//             body: JSON.stringify(data)
//         });
        
//         const result = await response.json();
        
//         if (result.success) {
//             alert(`✅ ${endpoint.toUpperCase()} saved successfully!`);
            
//             // Reset form
//             if (formId) {
//                 document.getElementById(formId).reset();
//             }
            
//             // Reload data
//             await loadAllData();
//         } else {
//             alert(`❌ Error: ${result.message || 'Failed to save'}`);
//         }
//     } catch (error) {
//         console.error(`Error saving ${endpoint}:`, error);
//         alert(`❌ Error connecting to server!`);
//     }
// }

// ===== FORM SAVE FUNCTIONS =====

// Save University
async function saveUniversity(event) {
    event.preventDefault();
    console.log('💾 Saving university...');
    
    const data = {
        name: document.getElementById('uni_name').value,
        code: document.getElementById('uni_code').value,
        established: document.getElementById('uni_year').value,
        type: document.getElementById('uni_type').value,
        chancellorName: document.getElementById('uni_chancellor').value,
        viceChancellorName: document.getElementById('uni_vice_chancellor').value,
        address: document.getElementById('uni_address').value,
        website: document.getElementById('uni_website').value,
        email: document.getElementById('uni_email').value,
        phone: document.getElementById('uni_phone').value,
        status: document.getElementById('uni_status').value
    };
    
    await saveDataToServer('universities', data, 'universityForm');
    return false;
}



// Save Admin
async function saveAdmin(event) {
    event.preventDefault();
    console.log('💾 Saving admin...');
    
    const data = {
        name: document.getElementById('admin_name').value,
        adminId: document.getElementById('admin_id').value,
        email: document.getElementById('admin_email').value,
        password: document.getElementById('admin_password').value,
        role:  "admin",  //document.getElementById('admin_role').value,
        phone: document.getElementById('admin_phone').value
    };
    
    await saveDataToServer('users', data, 'adminForm');
    return false;
}

// Save Institute
async function saveInstitute(event) {
    event.preventDefault();
    console.log('💾 Saving institute...');
    
    const data = {
        name: document.getElementById('inst_name').value,
        code: document.getElementById('inst_code').value,
        established: document.getElementById('inst_year').value,
        type: document.getElementById('inst_type').value,
        deanName: document.getElementById('inst_dean').value,
        principalName: document.getElementById('inst_principal').value,
        email: document.getElementById('inst_email').value,
        phone: document.getElementById('inst_phone').value
    };
    
    await saveDataToServer('institutes', data, 'instituteForm');
    return false;
}

// Save Department
async function saveDepartment(event) {
    event.preventDefault();
    console.log('💾 Saving department...');
    
    const data = {
        instituteId: document.getElementById('dept_institute').value,
        name: document.getElementById('dept_name').value,
        code: document.getElementById('dept_code').value,
        established: document.getElementById('dept_year').value,
        hodName: document.getElementById('dept_hod').value,
        hodDesignation: document.getElementById('dept_hod_designation').value,
        totalStudents: document.getElementById('dept_students').value,
        totalFaculty: document.getElementById('dept_faculty').value
    };
    
    await saveDataToServer('departments', data, 'departmentForm');
    return false;
}

// Save Faculty
async function saveFaculty(event) {
    event.preventDefault();
    console.log('💾 Saving faculty...');
    
    const data = {
        departmentId: document.getElementById('fac_dept').value,
        name: document.getElementById('fac_name').value,
        facultyId: document.getElementById('fac_id').value,
        email: document.getElementById('fac_email').value,
        password: document.getElementById('fac_password').value,
        designation: document.getElementById('fac_designation').value,
        qualification: document.getElementById('fac_qualification').value,
        specialization: document.getElementById('fac_specialization').value,
        phone: document.getElementById('fac_phone').value,
        requiresApproval: document.getElementById('fac_approval').value
    };
    
    await saveDataToServer('users', data, 'facultyForm');
    return false;
}

// Save Class
async function saveClass(event) {
    event.preventDefault();
    console.log('💾 Saving class...');
    
    const data = {
        departmentId: document.getElementById('class_dept').value,
        classId: document.getElementById('class_id').value,
        semester: document.getElementById('class_semester').value,
        section: document.getElementById('class_section').value,
        totalStudents: document.getElementById('class_students').value,
        coordinator: document.getElementById('class_coordinator').value,
        room: document.getElementById('class_room').value,
        type: document.getElementById('class_type').value
    };
    
    await saveDataToServer('classes', data, 'classForm');
    return false;
}

// Save Lab
async function saveLab(event) {
    event.preventDefault();
    console.log('💾 Saving lab...');
    
    const data = {
        name: document.getElementById('lab_name').value,
        code: document.getElementById('lab_code').value,
        departmentId: document.getElementById('lab_dept').value,
        room: document.getElementById('lab_room').value,
        capacity: document.getElementById('lab_capacity').value,
        type: document.getElementById('lab_type').value,
        equipment: document.getElementById('lab_equipment').value,
        safety: document.getElementById('lab_safety').value,
        incharge: document.getElementById('lab_incharge').value,
        status: document.getElementById('lab_status').value
    };
    
    await saveDataToServer('labs', data, 'labForm');
    return false;
}

// Save Routine
async function saveRoutine(event) {
    event.preventDefault();
    console.log('💾 Saving routine...');
    
    const data = {
        classId: document.getElementById('routine_class').value,
        day: document.getElementById('routine_day').value,
        startTime: document.getElementById('routine_start').value,
        endTime: document.getElementById('routine_end').value,
        subject: document.getElementById('routine_subject').value,
        facultyId: document.getElementById('routine_faculty').value,
        room: document.getElementById('routine_room').value,
        type: document.getElementById('routine_type').value
    };
    
    await saveDataToServer('routines', data, 'routineForm');
    return false;
}

// Generic save function
async function saveDataToServer(endpoint, data, formId){
    try {
        console.log(`💾 Saving ${endpoint}:`, data);
        
        const response = await fetch(`${API_URL}/config/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ ${endpoint.toUpperCase()} saved successfully!`);
            
            // Reset form
            if (formId) {
                document.getElementById(formId).reset();
            }
            
            // Reload data
            await loadAllData();
        } else {
            alert(`❌ Error: ${result.message || 'Failed to save'}`);
        }
    } catch (error) {
        console.error(`Error saving ${endpoint}:`, error);
        alert(`❌ Error connecting to server!`);
    }
}

// Show batch class modal (placeholder)
function showBatchClassModal() {
    alert('Batch class creation will be implemented in full version');
}

// ===== GENERIC EDIT FUNCTION =====
function editItem(type, id) {
    // Implementation similar to view but with form fields
    // Will be populated in full implementation
    alert(`Edit ${type} with ID: ${id}\n\nEdit functionality will populate form in modal.`);
}

// ===== GENERIC DELETE FUNCTION =====
async function deleteItem(endpoint, id, name) {
    if (!confirm(`⚠️ Delete "${name}"?\n\nThis action cannot be undone.`)) return;
    
    try {
        const response = await fetch(`${API_URL}/config/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Deleted successfully!');
            await loadAllData();
        } else {
            alert(`❌ Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error deleting:', error);
        alert('❌ Error connecting to server!');
    }
}

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    currentEditType = null;
    currentEditId = null;
}

function saveEdit() {
    alert('Save edit function - will update server');
}

function logout() {
    if (confirm('🚪 Logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

console.log('✅ configuration-complete.js loaded');