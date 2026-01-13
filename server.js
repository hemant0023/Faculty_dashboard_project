
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Initialize Express app
const app = express();

// ==============================================
// MIDDLEWARE CONFIGURATION
// ==============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==============================================
// HELPER FUNCTIONS
// ==============================================

// Generate human-readable timestamp
function getHumanReadableTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// Generate filename with human-readable timestamp
function generateFileName(userId, originalName) {
    const timestamp = getHumanReadableTimestamp();
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    
    return `${userId}_${timestamp}_${nameWithoutExt}${ext}`;
}

// ==============================================
// CREATE FOLDERS & DATA FILES
// ==============================================

const uploadsFolders = [
    'uploads',
    'uploads/pdf',
    'uploads/word',
    'uploads/images',
    'uploads/videos'
];

const dataFolders = [
    'data',
    'data/submissions',
    'data/users',
    'data/departments',
    'data/classrooms',
    'data/displays',
    'data/backups'
];

[...uploadsFolders, ...dataFolders].forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        console.log(`✅ Created folder: ${folder}`);
    }
});

// Data file paths
const SUBMISSIONS_FILE = './data/submissions/submissions.json';
const USERS_FILE = './data/users/users.json';
const DEPARTMENTS_FILE = './data/departments/departments.json';
const CLASSROOMS_FILE = './data/classrooms/classrooms.json';
const DISPLAYS_FILE = './data/displays/displays.json';

// ==============================================
// MULTER FILE UPLOAD CONFIGURATION (FIXED)
// ==============================================

// We'll use a two-step approach:
// 1. Store file with temporary name
// 2. Rename it after we have the userId from body

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('\n🔍 MULTER DESTINATION FUNCTION:');
        
        let uploadPath = './uploads';
        
        // Detect from mimetype
        console.log('📁 File mimetype:', file.mimetype);
        
        if (file.mimetype === 'application/pdf') {
            uploadPath = './uploads/pdf';
        } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
            uploadPath = './uploads/word';
        } else if (file.mimetype.startsWith('image/')) {
            uploadPath = './uploads/images';
        } else if (file.mimetype.startsWith('video/')) {
            uploadPath = './uploads/videos';
        }
        
        console.log('📂 Upload Path:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        console.log('\n🔍 MULTER FILENAME FUNCTION:');
        
        // Generate temporary filename with timestamp
        const tempTimestamp = Date.now();
        const ext = path.extname(file.originalname);
        const tempName = `temp_${tempTimestamp}${ext}`;
        
        console.log('📝 Temporary Name:', tempName);
        console.log('⚠️ Will rename after getting userId from body');
        
        cb(null, tempName);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('\n🔍 MULTER FILE FILTER:');
    console.log('📁 File:', file.originalname);
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    console.log('📎 Extension:', ext);
    console.log('✅ Allowed:', allowedExtensions.includes(ext));
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${ext}. Allowed: ${allowedExtensions.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 52428800 // 50MB
    }
});

// ==============================================
// DATA PERSISTENCE FUNCTIONS
// ==============================================

function loadData(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(data);
            const fileName = path.basename(filePath);
            console.log(`📥 Loaded ${parsed.length || 0} items from ${fileName}`);
            return parsed;
        }
    } catch (error) {
        console.error(`❌ Error loading ${filePath}:`, error.message);
    }
    return [];
}

function saveData(filePath, data, dataType) {
    try {
        // Save main file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        const fileName = path.basename(filePath);
        console.log(`💾 Saved ${data.length || 0} items to ${fileName}`);
        
        // // Create human-readable backup
        // const timestamp = getHumanReadableTimestamp();
        // const backupFileName = fileName.replace('.json', `_backup_${timestamp}.json`);
        // const backupPath = `./data/backups/${backupFileName}`;
        // fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        // console.log(`📦 Backup saved: ${backupFileName}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${filePath}:`, error.message);
        return false;
    }
}

