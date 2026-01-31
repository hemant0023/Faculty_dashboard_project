// ============================================
// DASHBOARD.JS - COMPLETE INTEGRATION
// Loads data from Configuration and Submissions
// ============================================

const API_URL = '/api';

let currentUser = null;
let allData = {
    universities: [],
    institutes: [],
    departments: [],
    faculty: [],
    classes: [],
    labs: [],
    routines: [],
    submissions: [],
    displays: []
};

// ===== INITIALIZE =====
window.onload = async function() {
    console.log('🚀 Initializing Dashboard...');
    
    await checkAuth();
    loadUserInfo();
    await loadAllDashboardData();
    
    console.log('✅ Dashboard initialized');
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
    document.getElementById('userAvatar').textContent = initials;
    document.getElementById('userName').textContent = currentUser.name.toUpperCase();
    document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
    document.getElementById('welcomeName').textContent = currentUser.name;
}

// ===== LOAD ALL DASHBOARD DATA =====
async function loadAllDashboardData() {
    console.log('📥 Loading all dashboard data...');
    
    try {
        // Load Configuration Data
        await Promise.all([
            loadConfigData('universities'),
            loadConfigData('institutes'),
            loadConfigData('departments'),
            loadConfigData('faculty'),
            loadConfigData('classes'),
            loadConfigData('labs'),
            //loadConfigData('routines')
        ]);
        
        // Load Submissions
        await loadSubmissions();
        
        // Load Displays
        await loadDisplays();
        
        // Display all data
        displayHierarchy();
        displayStatistics();
        displayOrganizationInfo();
        displayDepartmentMetrics();
        displayClasses();
        displayFaculty();
        displaySubmissions();
        displayDisplayDevices();
        displayLabs();
        displayActivityLog();
        
        console.log('✅ All dashboard data loaded');
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

// Load configuration data
async function loadConfigData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/config/${endpoint}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        
        if (result.success) {
            allData[endpoint] = result.data || [];
            console.log(`📥 Loaded ${endpoint}:`, allData[endpoint].length);
        }
    } catch (error) {
        console.error(`Error loading ${endpoint}:`, error);
        allData[endpoint] = [];
    }
}

