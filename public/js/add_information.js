// ============================================
// ADD INFORMATION - ENHANCED FILE UPLOAD
// File: add_information.js
// ============================================

// ===== CONFIGURATION =====
//const API_URL = 'http://localhost:5000/api';
const API_URL = '/api';
const SERVER_BASE = 'http://localhost:5000';

// ===== GLOBAL VARIABLES =====
let currentUser = null;
let submittedEntries = [];
let editingEntryId = null;

// ===== INITIALIZE ON PAGE LOAD =====
window.onload = async function() {
    console.log('🚀 Initializing Add Information page...');
    
    await checkAuth();
    loadUserInfo();
    setDefaultDates();
    updatePreview();
    await loadSubmittedEntries();
};

// ===== CHECK AUTHENTICATION =====
async function checkAuth() {
    console.log('🔐 Checking authentication...');
    
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
        console.log('❌ Not logged in, redirecting to login page...');
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    console.log('✅ User authenticated:', currentUser.name);
}

// ===== LOAD USER INFO (UPPERCASE) =====
function loadUserInfo() {
    if (!currentUser) return;
    
    console.log('👤 Loading user info...');
    
    // Display all user info in UPPERCASE
    document.getElementById('userId').textContent = (currentUser.userId || 'N/A').toUpperCase();
    document.getElementById('userName').textContent = (currentUser.name || 'N/A').toUpperCase();
    document.getElementById('userRole').textContent = (currentUser.role || 'N/A').toUpperCase();
    document.getElementById('userDept').textContent = (currentUser.department || 'N/A').toUpperCase();
    document.getElementById('userScope').textContent = (currentUser.postingScope || 'N/A').toUpperCase();
    
    // Approval status
    document.getElementById('approvalRequired').textContent = 
        currentUser.requiresApproval ? 'REQUIRES ADMIN APPROVAL' : 'DIRECT PUBLISHING';
    
    // User avatar (initials)
    const initials = currentUser.name.split(' ').map(n => n[0].toUpperCase()).join('');
    document.getElementById('userAvatar').textContent = initials;
    
    // Header user info
    document.getElementById('headerUserInfo').textContent = 
        `${currentUser.name.toUpperCase()} | ${currentUser.role.toUpperCase()} | ${currentUser.departmentCode.toUpperCase()}`;
    
    // Disable institute option if user doesn't have permission
    if (!currentUser.canPostInstitute) {
        const instituteOption = document.getElementById('instituteOption');
        if (instituteOption) {
            instituteOption.disabled = true;
            instituteOption.textContent = '🔒 Institute Level (Requires Admin Rights)';
        }
    }
    
    console.log('✅ User info loaded successfully (UPPERCASE)');
}

// ===== SET DEFAULT DATES =====
function setDefaultDates() {
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const startTime = now.toTimeString().slice(0, 5);
    
    document.getElementById('startDate').value = startDate;
    document.getElementById('startTime').value = startTime;
    
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('endTime').value = startTime;
}

// ===== UPDATE CONTENT OPTIONS =====
function updateContentOptions() {
    const contentType = document.getElementById('contentType').value;
    const fileUpload = document.getElementById('fileUpload');
    
    console.log('📝 Content type changed to:', contentType);
    
    // Set file input accept based on content type
    switch(contentType) {
        case 'pdf':
            fileUpload.accept = '.pdf';
            console.log('📄 Accepting PDF files');
            break;
        case 'word':
            fileUpload.accept = '.doc,.docx';
            console.log('📝 Accepting Word files');
            break;
        case 'image':
            fileUpload.accept = '.jpg,.jpeg,.png,.gif';
            console.log('🖼️ Accepting Image files');
            break;
        case 'video':
            fileUpload.accept = '.mp4,.avi,.mov';
            console.log('🎬 Accepting Video files');
            break;
        default:
            fileUpload.accept = '';
    }
    
    // Clear file input when type changes
    fileUpload.value = '';
    document.getElementById('filePreview').style.display = 'none';
    
    updatePreview();
}