// ==============================================
// IN-MEMORY DATA STORAGE (WITH PERSISTENCE)
// ==============================================

let users = loadData(USERS_FILE);

// If no users in file, create default users
if (users.length === 0) {
    users = [
         {
        userId: 'FAC-1011',
        name: 'HEMANT HARLALKA',
        email: 'hemantharlalka@university.edu',
        password: 'hemant@123', // ⚠️ Plain text for testing only!
        role: 'faculty',
        department: 'Electronics and Communication',
        departmentCode: 'ECE',
        postingScope: 'department',
        canPostInstitute: false,
        requiresApproval: true
    },
     {
        userId: 'FAC-1012',
        name: 'KALPESH YADAV',
        email: 'kalpeshyadav@university.edu',
        password: 'kalpesh@123', // ⚠️ Plain text for testing only!
        role: 'DEPARMENT_ADMIN',
        department: 'Electronics and Communication',
        departmentCode: 'ECE',
        postingScope: 'INSTITUTE',
        canPostInstitute: true,
        requiresApproval: false
    },
    
    {
            userId: 'FAC-1023',
            name: 'Anjali Sharma',
            email: 'anjali.sharma@university.edu',
            password: 'faculty123',
            role: 'faculty',
            department: 'Electronics and Communication',
            departmentCode: 'ECE',
            postingScope: 'department',
            canPostInstitute: false,
            requiresApproval: true,
            createdAt: new Date().toISOString()
        },
        {
            userId: 'ADMIN-001',
            name: 'System Administrator',
            email: 'admin@university.edu',
            password: 'admin123',
            role: 'admin',
            department: 'Administration',
            departmentCode: 'ADMIN',
            postingScope: 'institute',
            canPostInstitute: true,
            requiresApproval: false,
            createdAt: new Date().toISOString()
        },
        {
            userId: 'FAC-1011',
            name: 'Hemant Harlalka',
            email: 'hemantharlalka@university.edu',
            password: 'hemant@123',
            role: 'faculty',
            department: 'Electronics and Communication',
            departmentCode: 'ECE',
            postingScope: 'department',
            canPostInstitute: false,
            requiresApproval: false,
            createdAt: new Date().toISOString()
        }
    ];
    saveData(USERS_FILE, users, 'users');
}

let submissions = loadData(SUBMISSIONS_FILE);
let drafts = [];
let currentUser = null;

// Departments data
let departments = loadData(DEPARTMENTS_FILE);
if (departments.length === 0) {
    departments = [
        {
            departmentId: 'DEPT-ECE',
            departmentCode: 'ECE',
            departmentName: 'Electronics and Communication',
            hodName: 'Dr. KALPESH YADAV',
            hodDesignation: 'Ph.D., M.Tech (VLSI)',
            established: '1995',
            totalStudents: 480,
            totalFaculty: 24,
            createdAt: new Date().toISOString()
        }
    ];
    saveData(DEPARTMENTS_FILE, departments, 'departments');
}