// Load submissions
async function loadSubmissions() {
    try {
        const response = await fetch(`${API_URL}/submissions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();
        
        if (result.success) {
            allData.submissions = result.data || [];
            console.log('📥 Loaded submissions:', allData.submissions.length);
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        allData.submissions = [];
    }
}

// Load displays
async function loadDisplays() {
    try {
        const response = await fetch(`${API_URL}/displays`);
        const result = await response.json();
        
        if (result.success) {
            allData.displays = result.data || [];
            console.log('📥 Loaded displays:', allData.displays.length);
        }
    } catch (error) {
        console.error('Error loading displays:', error);
        allData.displays = [];
    }
}

// ===== DISPLAY HIERARCHY =====
function displayHierarchy() {
    const userDept = currentUser.department;
    const userDeptCode = currentUser.departmentCode;
    
    // Find user's department
    const department = allData.departments.find(d => 
        d.code === userDeptCode || d.name === userDept
    );
    
    let hierarchyPath = 'Home';
    
    if (department) {
        // Find institute
        const institute = allData.institutes.find(i => i.id === department.instituteId);
        
        // Find university
        const university = allData.universities.length > 0 ? allData.universities[0] : null;
        
        if (university) {
            hierarchyPath = `${university.name}`;
        }
        if (institute) {
            hierarchyPath += ` → ${institute.name}`;
        }
        hierarchyPath += ` → ${department.name}`;
    } else {
        hierarchyPath += ` → ${currentUser.department}`;
    }
    
    document.getElementById('hierarchyPath').textContent = hierarchyPath;
}

// ===== DISPLAY STATISTICS =====
function displayStatistics() {
    const userSubmissions = allData.submissions;
    
    const totalSubmissions = userSubmissions.length;
    const approved = userSubmissions.filter(s => s.approvalStatus === 'approved').length;
    const pending = userSubmissions.filter(s => s.approvalStatus === 'pending').length;
    const totalViews = userSubmissions.reduce((sum, s) => sum + (s.viewCount || 0), 0);
    
    // Main stats
    document.getElementById('totalSubmissions').textContent = totalSubmissions;
    document.getElementById('approvedSubmissions').textContent = approved;
    document.getElementById('pendingSubmissions').textContent = pending;
    document.getElementById('totalViews').textContent = totalViews;
    
    // Tooltip data - Submissions breakdown
    const now = new Date();
    const thisMonth = userSubmissions.filter(s => {
        const created = new Date(s.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    
    const thisWeek = userSubmissions.filter(s => {
        const created = new Date(s.createdAt);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return created >= weekAgo;
    }).length;
    
    const today = userSubmissions.filter(s => {
        const created = new Date(s.createdAt);
        return created.toDateString() === now.toDateString();
    }).length;
    
    const tooltipMonth = document.getElementById('tooltip-month');
    const tooltipWeek = document.getElementById('tooltip-week');
    const tooltipToday = document.getElementById('tooltip-today');
    
    if (tooltipMonth) tooltipMonth.textContent = thisMonth;
    if (tooltipWeek) tooltipWeek.textContent = thisWeek;
    if (tooltipToday) tooltipToday.textContent = today;
    
    // Approved submissions breakdown
    const activeNow = userSubmissions.filter(s => {
        if (s.approvalStatus !== 'approved') return false;
        const start = new Date(s.startDate + ' ' + s.startTime);
        const end = new Date(s.endDate + ' ' + s.endTime);
        return now >= start && now <= end;
    }).length;
    
    const scheduled = userSubmissions.filter(s => {
        if (s.approvalStatus !== 'approved') return false;
        const start = new Date(s.startDate + ' ' + s.startTime);
        return now < start;
    }).length;
    
    const completed = approved - activeNow - scheduled;
    
    const tooltipActive = document.getElementById('tooltip-active');
    const tooltipScheduled = document.getElementById('tooltip-scheduled');
    const tooltipCompleted = document.getElementById('tooltip-completed');
    
    if (tooltipActive) tooltipActive.textContent = activeNow;
    if (tooltipScheduled) tooltipScheduled.textContent = scheduled;
    if (tooltipCompleted) tooltipCompleted.textContent = completed;
    
    // Pending submissions breakdown
    const urgent = userSubmissions.filter(s => 
        s.approvalStatus === 'pending' && s.priority === 'emergency'
    ).length;
    
    const normal = pending - urgent;
    
    const tooltipUrgent = document.getElementById('tooltip-urgent');
    const tooltipNormal = document.getElementById('tooltip-normal');
    
    if (tooltipUrgent) tooltipUrgent.textContent = urgent;
    if (tooltipNormal) tooltipNormal.textContent = normal;
    
    // View stats
    const avgViews = totalSubmissions > 0 ? Math.round(totalViews / totalSubmissions) : 0;
    const mostViewed = userSubmissions.reduce((max, s) => 
        (s.viewCount || 0) > (max.viewCount || 0) ? s : max, 
        { title: 'None', viewCount: 0 }
    );
    
    const tooltipAvgViews = document.getElementById('tooltip-avgviews');
    const tooltipTopView = document.getElementById('tooltip-topview');
    const tooltipDisplays = document.getElementById('tooltip-displays');
    
    if (tooltipAvgViews) tooltipAvgViews.textContent = avgViews;
    if (tooltipTopView) tooltipTopView.textContent = mostViewed.title;
    if (tooltipDisplays) tooltipDisplays.textContent = allData.displays.length;
}

// ===== DISPLAY ORGANIZATION INFO =====
function displayOrganizationInfo() {
    const userDeptCode = currentUser.departmentCode;
    
    // Find user's department
    const department = allData.departments.find(d => 
        d.code === userDeptCode || d.departmentCode === userDeptCode
    );
    
    if (department) {
        // Find institute
        const institute = allData.institutes.find(i => i.id === department.instituteId);
        
        // Find university
        const university = allData.universities.length > 0 ? allData.universities[0] : null;
        
        // Display main info
        if (university) {
            document.getElementById('universityName').textContent = university.name;
            // University hover details
            const uniEstablished = document.getElementById('uni-established');
            const uniType = document.getElementById('uni-type');
            const uniChancellor = document.getElementById('uni-chancellor');
            if (uniEstablished) uniEstablished.textContent = university.established || 'N/A';
            if (uniType) uniType.textContent = university.type || 'N/A';
            if (uniChancellor) uniChancellor.textContent = university.chancellorName || 'N/A';
        }
        
        if (institute) {
            document.getElementById('instituteName').textContent = institute.name;
            // Institute hover details
            const instDean = document.getElementById('inst-dean');
            const instPrincipal = document.getElementById('inst-principal');
            const instDepts = document.getElementById('inst-depts');
            if (instDean) instDean.textContent = institute.deanName || 'N/A';
            if (instPrincipal) instPrincipal.textContent = institute.principalName || 'N/A';
            if (instDepts) {
                const deptCount = allData.departments.filter(d => d.instituteId === institute.id).length;
                instDepts.textContent = deptCount;
            }
        }
        
        document.getElementById('departmentName').textContent = department.name;
        document.getElementById('hodName').textContent = department.hodName || 'Not Assigned';
        
        // Department hover details
        const deptCode = document.getElementById('dept-code');
        const deptEstablished = document.getElementById('dept-established');
        const deptRating = document.getElementById('dept-rating');
        if (deptCode) deptCode.textContent = department.code || 'N/A';
        if (deptEstablished) deptEstablished.textContent = department.established || 'N/A';
        if (deptRating) deptRating.textContent = '4.5 ⭐';
        
        // HOD hover details
        const hodDesignation = document.getElementById('hod-designation');
        const hodExperience = document.getElementById('hod-experience');
        const hodEmail = document.getElementById('hod-email');
        if (hodDesignation) hodDesignation.textContent = department.hodDesignation || 'N/A';
        if (hodExperience) hodExperience.textContent = '15 years';
        if (hodEmail) hodEmail.textContent = 'hod@university.edu';
        
        // Count faculty and students in department
        const deptFaculty = allData.faculty.filter(f => f.departmentId === department.id);
        const deptClasses = allData.classes.filter(c => c.departmentId === department.id);
        const totalStudents = deptClasses.reduce((sum, c) => sum + parseInt(c.totalStudents || 0), 0);
        
        document.getElementById('totalFaculty').textContent = deptFaculty.length;
        document.getElementById('totalStudents').textContent = totalStudents;
        
        // Faculty breakdown by designation
        const professors = deptFaculty.filter(f => f.designation === 'professor').length;
        const assocProf = deptFaculty.filter(f => f.designation === 'associate-professor').length;
        const asstProf = deptFaculty.filter(f => f.designation === 'assistant-professor').length;
        
        const facProf = document.getElementById('fac-prof');
        const facAssoc = document.getElementById('fac-assoc');
        const facAsst = document.getElementById('fac-asst');
        if (facProf) facProf.textContent = professors;
        if (facAssoc) facAssoc.textContent = assocProf;
        if (facAsst) facAsst.textContent = asstProf;
        
        // Student breakdown (sample - can be made dynamic)
        const stdBoys = document.getElementById('std-boys');
        const stdGirls = document.getElementById('std-girls');
        const stdClasses = document.getElementById('std-classes');
        if (stdBoys) stdBoys.textContent = Math.round(totalStudents * 0.55);
        if (stdGirls) stdGirls.textContent = Math.round(totalStudents * 0.45);
        if (stdClasses) stdClasses.textContent = deptClasses.length;
        
    } else {
        document.getElementById('departmentName').textContent = currentUser.department;
        document.getElementById('totalFaculty').textContent = '---';
        document.getElementById('totalStudents').textContent = '---';
    }
}

// ===== DISPLAY DEPARTMENT METRICS =====
function displayDepartmentMetrics() {
    // These can be calculated or fetched from additional APIs
    // For now, showing sample data that can be made dynamic
    
    // You can add actual calculation logic here based on:
    // - Attendance data from classroom API
    // - Results from submissions
    // - Ratings from feedback
    // - Competition data from submissions
}

// ===== DISPLAY CLASSES =====
function displayClasses() {
    const tbody = document.getElementById('classesTableBody');
    const userDeptCode = currentUser.departmentCode;
    
    // Find user's department
    const department = allData.departments.find(d => 
        d.code === userDeptCode || d.departmentCode === userDeptCode
    );
    
    if (!department) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No department found</td></tr>';
        return;
    }
    
    // Filter classes for user's department
    const deptClasses = allData.classes.filter(c => c.departmentId === department.id);
    
    if (deptClasses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No classes configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    deptClasses.forEach(cls => {
        const coordinator = allData.faculty.find(f => f.id === cls.coordinator);
        const row = `
            <tr>
                <td><strong>${cls.classId}</strong></td>
                <td>Semester ${cls.semester}</td>
                <td>Section ${cls.section}</td>
                <td>${cls.totalStudents}</td>
                <td>${coordinator ? coordinator.name : 'Not Assigned'}</td>
                <td>${cls.room || '---'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== DISPLAY FACULTY =====
function displayFaculty() {
    const tbody = document.getElementById('facultyTableBody');
    const userDeptCode = currentUser.departmentCode;
    
    // Find user's department
    const department = allData.departments.find(d => d.code === userDeptCode || d.departmentCode === userDeptCode);
     if (!department) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No department found</td></tr>';
        return;
    }
    
    // Filter faculty for user's department
    const deptFaculty = allData.faculty.filter(f => f.departmentId === department.id);
    if (deptFaculty.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No faculty configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';

    deptFaculty.forEach(fac => {
       const initials = fac.name.split(' ').map(n => n[0].toUpperCase()).join('');
      // const initials = fac.name.split(' ').map(n => n[0]).join('');
        const row = `
            <tr>
                <td>
                    <div class="hoverable-name">
                        <strong>${fac.name}</strong>
                        <div class="name-hover-card">
                            <div class="hover-card-header">
                                <div class="hover-card-avatar">${initials}</div>
                                <div>
                                    <div class="hover-card-name">${fac.name}</div>
                                    <div class="hover-card-role">${fac.designation || 'Faculty'}</div>
                                </div>
                            </div>
                            <div class="hover-card-detail">
                                <span class="hover-card-label">Faculty ID:</span>
                                <span class="hover-card-value">${fac.facultyId}</span>
                            </div>
                            <div class="hover-card-detail">
                                <span class="hover-card-label">Email:</span>
                                <span class="hover-card-value">${fac.email}</span>
                            </div>
                            <div class="hover-card-detail">
                                <span class="hover-card-label">Qualification:</span>
                                <span class="hover-card-value">${fac.qualification || 'N/A'}</span>
                            </div>
                            <div class="hover-card-detail">
                                <span class="hover-card-label">Specialization:</span>
                                <span class="hover-card-value">${fac.specialization || 'N/A'}</span>
                            </div>
                            <div class="hover-card-detail">
                                <span class="hover-card-label">Phone:</span>
                                <span class="hover-card-value">${fac.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>${fac.facultyId}</td>
                <td>${fac.email}</td>
                <td>${fac.designation || '---'}</td>
                <td>${fac.specialization || '---'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== DISPLAY SUBMISSIONS =====
function displaySubmissions() {
    const tbody = document.getElementById('submissionsTableBody');
    const userSubmissions = allData.submissions;
    
    if (userSubmissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No submissions yet</td></tr>';
        return;
    }
    
    // Sort by date, most recent first
    const sortedSubmissions = userSubmissions.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 10); // Show latest 10
    
    tbody.innerHTML = '';
    sortedSubmissions.forEach(sub => {
        const date = new Date(sub.createdAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const statusClass = sub.approvalStatus === 'approved' ? 'status-approved' : 
                           sub.approvalStatus === 'pending' ? 'status-pending' : 'status-rejected';
        
        const row = `
            <tr>
                <td><strong>${sub.title}</strong></td>
                <td>${sub.category}</td>
                <td>${sub.userName}</td>
                <td>${formattedDate}</td>
                <td>${sub.description || '---'}</td>
                <td><span class="status-badge ${statusClass}">${sub.approvalStatus.toUpperCase()}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== DISPLAY DISPLAY DEVICES =====
function displayDisplayDevices() {
    const tbody = document.getElementById('displaysTableBody');
    const userDeptCode = currentUser.departmentCode;
    
    // Filter displays for user's department
    const deptDisplays = allData.displays.filter(d => 
        d.departmentCode === userDeptCode || d.displayType === 'institute'
    );
    
    if (deptDisplays.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No display devices configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    deptDisplays.forEach(display => {
        const statusClass = display.status === 'active' ? 'status-online' : 'status-offline';
        const lastActive = new Date(display.lastActive);
        const formattedTime = lastActive.toLocaleTimeString();
        
        const row = `
            <tr>
                <td><strong>${display.displayName}</strong></td>
                <td>${display.displayCode}</td>
                <td>${display.location}</td>
                <td>${display.ipAddress || '---'}</td>
                <td><span class="status-badge ${statusClass}">${display.status.toUpperCase()}</span></td>
                <td>${formattedTime}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== DISPLAY LABS =====
function displayLabs() {
    const tbody = document.getElementById('labsTableBody');
    const userDeptCode = currentUser.departmentCode;
    
    // Find user's department
    const department = allData.departments.find(d => 
        d.code === userDeptCode || d.departmentCode === userDeptCode
    );
    
    if (!department) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No department found</td></tr>';
        return;
    }
    
    // Filter labs for user's department
    const deptLabs = allData.labs.filter(l => l.departmentId === department.id);
    
    if (deptLabs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No labs configured</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    deptLabs.forEach(lab => {
        const incharge = allData.faculty.find(f => f.id === lab.incharge);
        const statusClass = lab.status === 'operational' ? 'status-operational' : 'status-maintenance';
        
        const row = `
            <tr>
                <td><strong>${lab.name}</strong></td>
                <td>${lab.code}</td>
                <td>${lab.room}</td>
                <td>${lab.capacity} Students</td>
                <td>${incharge ? incharge.name : 'Not Assigned'}</td>
                <td><span class="status-badge ${statusClass}">${(lab.status || 'operational').toUpperCase()}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ===== DISPLAY ACTIVITY LOG =====
function displayActivityLog() {
    const activityLog = document.getElementById('activityLog');
    
    // Combine all recent activities
    const activities = [];
    
    // Add submissions
    allData.submissions.slice(0, 5).forEach(sub => {
        activities.push({
            icon: '📝',
            title: `New submission: ${sub.title}`,
            subtitle: `By ${sub.userName}`,
            time: sub.createdAt
        });
    });
    
    // Add config changes (if any have timestamps)
    if (allData.classes.length > 0) {
        const latestClass = allData.classes[allData.classes.length - 1];
        if (latestClass.createdAt) {
            activities.push({
                icon: '🎓',
                title: `New class created: ${latestClass.classId}`,
                subtitle: 'Configuration update',
                time: latestClass.createdAt
            });
        }
    }
    
    if (allData.faculty.length > 0) {
        const latestFaculty = allData.faculty[allData.faculty.length - 1];
        if (latestFaculty.createdAt) {
            activities.push({
                icon: '👨‍🏫',
                title: `New faculty added: ${latestFaculty.name}`,
                subtitle: 'Configuration update',
                time: latestFaculty.createdAt
            });
        }
    }
    
    // Sort by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    if (activities.length === 0) {
        activityLog.innerHTML = '<div class="activity-item"><div class="activity-icon">ℹ️</div><div class="activity-content"><div class="activity-title">No recent activity</div></div></div>';
        return;
    }
    
    activityLog.innerHTML = '';
    activities.slice(0, 10).forEach(activity => {
        const timeAgo = getTimeAgo(new Date(activity.time));
        const item = `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-subtitle">${activity.subtitle}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            </div>
        `;
        activityLog.innerHTML += item;
    });
}

// Helper function for time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
}

// ===== LOGOUT =====
function logout() {
    if (confirm('🚪 Logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

console.log('✅ dashboard.js loaded');