// ===== HANDLE FILE UPLOAD WITH ENHANCED VALIDATION =====
function handleFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    const filePreview = document.getElementById('filePreview');
    const file = fileInput.files[0];
    
    console.log('\n📁 FILE UPLOAD:');
    console.log('File selected:', file ? file.name : 'None');
    
    if (!file) {
        filePreview.style.display = 'none';
        return;
    }
    
    // Get file details
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeKB = (file.size / 1024).toFixed(2);
    const contentType = document.getElementById('contentType').value;
    
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', sizeMB, 'MB');
    console.log('Content type:', contentType);
    
    // Validate file size based on content type
    let sizeStatus = 'good';
    let sizeClass = 'size-good';
    let maxSize = 0;
    
    if (contentType === 'video') {
        maxSize = 50;
        if (sizeMB > 50) sizeStatus = 'error';
        else if (sizeMB > 40) sizeStatus = 'warning';
    } else if (contentType === 'image') {
        maxSize = 15;
        if (sizeMB > 5) sizeStatus = 'error';
        else if (sizeMB > 4) sizeStatus = 'warning';
    } else {
        maxSize = 10;
        if (sizeMB > 10) sizeStatus = 'error';
        else if (sizeMB > 8) sizeStatus = 'warning';
    }
    
    console.log('Size status:', sizeStatus, '(Max:', maxSize, 'MB)');
    
    if (sizeStatus === 'error') sizeClass = 'size-error';
    else if (sizeStatus === 'warning') sizeClass = 'size-warning';
    
    // Build preview HTML
    let dimensionsHTML = '';
    if (contentType === 'image' && file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = function() {
            const dimensions = `${this.width} × ${this.height} px`;
            document.getElementById('imageDimensions').textContent = dimensions;
            console.log('Image dimensions:', dimensions);
        };
        img.src = URL.createObjectURL(file);
        dimensionsHTML = '<br><strong>📐 Dimensions:</strong> <span id="imageDimensions">Loading...</span>';
    }
    
    filePreview.innerHTML = `
        <div style="padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
            <strong>📎 File Name:</strong> ${file.name}<br>
            <strong>📊 File Type:</strong> ${file.type || 'Unknown'}<br>
            <strong>💾 File Size:</strong> ${sizeMB} MB (${sizeKB} KB)
            <div class="file-size-info" style="margin-top: 10px;">
                <span class="size-badge ${sizeClass}">
                    ${sizeStatus === 'good' ? '✓ Size OK' : sizeStatus === 'warning' ? '⚠ Close to Limit' : '✗ Exceeds Limit'}
                </span>
                <span style="font-size: 11px; margin-left: 10px;">Max: ${maxSize} MB</span>
            </div>
            ${dimensionsHTML}
        </div>
    `;
    filePreview.style.display = 'block';
    
    // Show error if file too large
    if (sizeStatus === 'error') {
        console.error('❌ File size exceeds limit!');
        alert(`⚠️ FILE SIZE EXCEEDS LIMIT!\n\nCurrent size: ${sizeMB} MB\nMaximum allowed: ${maxSize} MB\n\nPlease select a smaller file.`);
        fileInput.value = '';
        filePreview.style.display = 'none';
        document.getElementById('fileError').style.display = 'block';
        return;
    }
    
    document.getElementById('fileError').style.display = 'none';
    console.log('✅ File validation passed');
    
    updatePreview();
}

// ===== UPDATE DISPLAY OPTIONS =====
function updateDisplayOptions() {
    const scope = document.getElementById('displayScope').value;
    const deptDisplays = document.getElementById('departmentDisplays');
    const instDisplays = document.getElementById('instituteDisplays');
    
    console.log('📺 Display scope changed to:', scope);
    
    if (scope === 'institute') {
        deptDisplays.style.display = 'none';
        instDisplays.style.display = 'flex';
    } else {
        deptDisplays.style.display = 'flex';
        instDisplays.style.display = 'none';
    }
    
    updatePreview();
}

// ===== TOGGLE ALL DISPLAYS =====
function toggleAllDisplays() {
    const selectAll = document.getElementById('selectAllDisplays');
    const checkboxes = document.querySelectorAll('.display-check');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updatePreview();
}

function toggleAllInstitute() {
    const selectAll = document.getElementById('selectAllInstitute');
    const checkboxes = document.querySelectorAll('.institute-check');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updatePreview();
}