// Display screens configuration
let displayScreens = loadData(DISPLAYS_FILE);
if (displayScreens.length === 0) {
    displayScreens = [
        {
            displayId: 'ECE-MAIN-001',
            displayName: 'ECE Main Display',
            displayCode: 'ece-main',
            department: 'Electronics and Communication',
            departmentCode: 'ECE',
            location: 'ECE Department - Main Entrance',
            displayType: 'department',
            ipAddress: '192.168.1.101',
            macAddress: '00:1B:44:11:3A:B7',
            status: 'active',
            orientation: 'landscape',
            resolution: '1920x1080',
            lastActive: new Date().toISOString(),
            config: {
                autoRefresh: 30,
                showNav: true,
                showRightSidebar: true,
                temperature: 22,
                humidity: 45,
                hodName: 'Dr. Rajesh Kumar'
            },
            createdAt: new Date().toISOString()
        },
        {
            displayId: 'ECE-LAB-001',
            displayName: 'ECE Lab Display',
            displayCode: 'ece-lab',
            department: 'Electronics and Communication',
            departmentCode: 'ECE',
            location: 'ECE Department - Lab Area',
            displayType: 'department',
            ipAddress: '192.168.1.102',
            macAddress: '00:1B:44:11:3A:B8',
            status: 'active',
            orientation: 'landscape',
            resolution: '1920x1080',
            lastActive: new Date().toISOString(),
            config: {
                autoRefresh: 30,
                showNav: true,
                showRightSidebar: true,
                temperature: 23,
                humidity: 46,
                hodName: 'Dr. Rajesh Kumar'
            },
            createdAt: new Date().toISOString()
        },
        {
            displayId: 'ECE-SEM-001',
            displayName: 'ECE Seminar Display',
            displayCode: 'ece-seminar',
            department: 'Electronics and Communication',
            departmentCode: 'ECE',
            location: 'ECE Department - Seminar Hall',
            displayType: 'department',
            ipAddress: '192.168.1.103',
            macAddress: '00:1B:44:11:3A:B9',
            status: 'active',
            orientation: 'landscape',
            resolution: '1920x1080',
            lastActive: new Date().toISOString(),
            config: {
                autoRefresh: 30,
                showNav: true,
                showRightSidebar: true,
                temperature: 22,
                humidity: 45,
                hodName: 'Dr. Rajesh Kumar'
            },
            createdAt: new Date().toISOString()
        },
        {
            displayId: 'ECE-LIB-001',
            displayName: 'ECE Library Display',
            displayCode: 'ece-library',
            department: 'Electronics and Communication',
            departmentCode: 'ECE',
            location: 'ECE Department - Library',
            displayType: 'department',
            ipAddress: '192.168.1.104',
            macAddress: '00:1B:44:11:3A:BA',
            status: 'active',
            orientation: 'landscape',
            resolution: '1920x1080',
            lastActive: new Date().toISOString(),
            config: {
                autoRefresh: 30,
                showNav: true,
                showRightSidebar: true,
                temperature: 22,
                humidity: 44,
                hodName: 'Dr. Rajesh Kumar'
            },
            createdAt: new Date().toISOString()
        }
    ];
    saveData(DISPLAYS_FILE, displayScreens, 'displays');
}

// Live classroom data - 8 Semesters
let classroomData = loadData(CLASSROOMS_FILE);
if (classroomData.length === 0) {
    classroomData = [
        {
            classroomId: 'ECE-101',
            semester: 1,
            section: 'A',
            subject: 'Engineering Mathematics-I',
            faculty: 'Dr. Anita Deshmukh',
            totalStudents: 60,
            presentStudents: 58,
            absentStudents: 2,
            attendancePercentage: 97,
            temperature: 22,
            humidity: 45,
            lastUpdated: new Date().toISOString()
        },
        {
            classroomId: 'ECE-201',
            semester: 2,
            section: 'A',
            subject: 'Circuit Theory',
            faculty: 'Prof. Rajesh Sharma',
            totalStudents: 60,
            presentStudents: 56,
            absentStudents: 4,
            attendancePercentage: 93,
            temperature: 23,
            humidity: 46,
            lastUpdated: new Date().toISOString()
        },
        {
            classroomId: 'ECE-301',
            semester: 3,
            section: 'A',
            subject: 'Digital Electronics',
            faculty: 'Dr. Priya Shah',
            totalStudents: 60,
            presentStudents: 57,
            absentStudents: 3,
            attendancePercentage: 95,
            temperature: 22,
            humidity: 45,
            lastUpdated: new Date().toISOString()
        },
        {
            classroomId: 'ECE-401',
            semester: 4,
            section: 'A',
            subject: 'Microprocessors & Controllers',
            faculty: 'Prof. Amit Patel',
            totalStudents: 60,
            presentStudents: 54,
            absentStudents: 6,
            attendancePercentage: 90,
            temperature: 23,
            humidity: 47,
            lastUpdated: new Date().toISOString()
        },
        {
            classroomId: 'ECE-501',
            semester: 5,
            section: 'A',
            subject: 'Communication Systems',
            faculty: 'Dr. Kavita Gupta',
            totalStudents: 60,
            presentStudents: 55,
            absentStudents: 5,
            attendancePercentage: 92,
            temperature: 22,
            humidity: 44,
            lastUpdated: new Date().toISOString()
        },
        {
            classroomId: 'ECE-601',
            semester: 6,
            section: 'A',
            subject: 'VLSI Design',
            faculty: 'Prof. Suresh Kumar',
            totalStudents: 60,
            presentStudents: 52,
            absentStudents: 8,
            attendancePercentage: 87,
            temperature: 24,
            humidity: 48,
            lastUpdated: new Date().toISOString()
        },
        {
            classroomId: 'ECE-701',
            semester: 7,
            section: 'A',
            subject: 'Embedded Systems',
            faculty: 'Dr. Meera Joshi',
            totalStudents: 60,
            presentStudents: 53,
            absentStudents: 7,
            attendancePercentage: 88,
            temperature: 23,
            humidity: 46,
            lastUpdated: new Date().toISOString()
        },
        {
            classroomId: 'ECE-801',
            semester: 8,
            section: 'A',
            subject: 'Optical Communication',
            faculty: 'Prof. Vikram Singh',
            totalStudents: 60,
            presentStudents: 51,
            absentStudents: 9,
            attendancePercentage: 85,
            temperature: 22,
            humidity: 45,
            lastUpdated: new Date().toISOString()
        }
    ];
    saveData(CLASSROOMS_FILE, classroomData, 'classrooms');
}

// ==============================================
// AUTHENTICATION MIDDLEWARE
// ==============================================

function simpleAuth(req, res, next) {
    if (!currentUser) {
        return res.status(401).json({
            success: false,
            message: 'Not logged in. Please login first.'
        });
    }
    req.user = currentUser;
    next();
}

// ==============================================
// ROUTES - HOME & INFO
// ==============================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Notice Board API - FIXED VERSION',
        timestamp: new Date().toISOString(),
        humanReadable: getHumanReadableTimestamp(),
        totalUsers: users.length,
        totalSubmissions: submissions.length,
        totalDisplays: displayScreens.length,
        totalClassrooms: classroomData.length,
        status: 'File upload with FIXED userId naming'
    });
});

// ==============================================
// AUTHENTICATION ROUTES
// ==============================================

app.post('/api/auth/login', (req, res) => {
    console.log('\n🔐 LOGIN REQUEST:');
    console.log('Body:', req.body);
    
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
    
    if (user.password !== password) {
        console.log('❌ Wrong password for:', email);
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
    
    currentUser = user;
    console.log('✅ User logged in:', user.name);
    
    res.json({
        success: true,
        message: 'Login successful',
        token: 'SIMPLE_TOKEN_NO_JWT',
        user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            departmentCode: user.departmentCode,
            postingScope: user.postingScope,
            canPostInstitute: user.canPostInstitute,
            requiresApproval: user.requiresApproval
        }
    });
});

app.get('/api/auth/me', simpleAuth, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
    const userName = currentUser ? currentUser.name : 'Unknown';
    currentUser = null;
    res.json({ success: true, message: 'Logout successful' });
    console.log(`👋 User logged out: ${userName}`);
});

// ==============================================
// SUBMISSION ROUTES WITH FILE UPLOAD (FIXED)
// ==============================================