// ===== UPDATE PREVIEW =====
function updatePreview() {
    document.getElementById('previewTitle').textContent = 
        document.getElementById('title').value || 'Not set';
    
    const category = document.getElementById('category');
    document.getElementById('previewCategory').textContent = 
        category.selectedIndex > 0 ? category.options[category.selectedIndex].text : 'Not set';
    
    const contentType = document.getElementById('contentType');
    document.getElementById('previewType').textContent = 
        contentType.selectedIndex > 0 ? contentType.options[contentType.selectedIndex].text : 'Not set';
    
    const priority = document.getElementById('priority');
    document.getElementById('previewPriority').textContent = 
        priority.options[priority.selectedIndex].text;
    
    const startDate = document.getElementById('startDate').value;
    const startTime = document.getElementById('startTime').value;
    const endDate = document.getElementById('endDate').value;
    const endTime = document.getElementById('endTime').value;
    if (startDate && endDate) {
        document.getElementById('previewSchedule').textContent = 
            `${startDate} ${startTime} to ${endDate} ${endTime}`;
    }
    
    const scope = document.getElementById('displayScope').value;
    let targetText = 'Not set';
    if (scope === 'department') {
        const checkedDisplays = Array.from(document.querySelectorAll('.display-check:checked'));
        if (checkedDisplays.length > 0) {
            targetText = checkedDisplays.length === document.querySelectorAll('.display-check').length 
                ? 'All ECE Displays' 
                : `${checkedDisplays.length} ECE Display(s)`;
        }
    } else if (scope === 'institute') {
        const checkedDisplays = Array.from(document.querySelectorAll('.institute-check:checked'));
        if (checkedDisplays.length > 0) {
            targetText = checkedDisplays.length === document.querySelectorAll('.institute-check').length 
                ? 'All Institute Displays' 
                : `${checkedDisplays.length} Institute Display(s)`;
        }
    }
    document.getElementById('previewTarget').textContent = targetText;
    
    document.getElementById('previewImportant').textContent = 
        document.getElementById('importantNote').checked ? 'Yes ⭐' : 'No';
}

// ===== FORM VALIDATION =====
function validateForm() {
    let isValid = true;
    
    console.log('\n✔️ VALIDATING FORM:');
    
    // Validate title
    if (!document.getElementById('title').value.trim()) {
        console.log('❌ Title is missing');
        document.getElementById('titleError').style.display = 'block';
        isValid = false;
    } else {
        console.log('✅ Title OK');
        document.getElementById('titleError').style.display = 'none';
    }
    
    // Validate file
    if (!document.getElementById('fileUpload').files.length) {
        console.log('❌ File is missing');
        document.getElementById('fileError').style.display = 'block';
        isValid = false;
    } else {
        console.log('✅ File OK');
        document.getElementById('fileError').style.display = 'none';
    }
    
    // Validate dates
    const startDate = new Date(document.getElementById('startDate').value + ' ' + document.getElementById('startTime').value);
    const endDate = new Date(document.getElementById('endDate').value + ' ' + document.getElementById('endTime').value);
    
    if (endDate <= startDate) {
        console.log('❌ End date must be after start date');
        document.getElementById('dateError').style.display = 'block';
        isValid = false;
    } else {
        console.log('✅ Dates OK');
        document.getElementById('dateError').style.display = 'none';
    }
    
    // Validate display selection
    const scope = document.getElementById('displayScope').value;
    let hasDisplay = false;
    
    if (scope === 'department') {
        hasDisplay = document.querySelectorAll('.display-check:checked').length > 0;
    } else {
        hasDisplay = document.querySelectorAll('.institute-check:checked').length > 0;
    }
    
    if (!hasDisplay) {
        console.log('❌ No displays selected');
        document.getElementById('displayError').style.display = 'block';
        isValid = false;
    } else {
        console.log('✅ Displays OK');
        document.getElementById('displayError').style.display = 'none';
    }
    
    console.log('Validation result:', isValid ? 'PASSED ✅' : 'FAILED ❌');
    return isValid;
}

// ===== GET SELECTED DISPLAYS =====
function getSelectedDisplays() {
    const scope = document.getElementById('displayScope').value;
    const displays = [];
    
    if (scope === 'department') {
        document.querySelectorAll('.display-check:checked').forEach(cb => {
            displays.push(cb.value);
        });
    } else {
        document.querySelectorAll('.institute-check:checked').forEach(cb => {
            displays.push(cb.value);
        });
    }
    
    console.log('Selected displays:', displays);
    return displays;
}