app.post('/api/submissions', simpleAuth, upload.single('file'), (req, res) => {
    console.log('\n\n' + '='.repeat(80));
    console.log('📝 NEW SUBMISSION REQUEST - FIXED VERSION');
    console.log('='.repeat(80));
    
    try {
        console.log('\n📋 REQUEST BODY:');
        console.log(JSON.stringify(req.body, null, 2));
        
        console.log('\n📁 TEMPORARY FILE:');
        if (req.file) {
            console.log('✅ File received (temporary):');
            console.log('  - Original Name:', req.file.originalname);
            console.log('  - Temp Name:', req.file.filename);
            console.log('  - Temp Path:', req.file.path);
            console.log('  - Mimetype:', req.file.mimetype);
            console.log('  - Size:', req.file.size, 'bytes');
        } else {
            console.log('❌ No file in request!');
        }
        
        const {
            title, description, category, contentType,
            orientation, withSound, startDate, startTime,
            endDate, endTime, autoRemove, waitTime,
            repeatMode, priority, importantNote,
            displayScope, selectedDisplays
        } = req.body;
        
        // Validate required fields
        if (!title || !category || !startDate || !endDate || !req.file) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Deleted temporary file due to validation failure');
            }
            return res.status(400).json({
                success: false,
                message: 'Missing required fields or file'
            });
        }
        
        // NOW WE HAVE userId FROM req.body!
        const userId = req.user.userId;
        console.log('\n👤 USER ID FROM BODY:', userId);
        
        // Generate proper filename with human-readable timestamp
        const properFileName = generateFileName(userId, req.file.originalname);
        console.log('📝 NEW FILENAME:', properFileName);
        
        // Rename the file
        const oldPath = req.file.path;
        const newPath = path.join(path.dirname(oldPath), properFileName);
        
        console.log('\n🔄 RENAMING FILE:');
        console.log('  OLD:', oldPath);
        console.log('  NEW:', newPath);
        
        fs.renameSync(oldPath, newPath);
        console.log('✅ File renamed successfully!');
        
        // Update file info
        req.file.filename = properFileName;
        req.file.path = newPath;
        
        // Parse selected displays
        let displays = [];
        try {
            displays = JSON.parse(selectedDisplays || '[]');
        } catch (e) {
            displays = selectedDisplays ? selectedDisplays.split(',') : [];
        }
        
        if (displays.length === 0) {
            fs.unlinkSync(newPath);
            console.log('❌ No displays selected, deleted file');
            return res.status(400).json({
                success: false,
                message: 'At least one display must be selected'
            });
        }
        
        // Create submission object
        const submission = {
            submissionId: 'INF-' + getHumanReadableTimestamp(),
            userId: req.user.userId,
            userName: req.user.name,
            department: req.user.department,
            departmentCode: req.user.departmentCode,
            title,
            description: description || '',
            category,
            contentType: contentType || 'pdf',
            fileName: req.file.originalname,
            filePath: newPath.replace(/\\/g, '/'),
            fileUrl: `/uploads/${path.basename(path.dirname(newPath))}/${properFileName}`,
            fileSize: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
            orientation: orientation || 'landscape',
            withSound: withSound === 'true' || withSound === true,
            startDate,
            startTime: startTime || '09:00',
            endDate,
            endTime: endTime || '17:00',
            autoRemove: autoRemove === 'true' || autoRemove === true,
            waitTime: parseInt(waitTime) || 3,
            repeatMode: repeatMode || 'once',
            priority: priority || 'normal',
            importantNote: importantNote === 'true' || importantNote === true,
            displayScope: displayScope || 'department',
            selectedDisplays: displays,
            approvalStatus: req.user.requiresApproval ? 'pending' : 'approved',
            displayCount: 0,
            viewCount: 0,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        console.log('\n💾 FINAL SUBMISSION OBJECT:');
        console.log(JSON.stringify(submission, null, 2));
        
        // Add to submissions array
        submissions.push(submission);
        
        // Save to file
        const saved = saveData(SUBMISSIONS_FILE, submissions, 'submissions');
        
        console.log('\n✅ SUCCESS:');
        console.log('  - Submission ID:', submission.submissionId);
        console.log('  - Title:', submission.title);
        console.log('  - File Name:', properFileName);
        console.log('  - File Path:', submission.filePath);
        console.log('  - File URL:', submission.fileUrl);
        console.log('  - Saved to file:', saved ? '✅' : '❌');
        console.log('  - Total submissions:', submissions.length);
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ SUBMISSION COMPLETE');
        console.log('='.repeat(80) + '\n');
        
        res.status(201).json({
            success: true,
            message: 'Submission created successfully with file upload',
            data: submission
        });
        
    } catch (error) {
        console.log('\n' + '='.repeat(80));
        console.error('❌ SUBMISSION ERROR:', error);
        console.error('Stack:', error.stack);
        console.log('='.repeat(80) + '\n');
        
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Deleted uploaded file due to error');
            } catch (e) {
                console.error('Error deleting file:', e);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Error creating submission: ' + error.message
        });
    }
});