// ===== FORM SUBMISSION WITH FILE UPLOAD =====
document.getElementById('addInfoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('\n' + '='.repeat(80));
    console.log('📝 SUBMITTING FORM WITH FILE UPLOAD');
    console.log('='.repeat(80));
    
    // Validate form
    if (!validateForm()) {
        alert('⚠️ Please fill in all required fields correctly.');
        return;
    }
    
    // Get file
    const fileInput = document.getElementById('fileUpload');
    const file = fileInput.files[0];
    
    console.log('\n📁 FILE INFORMATION:');
    console.log('  Name:', file.name);
    console.log('  Type:', file.type);
    console.log('  Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Create FormData
    const formData = new FormData();
    
    // IMPORTANT: Add file first
    formData.append('file', file);
    
    // IMPORTANT: Add contentType BEFORE multer processes file
    const contentType = document.getElementById('contentType').value;
    formData.append('contentType', contentType);
    
    console.log('\n📤 FORM DATA:');
    console.log('  Content Type:', contentType);
    
    // Add userId for file naming
    formData.append('userId', currentUser.userId);
    console.log('  User ID:', currentUser.userId);
    
    // Add all other fields
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('orientation', document.getElementById('orientation').value);
    formData.append('withSound', document.getElementById('withSound').checked);
    formData.append('startDate', document.getElementById('startDate').value);
    formData.append('startTime', document.getElementById('startTime').value);
    formData.append('endDate', document.getElementById('endDate').value);
    formData.append('endTime', document.getElementById('endTime').value);
    formData.append('autoRemove', document.getElementById('autoRemove').checked);
    formData.append('waitTime', document.getElementById('waitTime').value);
    formData.append('repeatMode', document.getElementById('repeatMode').value);
    formData.append('priority', document.getElementById('priority').value);
    formData.append('importantNote', document.getElementById('importantNote').checked);
    formData.append('displayScope', document.getElementById('displayScope').value);
    
    // Add selected displays as JSON string
    const selectedDisplays = getSelectedDisplays();
    formData.append('selectedDisplays', JSON.stringify(selectedDisplays));
    console.log('  Selected Displays:', selectedDisplays);
    
    console.log('\n📡 SENDING TO SERVER:', `${API_URL}/submissions`);
    
    try {
        const response = await fetch(`${API_URL}/submissions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
                // NOTE: Do NOT set Content-Type - FormData sets it automatically
            },
            body: formData
        });
        
        console.log('📥 Response status:', response.status);
        
        const result = await response.json();
        console.log('📥 Response data:', result);
        
        if (result.success) {
            console.log('\n✅ SUBMISSION SUCCESSFUL!');
            console.log('  Submission ID:', result.data.submissionId);
            console.log('  File Name:', result.data.fileName);
            console.log('  File Path:', result.data.filePath);
            console.log('  File URL:', result.data.fileUrl);
            console.log('  Approval Status:', result.data.approvalStatus);
            
            alert(`✅ INFORMATION SUBMITTED SUCCESSFULLY!

Submission ID: ${result.data.submissionId}
Title: ${result.data.title}

📁 FILE UPLOADED:
Name: ${result.data.fileName}
Size: ${result.data.fileSize}
URL: ${result.data.fileUrl}

Status: ${result.data.approvalStatus === 'approved' ? '✅ APPROVED' : '⏳ PENDING APPROVAL'}

You can view your submission in the "Submitted Entries" section below.`);
            
            // Reload entries and reset form
            await loadSubmittedEntries();
            resetForm();
            
            // Show entries section
            document.getElementById('entriesSection').style.display = 'block';
            document.getElementById('entriesSection').scrollIntoView({ behavior: 'smooth' });
            
            console.log('='.repeat(80) + '\n');
        } else {
            console.error('❌ SUBMISSION FAILED:', result.message);
            alert('❌ Submission failed: ' + result.message);
        }
    } catch (error) {
        console.error('❌ ERROR:', error);
        alert('❌ Error connecting to server!\n\nMake sure:\n1. Server is running (node server.js)\n2. Server is on port 5000\n3. Check console for details');
    }
});

// ===== LOAD SUBMITTED ENTRIES FROM SERVER =====
async function loadSubmittedEntries() {
    console.log('\n📥 LOADING SUBMISSIONS FROM SERVER...');
    
    try {
        const response = await fetch(`${API_URL}/submissions`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const result = await response.json();
        console.log('📥 Loaded', result.count, 'submissions');
        
        if (result.success) {
            submittedEntries = result.data;
            displaySubmittedEntries();
        } else {
            console.error('❌ Failed to load:', result.message);
        }
    } catch (error) {
        console.error('❌ Error loading submissions:', error);
    }
}

// ===== DISPLAY SUBMITTED ENTRIES =====
function displaySubmittedEntries() {
    const tbody = document.getElementById('entriesTableBody');
    document.getElementById('entriesCount').textContent = submittedEntries.length + ' ENTRIES';
    
    if (submittedEntries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <strong>NO SUBMISSIONS YET</strong><br>
                    Add your first information entry above
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    // Show newest first
    submittedEntries.slice().reverse().forEach((entry) => {
        const row = document.createElement('tr');
        
        // Status badge
        const statusClass = entry.approvalStatus === 'approved' ? 'status-approved' : 
                           entry.approvalStatus === 'draft' ? 'status-draft' : 'status-pending';
        const statusText = entry.approvalStatus === 'approved' ? '✓ APPROVED' : 
                          entry.approvalStatus === 'draft' ? '📝 DRAFT' : '⏳ PENDING';
        
        row.innerHTML = `
            <td><strong>${entry.submissionId}</strong></td>
            <td>${entry.title}</td>
            <td>${entry.category.toUpperCase()}</td>
            <td>${entry.contentType.toUpperCase()}</td>
            <td><strong>${entry.fileSize}</strong></td>
            <td style="font-size: 11px;">${entry.startDate} to ${entry.endDate}</td>
            <td>${entry.selectedDisplays ? entry.selectedDisplays.length : 0} Display(s)</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="openFile('${entry.fileUrl}', '${entry.fileName}', '${entry.contentType}')" title="Open file">
                        📁 OPEN
                    </button>
                    <button class="edit-btn" onclick="viewEntry('${entry.submissionId}')" title="View details">
                        👁️ VIEW
                    </button>
                    <button class="delete-btn" onclick="deleteEntry('${entry.submissionId}')" title="Delete entry">
                        🗑️ DELETE
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('✅ Displayed', submittedEntries.length, 'entries');
}

// ===== OPEN UPLOADED FILE =====
function openFile(fileUrl, fileName, contentType) {
    
    console.log('\n📁 OPENING FILE:');
    console.log('  Name:', fileName);
    console.log('  URL:', fileUrl);
    console.log('  Type:', contentType);
    
    // Build full URL
   // const fullUrl = `${SERVER_BASE}${fileUrl}`;
   const fullUrl = `${fileUrl}`;
    console.log('  Full URL:', fullUrl);
    
    // Open in new tab
    window.open(fullUrl, '_blank');
    
    console.log('✅ File opened in new tab');
}

// ===== VIEW ENTRY DETAILS =====
async function viewEntry(id) {
    console.log('\n👁️ VIEWING ENTRY:', id);
    
    try {
        const response = await fetch(`${API_URL}/submissions/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const entry = result.data;
            
            console.log('Entry details:', entry);
            
            // Show detailed popup
            alert(`📋 SUBMISSION DETAILS

ID: ${entry.submissionId}
TITLE: ${entry.title.toUpperCase()}
CATEGORY: ${entry.category.toUpperCase()}
CONTENT TYPE: ${entry.contentType.toUpperCase()}
PRIORITY: ${entry.priority.toUpperCase()}
STATUS: ${entry.approvalStatus.toUpperCase()}

📁 FILE INFORMATION:
Name: ${entry.fileName}
Size: ${entry.fileSize}
Path: ${entry.filePath}
URL: ${entry.fileUrl}

📅 SCHEDULE:
Start: ${entry.startDate} ${entry.startTime}
End: ${entry.endDate} ${entry.endTime}
Auto Remove: ${entry.autoRemove ? 'YES' : 'NO'}

📺 DISPLAY:
Scope: ${entry.displayScope.toUpperCase()}
Targets: ${entry.selectedDisplays ? entry.selectedDisplays.join(', ') : 'None'}
Count: ${entry.selectedDisplays ? entry.selectedDisplays.length : 0}

📝 DESCRIPTION:
${entry.description || 'No description provided'}

👤 CREATED BY:
Name: ${entry.userName}
User ID: ${entry.userId}
Department: ${entry.department}

📊 STATISTICS:
Views: ${entry.viewCount || 0}
Displays: ${entry.displayCount || 0}

⏰ TIMESTAMPS:
Created: ${new Date(entry.createdAt).toLocaleString()}
Updated: ${new Date(entry.lastUpdated).toLocaleString()}
            `);
        } else {
            alert('❌ Could not load entry details');
        }
    } catch (error) {
        console.error('❌ Error viewing entry:', error);
        alert('❌ Error loading entry details');
    }
}

// ===== DELETE ENTRY AND FILE =====
async function deleteEntry(id) {
    if (!confirm('🗑️ DELETE CONFIRMATION\n\nAre you sure you want to delete this entry?\n\nThis will:\n• Remove the submission from database\n• Delete the uploaded file from server\n• This action CANNOT be undone\n\nProceed with deletion?')) {
        return;
    }
    
    console.log('\n🗑️ DELETING ENTRY:', id);
    
    try {
        const response = await fetch(`${API_URL}/submissions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const result = await response.json();
        console.log('Delete response:', result);
        
        if (result.success) {
            console.log('✅ Entry deleted successfully');
            alert('✅ ENTRY DELETED SUCCESSFULLY!\n\nThe submission and its file have been permanently removed.');
            await loadSubmittedEntries();
        } else {
            console.error('❌ Delete failed:', result.message);
            alert('❌ Failed to delete: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Error deleting:', error);
        alert('❌ Error connecting to server');
    }
}

// ===== TOGGLE ENTRIES VIEW =====
function toggleEntriesView() {
    const section = document.getElementById('entriesSection');
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadSubmittedEntries();
    } else {
        section.style.display = 'none';
    }
}

// ===== RESET FORM =====
function resetForm() {
    console.log('🔄 Resetting form...');
    document.getElementById('addInfoForm').reset();
    document.getElementById('filePreview').style.display = 'none';
    setDefaultDates();
    updatePreview();
    editingEntryId = null;
    console.log('✅ Form reset');
}

// ===== SAVE DRAFT =====
async function saveDraft() {
    const draftData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        contentType: document.getElementById('contentType').value,
        draftData: {
            orientation: document.getElementById('orientation').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            priority: document.getElementById('priority').value,
            displayScope: document.getElementById('displayScope').value
        }
    };
    
    console.log('💾 Saving draft:', draftData);
    
    try {
        const response = await fetch(`${API_URL}/drafts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(draftData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Draft saved:', result.data.draftId);
            alert('💾 DRAFT SAVED SUCCESSFULLY!\n\nDraft ID: ' + result.data.draftId);
        } else {
            alert('❌ Failed to save draft: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Error saving draft:', error);
        alert('❌ Error connecting to server');
    }
}

// ===== LOGOUT =====
async function logout() {
    if (confirm('🚪 LOGOUT CONFIRMATION\n\nAre you sure you want to logout?')) {
        console.log('👋 Logging out...');
        
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('✅ Logged out successfully');
        window.location.href = 'login.html';
    }
}

// ===== ADD EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Attaching event listeners...');
    
    document.getElementById('title')?.addEventListener('input', updatePreview);
    document.getElementById('category')?.addEventListener('change', updatePreview);
    document.getElementById('priority')?.addEventListener('change', updatePreview);
    document.getElementById('startDate')?.addEventListener('change', updatePreview);
    document.getElementById('startTime')?.addEventListener('change', updatePreview);
    document.getElementById('endDate')?.addEventListener('change', updatePreview);
    document.getElementById('endTime')?.addEventListener('change', updatePreview);
    document.getElementById('importantNote')?.addEventListener('change', updatePreview);
    
    document.querySelectorAll('.display-check, .institute-check').forEach(cb => {
        cb.addEventListener('change', updatePreview);
    });
    
    console.log('✅ Event listeners attached');
});

// ===== EXPOSE FUNCTIONS TO WINDOW =====
window.updateContentOptions = updateContentOptions;
window.handleFileUpload = handleFileUpload;
window.updateDisplayOptions = updateDisplayOptions;
window.toggleAllDisplays = toggleAllDisplays;
window.toggleAllInstitute = toggleAllInstitute;
window.resetForm = resetForm;
window.saveDraft = saveDraft;
window.toggleEntriesView = toggleEntriesView;
window.openFile = openFile;
window.viewEntry = viewEntry;
window.deleteEntry = deleteEntry;
window.logout = logout;

console.log('✅ add_information.js loaded with ENHANCED file upload support');