// Get all submissions for current user
app.get('/api/submissions', simpleAuth, (req, res) => {
    const userSubmissions = submissions.filter(s => s.userId === req.user.userId);
    console.log(`📥 Fetched ${userSubmissions.length} submissions for ${req.user.name}`);
    res.json({ success: true, count: userSubmissions.length, data: userSubmissions });
});

// Get single submission
app.get('/api/submissions/:id', simpleAuth, (req, res) => {
    const submission = submissions.find(s => 
        s.submissionId === req.params.id && s.userId === req.user.userId
    );
    
    if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    res.json({ success: true, data: submission });
});

// Delete submission and its file
app.delete('/api/submissions/:id', simpleAuth, (req, res) => {
    const index = submissions.findIndex(s => 
        s.submissionId === req.params.id && s.userId === req.user.userId
    );
    
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    const deleted = submissions[index];
    
    // Delete the file
    try {
        if (fs.existsSync(deleted.filePath)) {
            fs.unlinkSync(deleted.filePath);
            console.log(`🗑️ File deleted: ${deleted.filePath}`);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
    
    // Remove from array
    submissions.splice(index, 1);
    
    // Save updated submissions
    saveData(SUBMISSIONS_FILE, submissions, 'submissions');
    
    console.log(`🗑️ Submission deleted: ${deleted.title}`);
    
    res.json({ success: true, message: 'Submission and file deleted successfully' });
});

// ==============================================
// DISPLAY ROUTES
// ==============================================

app.get('/api/displays', (req, res) => {
    res.json({ success: true, count: displayScreens.length, data: displayScreens });
});

app.get('/api/displays/:displayCode', (req, res) => {
    const display = displayScreens.find(d => d.displayCode === req.params.displayCode);
    if (!display) {
        return res.status(404).json({ success: false, message: 'Display not found' });
    }
    res.json({ success: true, data: display });
});

app.get('/api/displays/:displayCode/content', (req, res) => {
    const display = displayScreens.find(d => d.displayCode === req.params.displayCode);
    if (!display) {
        return res.status(404).json({ success: false, message: 'Display not found' });
    }
    
    const now = new Date();
    let displayContent = submissions.filter(s => {
        if (s.approvalStatus !== 'approved') return false;
        const start = new Date(s.startDate + ' ' + s.startTime);
        const end = new Date(s.endDate + ' ' + s.endTime);
        if (now < start || now > end) return false;
        if (!s.selectedDisplays.includes(display.displayCode)) return false;
        if (display.displayType === 'department') {
            if (s.displayScope === 'department' && s.departmentCode !== display.departmentCode) {
                return false;
            }
        }
        return true;
    });
    
    displayContent = displayContent.sort((a, b) => {
        const priority = { emergency: 3, important: 2, normal: 1 };
        return priority[b.priority] - priority[a.priority];
    });
    
    res.json({
        success: true,
        display: { displayId: display.displayId, displayName: display.displayName },
        config: display.config,
        contentCount: displayContent.length,
        content: displayContent,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/displays/:displayCode/heartbeat', (req, res) => {
    const display = displayScreens.find(d => d.displayCode === req.params.displayCode);
    if (!display) {
        return res.status(404).json({ success: false, message: 'Display not found' });
    }
    display.lastActive = new Date().toISOString();
    display.status = 'active';
    
    // Save updated display status
    saveData(DISPLAYS_FILE, displayScreens, 'displays');
    
    res.json({ success: true, message: 'Heartbeat received' });
});

// ==============================================
// CLASSROOM ROUTES
// ==============================================

app.get('/api/classroom/live', (req, res) => {
    const department = req.query.department;
    let data = classroomData;
    if (department && department !== 'INST') {
        data = classroomData.filter(c => c.classroomId.startsWith(department));
    }
    res.json({ success: true, count: data.length, data: data, timestamp: new Date().toISOString() });
});

// ==============================================
// DASHBOARD ROUTES
// ==============================================

app.get('/api/dashboard/stats', simpleAuth, (req, res) => {
    const userSubmissions = submissions.filter(s => s.userId === req.user.userId);
    const userDrafts = drafts.filter(d => d.userId === req.user.userId);
    
    const stats = {
        totalSubmissions: userSubmissions.length,
        pendingApprovals: userSubmissions.filter(s => s.approvalStatus === 'pending').length,
        approved: userSubmissions.filter(s => s.approvalStatus === 'approved').length,
        rejected: userSubmissions.filter(s => s.approvalStatus === 'rejected').length,
        drafts: userDrafts.length,
        totalViews: userSubmissions.reduce((sum, s) => sum + (s.viewCount || 0), 0),
        totalDisplays: userSubmissions.reduce((sum, s) => sum + (s.displayCount || 0), 0),
        activeNotices: userSubmissions.filter(s => {
            const now = new Date();
            const start = new Date(s.startDate + ' ' + s.startTime);
            const end = new Date(s.endDate + ' ' + s.endTime);
            return s.approvalStatus === 'approved' && now >= start && now <= end;
        }).length
    };
    
    res.json({ success: true, data: stats });
});

app.get('/api/dashboard/recent', simpleAuth, (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const userSubmissions = submissions
        .filter(s => s.userId === req.user.userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    
    res.json({ success: true, count: userSubmissions.length, data: userSubmissions });
});

// ==============================================
// START SERVER
// ==============================================

const PORT = 5000;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 SMART NOTICE BOARD - FIXED VERSION');
    console.log('='.repeat(80));
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(80));
    console.log('\n📁 FILE STORAGE:');
    console.log('   ✅ PDF → uploads/pdf/');
    console.log('   ✅ Word → uploads/word/');
    console.log('   ✅ Images → uploads/images/');
    console.log('   ✅ Videos → uploads/videos/');
    console.log('\n💾 DATA PERSISTENCE:');
    console.log('   ✅ Submissions → data/submissions/submissions.json');
    console.log('   ✅ Users → data/users/users.json');
    console.log('   ✅ Departments → data/departments/departments.json');
    console.log('   ✅ Classrooms → data/classrooms/classrooms.json');
    console.log('   ✅ Displays → data/displays/displays.json');
    console.log('   ✅ Backups → data/backups/ (with timestamps)');
    console.log('\n🔧 FILENAME FORMAT:');
    console.log('   userId_YYYYMMDD_HHMMSS_filename.ext');
    console.log('   Example: FAC-1011_20260112_195057_exam.pdf');
    console.log('\n🔍 DEBUG MODE: Enabled');
    console.log('   All requests show detailed logs');
    console.log('\n📊 CURRENT DATA:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Submissions: ${submissions.length}`);
    console.log(`   Displays: ${displayScreens.length}`);
    console.log(`   Classrooms: ${classroomData.length}`);
    console.log(`   Departments: ${departments.length}`);
    console.log('='.repeat(80) + '\n');
});

module.exports = app;