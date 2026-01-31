
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const multer = require('multer');
// const fs = require('fs');

// // Initialize Express app
// const app = express();

// // ==============================================
// // MIDDLEWARE CONFIGURATION
// // ==============================================

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ==============================================
// // HELPER FUNCTIONS
// // ==============================================

// // Generate human-readable timestamp
// function getHumanReadableTimestamp() {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const day = String(now.getDate()).padStart(2, '0');
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
    
//     return `${year}${month}${day}_${hours}${minutes}${seconds}`;
// }

// // Generate filename with human-readable timestamp
// function generateFileName(userId, originalName) {
//     const timestamp = getHumanReadableTimestamp();
//     const ext = path.extname(originalName);
//     const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    
//     return `${userId}_${timestamp}_${nameWithoutExt}${ext}`;
// }

// // ==============================================
// // CREATE FOLDERS & DATA FILES
// // ==============================================

// const uploadsFolders = [
//     'uploads',
//     'uploads/pdf',
//     'uploads/word',
//     'uploads/images',
//     'uploads/videos'
// ];

// const dataFolders = [
//     'data',
//     'data/submissions',
//     'data/users',
//     'data/departments',
//     'data/classrooms',
//     'data/displays',
//     'data/backups'
// ];

// [...uploadsFolders, ...dataFolders].forEach(folder => {
//     if (!fs.existsSync(folder)) {
//         fs.mkdirSync(folder, { recursive: true });
//         console.log(`✅ Created folder: ${folder}`);
//     }
// });

// // Data file paths
// const SUBMISSIONS_FILE = './data/submissions/submissions.json';
// const USERS_FILE = './data/users/users.json';
// const DEPARTMENTS_FILE = './data/departments/departments.json';
// const CLASSROOMS_FILE = './data/classrooms/classrooms.json';
// const DISPLAYS_FILE = './data/displays/displays.json';

// // ==============================================
// // MULTER FILE UPLOAD CONFIGURATION (FIXED)
// // ==============================================

// // We'll use a two-step approach:
// // 1. Store file with temporary name
// // 2. Rename it after we have the userId from body

// const storage = multer.diskStorage({

//     destination: function (req, file, cb) {
//         console.log('\n🔍 MULTER DESTINATION FUNCTION:');
        
//         let uploadPath = './uploads';
        
//  // Try to get from body first
//         if (req.body && req.body.contentType) {
//             console.log('✅ ContentType from body:', req.body.contentType);
//             switch(req.body.contentType) {
//                 case 'pdf':
//                     uploadPath = './uploads/pdf';
//                     break;
//                 case 'word':
//                     uploadPath = './uploads/word';
//                     break;
//                 case 'image':
//                     uploadPath = './uploads/images';
//                     break;
//                 case 'video':
//                     uploadPath = './uploads/videos';
//                     break;
//                 default:
//                     uploadPath = './uploads';
//             }
//         } else {
//               // Detect from mimetype
//         console.log('📁 File mimetype:', file.mimetype);
//             // Fallback: detect from file mimetype
//             console.log('⚠️ ContentType not in body, detecting from mimetype:', file.mimetype);
//             if (file.mimetype === 'application/pdf') {
//                 uploadPath = './uploads/pdf';
//             } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
//                 uploadPath = './uploads/word';
//             } else if (file.mimetype.startsWith('image/')) {
//                 uploadPath = './uploads/images';
//             } else if (file.mimetype.startsWith('video/')) {
//                 uploadPath = './uploads/videos';
//             }
//         }
        
//         console.log('📂 Upload Path:', uploadPath);
//         cb(null, uploadPath);
//     },
   
//     filename: function (req, file, cb) {
//         console.log('\n🔍 MULTER FILENAME FUNCTION:');
//         const tempTimestamp = Date.now();
//         const ext = path.extname(file.originalname);
//         let uniqueName;

//         console.log('⚠️ Will rename after getting userId from body');
//         console.log('⏰ Timestamp:', tempTimestamp);
//         console.log('📄 Original Name:', file.originalname);
//         // Generate temporary filename with timestamp
//         if(req.body.userId){
//         const userId = req.body.userId || 'unknown';
//         const nameWithoutExt = path.basename(file.originalname, ext);
//         uniqueName = `${userId}-${tempTimestamp}-${nameWithoutExt}${ext}`;
//           console.log('👤 User ID:', userId);
//         }else{
//         uniqueName = `temp_${tempTimestamp}${ext}`;

//         }
       
//          console.log('📝 Generated Name:', uniqueName);
//         cb(null, tempName);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     console.log('\n🔍 MULTER FILE FILTER:');
//     console.log('📁 File:', file.originalname);
    
//     const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov'];
//     const ext = path.extname(file.originalname).toLowerCase();
    
//     console.log('📎 Extension:', ext);
//     console.log('✅ Allowed:', allowedExtensions.includes(ext));
    
//     if (allowedExtensions.includes(ext)) {
//         cb(null, true);
//     } else {
//         cb(new Error(`Invalid file type: ${ext}. Allowed: ${allowedExtensions.join(', ')}`), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 52428800 // 50MB
//     }
// });

// // ==============================================
// // DATA PERSISTENCE FUNCTIONS
// // ==============================================

// function loadData(filePath) {
//     try {
//         if (fs.existsSync(filePath)) {
//             const data = fs.readFileSync(filePath, 'utf8');
//             const parsed = JSON.parse(data);
//             const fileName = path.basename(filePath);
//             console.log(`📥 Loaded ${parsed.length || 0} items from ${fileName}`);
//             return parsed;
//         }
//     } catch (error) {
//         console.error(`❌ Error loading ${filePath}:`, error.message);
//     }
//     return [];
// }

// function saveData(filePath, data, dataType) {
//     try {
//         // Save main file
//         fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
//         const fileName = path.basename(filePath);
//         console.log(`💾 Saved ${data.length || 0} items to ${fileName}`);
        
//         // // Create human-readable backup
//         // const timestamp = getHumanReadableTimestamp();
//         // const backupFileName = fileName.replace('.json', `_backup_${timestamp}.json`);
//         // const backupPath = `./data/backups/${backupFileName}`;
//         // fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
//         // console.log(`📦 Backup saved: ${backupFileName}`);
        
//         return true;
//     } catch (error) {
//         console.error(`❌ Error saving ${filePath}:`, error.message);
//         return false;
//     }
// }

// // ==============================================
// // IN-MEMORY DATA STORAGE (WITH PERSISTENCE)
// // ==============================================

// let users = loadData(USERS_FILE);

// // If no users in file, create default users
// if (users.length === 0) {
//     users = [
//          {
//         userId: 'FAC-1011',
//         name: 'HEMANT HARLALKA',
//         email: 'hemantharlalka@university.edu',
//         password: 'hemant@123', // ⚠️ Plain text for testing only!
//         role: 'faculty',
//         department: 'Electronics and Communication',
//         departmentCode: 'ECE',
//         postingScope: 'department',
//         canPostInstitute: false,
//         requiresApproval: true
//     },
//      {
//         userId: 'FAC-1012',
//         name: 'KALPESH YADAV',
//         email: 'kalpeshyadav@university.edu',
//         password: 'kalpesh@123', // ⚠️ Plain text for testing only!
//         role: 'DEPARMENT_ADMIN',
//         department: 'Electronics and Communication',
//         departmentCode: 'ECE',
//         postingScope: 'INSTITUTE',
//         canPostInstitute: true,
//         requiresApproval: false
//     },
    
//     {
//             userId: 'FAC-1023',
//             name: 'Anjali Sharma',
//             email: 'anjali.sharma@university.edu',
//             password: 'faculty123',
//             role: 'faculty',
//             department: 'Electronics and Communication',
//             departmentCode: 'ECE',
//             postingScope: 'department',
//             canPostInstitute: false,
//             requiresApproval: true,
//             createdAt: new Date().toISOString()
//         },
//         {
//             userId: 'ADMIN-001',
//             name: 'System Administrator',
//             email: 'admin@university.edu',
//             password: 'admin123',
//             role: 'admin',
//             department: 'Administration',
//             departmentCode: 'ADMIN',
//             postingScope: 'institute',
//             canPostInstitute: true,
//             requiresApproval: false,
//             createdAt: new Date().toISOString()
//         },
//         {
//             userId: 'FAC-1011',
//             name: 'Hemant Harlalka',
//             email: 'hemantharlalka@university.edu',
//             password: 'hemant@123',
//             role: 'faculty',
//             department: 'Electronics and Communication',
//             departmentCode: 'ECE',
//             postingScope: 'department',
//             canPostInstitute: false,
//             requiresApproval: false,
//             createdAt: new Date().toISOString()
//         }
//     ];
//     saveData(USERS_FILE, users, 'users');
// }

// let submissions = loadData(SUBMISSIONS_FILE);
// let drafts = [];
// let currentUser = null;

// // Departments data
// let departments = loadData(DEPARTMENTS_FILE);
// if (departments.length === 0) {
//     departments = [
//         {
//             departmentId: 'DEPT-ECE',
//             departmentCode: 'ECE',
//             departmentName: 'Electronics and Communication',
//             hodName: 'Dr. KALPESH YADAV',
//             hodDesignation: 'Ph.D., M.Tech (VLSI)',
//             established: '1995',
//             totalStudents: 480,
//             totalFaculty: 24,
//             createdAt: new Date().toISOString()
//         }
//     ];
//     saveData(DEPARTMENTS_FILE, departments, 'departments');
// }

// // Display screens configuration
// let displayScreens = loadData(DISPLAYS_FILE);
// if (displayScreens.length === 0) {
//     displayScreens = [
//         {
//             displayId: 'ECE-MAIN-001',
//             displayName: 'ECE Main Display',
//             displayCode: 'ece-main',
//             department: 'Electronics and Communication',
//             departmentCode: 'ECE',
//             location: 'ECE Department - Main Entrance',
//             displayType: 'department',
//             ipAddress: '192.168.1.101',
//             macAddress: '00:1B:44:11:3A:B7',
//             status: 'active',
//             orientation: 'landscape',
//             resolution: '1920x1080',
//             lastActive: new Date().toISOString(),
//             config: {
//                 autoRefresh: 30,
//                 showNav: true,
//                 showRightSidebar: true,
//                 temperature: 22,
//                 humidity: 45,
//                 hodName: 'Dr. Rajesh Kumar'
//             },
//             createdAt: new Date().toISOString()
//         },
//         {
//             displayId: 'ECE-LAB-001',
//             displayName: 'ECE Lab Display',
//             displayCode: 'ece-lab',
//             department: 'Electronics and Communication',
//             departmentCode: 'ECE',
//             location: 'ECE Department - Lab Area',
//             displayType: 'department',
//             ipAddress: '192.168.1.102',
//             macAddress: '00:1B:44:11:3A:B8',
//             status: 'active',
//             orientation: 'landscape',
//             resolution: '1920x1080',
//             lastActive: new Date().toISOString(),
//             config: {
//                 autoRefresh: 30,
//                 showNav: true,
//                 showRightSidebar: true,
//                 temperature: 23,
//                 humidity: 46,
//                 hodName: 'Dr. Rajesh Kumar'
//             },
//             createdAt: new Date().toISOString()
//         },
//         {
//             displayId: 'ECE-SEM-001',
//             displayName: 'ECE Seminar Display',
//             displayCode: 'ece-seminar',
//             department: 'Electronics and Communication',
//             departmentCode: 'ECE',
//             location: 'ECE Department - Seminar Hall',
//             displayType: 'department',
//             ipAddress: '192.168.1.103',
//             macAddress: '00:1B:44:11:3A:B9',
//             status: 'active',
//             orientation: 'landscape',
//             resolution: '1920x1080',
//             lastActive: new Date().toISOString(),
//             config: {
//                 autoRefresh: 30,
//                 showNav: true,
//                 showRightSidebar: true,
//                 temperature: 22,
//                 humidity: 45,
//                 hodName: 'Dr. Rajesh Kumar'
//             },
//             createdAt: new Date().toISOString()
//         },
//         {
//             displayId: 'ECE-LIB-001',
//             displayName: 'ECE Library Display',
//             displayCode: 'ece-library',
//             department: 'Electronics and Communication',
//             departmentCode: 'ECE',
//             location: 'ECE Department - Library',
//             displayType: 'department',
//             ipAddress: '192.168.1.104',
//             macAddress: '00:1B:44:11:3A:BA',
//             status: 'active',
//             orientation: 'landscape',
//             resolution: '1920x1080',
//             lastActive: new Date().toISOString(),
//             config: {
//                 autoRefresh: 30,
//                 showNav: true,
//                 showRightSidebar: true,
//                 temperature: 22,
//                 humidity: 44,
//                 hodName: 'Dr. Rajesh Kumar'
//             },
//             createdAt: new Date().toISOString()
//         }
//     ];
//     saveData(DISPLAYS_FILE, displayScreens, 'displays');
// }




// // Live classroom data - 8 Semesters
// let classroomData = loadData(CLASSROOMS_FILE);
// if (classroomData.length === 0) {
//     classroomData = [
//         {
//             classroomId: 'ECE-101',
//             semester: 1,
//             section: 'A',
//             subject: 'Engineering Mathematics-I',
//             faculty: 'Dr. Anita Deshmukh',
//             totalStudents: 60,
//             presentStudents: 58,
//             absentStudents: 2,
//             attendancePercentage: 97,
//             temperature: 22,
//             humidity: 45,
//             lastUpdated: new Date().toISOString()
//         },
//         {
//             classroomId: 'ECE-201',
//             semester: 2,
//             section: 'A',
//             subject: 'Circuit Theory',
//             faculty: 'Prof. Rajesh Sharma',
//             totalStudents: 60,
//             presentStudents: 56,
//             absentStudents: 4,
//             attendancePercentage: 93,
//             temperature: 23,
//             humidity: 46,
//             lastUpdated: new Date().toISOString()
//         },
//         {
//             classroomId: 'ECE-301',
//             semester: 3,
//             section: 'A',
//             subject: 'Digital Electronics',
//             faculty: 'Dr. Priya Shah',
//             totalStudents: 60,
//             presentStudents: 57,
//             absentStudents: 3,
//             attendancePercentage: 95,
//             temperature: 22,
//             humidity: 45,
//             lastUpdated: new Date().toISOString()
//         },
//         {
//             classroomId: 'ECE-401',
//             semester: 4,
//             section: 'A',
//             subject: 'Microprocessors & Controllers',
//             faculty: 'Prof. Amit Patel',
//             totalStudents: 60,
//             presentStudents: 54,
//             absentStudents: 6,
//             attendancePercentage: 90,
//             temperature: 23,
//             humidity: 47,
//             lastUpdated: new Date().toISOString()
//         },
//         {
//             classroomId: 'ECE-501',
//             semester: 5,
//             section: 'A',
//             subject: 'Communication Systems',
//             faculty: 'Dr. Kavita Gupta',
//             totalStudents: 60,
//             presentStudents: 55,
//             absentStudents: 5,
//             attendancePercentage: 92,
//             temperature: 22,
//             humidity: 44,
//             lastUpdated: new Date().toISOString()
//         },
//         {
//             classroomId: 'ECE-601',
//             semester: 6,
//             section: 'A',
//             subject: 'VLSI Design',
//             faculty: 'Prof. Suresh Kumar',
//             totalStudents: 60,
//             presentStudents: 52,
//             absentStudents: 8,
//             attendancePercentage: 87,
//             temperature: 24,
//             humidity: 48,
//             lastUpdated: new Date().toISOString()
//         },
//         {
//             classroomId: 'ECE-701',
//             semester: 7,
//             section: 'A',
//             subject: 'Embedded Systems',
//             faculty: 'Dr. Meera Joshi',
//             totalStudents: 60,
//             presentStudents: 53,
//             absentStudents: 7,
//             attendancePercentage: 88,
//             temperature: 23,
//             humidity: 46,
//             lastUpdated: new Date().toISOString()
//         },
//         {
//             classroomId: 'ECE-801',
//             semester: 8,
//             section: 'A',
//             subject: 'Optical Communication',
//             faculty: 'Prof. Vikram Singh',
//             totalStudents: 60,
//             presentStudents: 51,
//             absentStudents: 9,
//             attendancePercentage: 85,
//             temperature: 22,
//             humidity: 45,
//             lastUpdated: new Date().toISOString()
//         }
//     ];
//     saveData(CLASSROOMS_FILE, classroomData, 'classrooms');
// }

// // ==============================================
// // AUTHENTICATION MIDDLEWARE
// // ==============================================

// function simpleAuth(req, res, next) {
    
//     if (!currentUser) {
//         return res.status(401).json({
//             success: false,
//             message: 'Not logged in. Please login first.'
//         });
//     }
//     req.user = currentUser;
//     next();
// }

// // ==============================================
// // ROUTES - HOME & INFO
// // ==============================================

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "login.html"));
// });

// app.get('/api/health', (req, res) => {
//     res.json({
//         success: true,
//         message: 'Smart Notice Board API - FIXED VERSION',
//         timestamp: new Date().toISOString(),
//         humanReadable: getHumanReadableTimestamp(),
//         totalUsers: users.length,
//         totalSubmissions: submissions.length,
//         totalDisplays: displayScreens.length,
//         totalClassrooms: classroomData.length,
//         status: 'File upload with FIXED userId naming'
//     });
// });

// // ==============================================
// // AUTHENTICATION ROUTES
// // ==============================================

// app.post('/api/auth/login', (req, res) => {
//     console.log('\n🔐 LOGIN REQUEST:');
//     console.log('Body:', req.body);
    
//     const { email, password } = req.body;
//     const user = users.find(u => u.email === email);
    
//     if (!user) {
//         console.log('❌ User not found:', email);
//         return res.status(401).json({
//             success: false,
//             message: 'Invalid email or password'
//         });
//     }
    
//     if (user.password !== password) {
//         console.log('❌ Wrong password for:', email);
//         return res.status(401).json({
//             success: false,
//             message: 'Invalid email or password'
//         });
//     }
    
//     currentUser = user;
//     console.log('✅ User logged in:', user.name);
    
//     res.json({
//         success: true,
//         message: 'Login successful',
//         token: 'SIMPLE_TOKEN_NO_JWT',
//         user: {
//             userId: user.userId,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             department: user.department,
//             departmentCode: user.departmentCode,
//             postingScope: user.postingScope,
//             canPostInstitute: user.canPostInstitute,
//             requiresApproval: user.requiresApproval
//         }
//     });
// });

// app.get('/api/auth/me', simpleAuth, (req, res) => {
//     res.json({ success: true, user: req.user });
// });

// app.post('/api/auth/logout', (req, res) => {
//     const userName = currentUser ? currentUser.name : 'Unknown';
//     currentUser = null;
//     res.json({ success: true, message: 'Logout successful' });
//     console.log(`👋 User logged out: ${userName}`);
// });

// // ==============================================
// // SUBMISSION ROUTES WITH FILE UPLOAD (FIXED)
// // ==============================================

// app.post('/api/submissions', simpleAuth, upload.single('file'), (req, res) => {
//     console.log('\n\n' + '='.repeat(80));
//     console.log('📝 NEW SUBMISSION REQUEST - FIXED VERSION');
//     console.log('='.repeat(80));
    
//     try {
//         console.log('\n📋 REQUEST BODY:');
//         console.log(JSON.stringify(req.body, null, 2));
        
//         console.log('\n📁 TEMPORARY FILE:');
//         if (req.file) {
//             console.log('✅ File received (temporary):');
//             console.log('  - Original Name:', req.file.originalname);
//             console.log('  - Temp Name:', req.file.filename);
//             console.log('  - Temp Path:', req.file.path);
//             console.log('  - Mimetype:', req.file.mimetype);
//             console.log('  - Size:', req.file.size, 'bytes');
//         } else {
//             console.log('❌ No file in request!');
//         }
        
//         const {
//             title, description, category, contentType,
//             orientation, withSound, startDate, startTime,
//             endDate, endTime, autoRemove, waitTime,
//             repeatMode, priority, importantNote,
//             displayScope, selectedDisplays
//         } = req.body;
        
//         // Validate required fields
//         if (!title || !category || !startDate || !endDate || !req.file) {
//             if (req.file) {
//                 fs.unlinkSync(req.file.path);
//                 console.log('🗑️ Deleted temporary file due to validation failure');
//             }
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing required fields or file'
//             });
//         }
        
//         // NOW WE HAVE userId FROM req.body!
//         const userId = req.user.userId;
//         console.log('\n👤 USER ID FROM BODY:', userId);
        
//         // Generate proper filename with human-readable timestamp
//         const properFileName = generateFileName(userId, req.file.originalname);
//         console.log('📝 NEW FILENAME:', properFileName);
        
//         // Rename the file
//         const oldPath = req.file.path;
//         const newPath = path.join(path.dirname(oldPath), properFileName);
        
//         console.log('\n🔄 RENAMING FILE:');
//         console.log('  OLD:', oldPath);
//         console.log('  NEW:', newPath);
        
//         fs.renameSync(oldPath, newPath);
//         console.log('✅ File renamed successfully!');
        
//         // Update file info
//         req.file.filename = properFileName;
//         req.file.path = newPath;
        
//         // Parse selected displays
//         let displays = [];
//         try {
//             displays = JSON.parse(selectedDisplays || '[]');
//         } catch (e) {
//             displays = selectedDisplays ? selectedDisplays.split(',') : [];
//         }
        
//         if (displays.length === 0) {
//             fs.unlinkSync(newPath);
//             console.log('❌ No displays selected, deleted file');
//             return res.status(400).json({
//                 success: false,
//                 message: 'At least one display must be selected'
//             });
//         }
        
//         // Create submission object
//         const submission = {
//             submissionId: 'INF-' + getHumanReadableTimestamp(),
//             userId: req.user.userId,
//             userName: req.user.name,
//             department: req.user.department,
//             departmentCode: req.user.departmentCode,
//             title,
//             description: description || '',
//             category,
//             contentType: contentType || 'pdf',
//             fileName: req.file.originalname,
//             filePath: newPath.replace(/\\/g, '/'),
//             fileUrl: `/uploads/${path.basename(path.dirname(newPath))}/${properFileName}`,
//             fileSize: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
//             orientation: orientation || 'landscape',
//             withSound: withSound === 'true' || withSound === true,
//             startDate,
//             startTime: startTime || '09:00',
//             endDate,
//             endTime: endTime || '17:00',
//             autoRemove: autoRemove === 'true' || autoRemove === true,
//             waitTime: parseInt(waitTime) || 3,
//             repeatMode: repeatMode || 'once',
//             priority: priority || 'normal',
//             importantNote: importantNote === 'true' || importantNote === true,
//             displayScope: displayScope || 'department',
//             selectedDisplays: displays,
//             approvalStatus: req.user.requiresApproval ? 'pending' : 'approved',
//             displayCount: 0,
//             viewCount: 0,
//             createdAt: new Date().toISOString(),
//             lastUpdated: new Date().toISOString()
//         };
        
//         console.log('\n💾 FINAL SUBMISSION OBJECT:');
//         console.log(JSON.stringify(submission, null, 2));
        
//         // Add to submissions array
//         submissions.push(submission);
        
//         // Save to file
//         const saved = saveData(SUBMISSIONS_FILE, submissions, 'submissions');
        
//         console.log('\n✅ SUCCESS:');
//         console.log('  - Submission ID:', submission.submissionId);
//         console.log('  - Title:', submission.title);
//         console.log('  - File Name:', properFileName);
//         console.log('  - File Path:', submission.filePath);
//         console.log('  - File URL:', submission.fileUrl);
//         console.log('  - Saved to file:', saved ? '✅' : '❌');
//         console.log('  - Total submissions:', submissions.length);
        
//         console.log('\n' + '='.repeat(80));
//         console.log('✅ SUBMISSION COMPLETE');
//         console.log('='.repeat(80) + '\n');
        
//         res.status(201).json({
//             success: true,
//             message: 'Submission created successfully with file upload',
//             data: submission
//         });
        
//     } catch (error) {
//         console.log('\n' + '='.repeat(80));
//         console.error('❌ SUBMISSION ERROR:', error);
//         console.error('Stack:', error.stack);
//         console.log('='.repeat(80) + '\n');
        
//         if (req.file) {
//             try {
//                 fs.unlinkSync(req.file.path);
//                 console.log('🗑️ Deleted uploaded file due to error');
//             } catch (e) {
//                 console.error('Error deleting file:', e);
//             }
//         }
//         res.status(500).json({
//             success: false,
//             message: 'Error creating submission: ' + error.message
//         });
//     }
// });

// // Get all submissions for current user
// app.get('/api/submissions', simpleAuth, (req, res) => {
//     const userSubmissions = submissions.filter(s => s.userId === req.user.userId);
//     console.log(`📥 Fetched ${userSubmissions.length} submissions for ${req.user.name}`);
//     res.json({ success: true, count: userSubmissions.length, data: userSubmissions });
// });

// // Get single submission
// app.get('/api/submissions/:id', simpleAuth, (req, res) => {
//     const submission = submissions.find(s => 
//         s.submissionId === req.params.id && s.userId === req.user.userId
//     );
    
//     if (!submission) {
//         return res.status(404).json({ success: false, message: 'Submission not found' });
//     }
    
//     res.json({ success: true, data: submission });
// });

// // Delete submission and its file
// app.delete('/api/submissions/:id', simpleAuth, (req, res) => {
//     const index = submissions.findIndex(s => 
//         s.submissionId === req.params.id && s.userId === req.user.userId
//     );
    
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Submission not found' });
//     }
    
//     const deleted = submissions[index];
    
//     // Delete the file
//     try {
//         if (fs.existsSync(deleted.filePath)) {
//             fs.unlinkSync(deleted.filePath);
//             console.log(`🗑️ File deleted: ${deleted.filePath}`);
//         }
//     } catch (error) {
//         console.error('Error deleting file:', error);
//     }
    
//     // Remove from array
//     submissions.splice(index, 1);
    
//     // Save updated submissions
//     saveData(SUBMISSIONS_FILE, submissions, 'submissions');
    
//     console.log(`🗑️ Submission deleted: ${deleted.title}`);
    
//     res.json({ success: true, message: 'Submission and file deleted successfully' });
// });

// // ==============================================
// // DISPLAY ROUTES
// // ==============================================

// app.get('/api/displays', (req, res) => {
//     res.json({ success: true, count: displayScreens.length, data: displayScreens });
// });

// app.get('/api/displays/:displayCode', (req, res) => {
//     const display = displayScreens.find(d => d.displayCode === req.params.displayCode);
//     if (!display) {
//         return res.status(404).json({ success: false, message: 'Display not found' });
//     }
//     res.json({ success: true, data: display });
// });

// app.get('/api/displays/:displayCode/content', (req, res) => {
//     const display = displayScreens.find(d => d.displayCode === req.params.displayCode);
//     if (!display) {
//         return res.status(404).json({ success: false, message: 'Display not found' });
//     }
    
//     const now = new Date();
//     let displayContent = submissions.filter(s => {
//         if (s.approvalStatus !== 'approved') return false;
//         const start = new Date(s.startDate + ' ' + s.startTime);
//         const end = new Date(s.endDate + ' ' + s.endTime);
//         if (now < start || now > end) return false;
//         if (!s.selectedDisplays.includes(display.displayCode)) return false;
//         if (display.displayType === 'department') {
//             if (s.displayScope === 'department' && s.departmentCode !== display.departmentCode) {
//                 return false;
//             }
//         }
//         return true;
//     });
    
//     displayContent = displayContent.sort((a, b) => {
//         const priority = { emergency: 3, important: 2, normal: 1 };
//         return priority[b.priority] - priority[a.priority];
//     });
    
//     res.json({
//         success: true,
//         display: { displayId: display.displayId, displayName: display.displayName },
//         config: display.config,
//         contentCount: displayContent.length,
//         content: displayContent,
//         timestamp: new Date().toISOString()
//     });
// });

// app.post('/api/displays/:displayCode/heartbeat', (req, res) => {
//     const display = displayScreens.find(d => d.displayCode === req.params.displayCode);
//     if (!display) {
//         return res.status(404).json({ success: false, message: 'Display not found' });
//     }
//     display.lastActive = new Date().toISOString();
//     display.status = 'active';
    
//     // Save updated display status
//     saveData(DISPLAYS_FILE, displayScreens, 'displays');
    
//     res.json({ success: true, message: 'Heartbeat received' });
// });

// // ==============================================
// // CLASSROOM ROUTES
// // ==============================================

// app.get('/api/classroom/live', (req, res) => {
//     const department = req.query.department;
//     let data = classroomData;
//     if (department && department !== 'INST') {
//         data = classroomData.filter(c => c.classroomId.startsWith(department));
//     }
//     res.json({ success: true, count: data.length, data: data, timestamp: new Date().toISOString() });
// });

// // ==============================================
// // DASHBOARD ROUTES
// // ==============================================

// app.get('/api/dashboard/stats', simpleAuth, (req, res) => {
//     const userSubmissions = submissions.filter(s => s.userId === req.user.userId);
//     const userDrafts = drafts.filter(d => d.userId === req.user.userId);
    
//     const stats = {
//         totalSubmissions: userSubmissions.length,
//         pendingApprovals: userSubmissions.filter(s => s.approvalStatus === 'pending').length,
//         approved: userSubmissions.filter(s => s.approvalStatus === 'approved').length,
//         rejected: userSubmissions.filter(s => s.approvalStatus === 'rejected').length,
//         drafts: userDrafts.length,
//         totalViews: userSubmissions.reduce((sum, s) => sum + (s.viewCount || 0), 0),
//         totalDisplays: userSubmissions.reduce((sum, s) => sum + (s.displayCount || 0), 0),
//         activeNotices: userSubmissions.filter(s => {
//             const now = new Date();
//             const start = new Date(s.startDate + ' ' + s.startTime);
//             const end = new Date(s.endDate + ' ' + s.endTime);
//             return s.approvalStatus === 'approved' && now >= start && now <= end;
//         }).length
//     };
    
//     res.json({ success: true, data: stats });
// });

// app.get('/api/dashboard/recent', simpleAuth, (req, res) => {
//     const limit = parseInt(req.query.limit) || 10;
//     const userSubmissions = submissions
//         .filter(s => s.userId === req.user.userId)
//         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//         .slice(0, limit);
    
//     res.json({ success: true, count: userSubmissions.length, data: userSubmissions });
// });

// // ==============================================
// // START SERVER
// // ==============================================
// // ==============================================
// // CREATE DATA STORAGE FOLDERS
// // ==============================================
// ///////////////////SETTINGS PAGE 

// const configFolders = [
//     './data/config',
//     //'./data/config/backups'
// ];

// configFolders.forEach(folder => {

//     if (!fs.existsSync(folder)) {
//         fs.mkdirSync(folder, { recursive: true });
//         console.log(`✅ Created NOT EXISTING FOLDER: ${folder}`);
//     }
// });

// // ==============================================
// // LOAD EXISTING CONFIGURATION DATA
// // ==============================================

// let configUniversities = loadData('./data/config/universities.json') || [];
// let configAdmins = loadData('./data/config/admins.json') || [];
// let configInstitutes = loadData('./data/config/institutes.json') || [];
// let configDepartments = loadData('./data/config/departments.json') || [];
// let configFaculty = loadData('./data/config/faculty.json') || [];
// let configClasses = loadData('./data/config/classes.json') || [];
// let configLabs = loadData('./data/config/labs.json') || [];
// let configRoutines = loadData('./data/config/routines.json') || [];

// // ==============================================
// // UNIVERSITY ROUTES (FULL CRUD)
// // ==============================================

// // CREATE
// app.post('/api/config/universities', simpleAuth, (req, res) => {
    
//     console.log('\n🏛️ CREATE UNIVERSITY REQUEST ');
    
//     const university = {
//         id: 'UNI-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configUniversities.push(university);
//     saveData('./data/config/universities.json', configUniversities, 'universities');
    
//     console.log('✅ University created:', university.name);
//     res.status(201).json({ success: true, data: university });
// });

// // READ ALL
// app.get('/api/config/universities', simpleAuth, (req, res) => {
//     console.log('📥 GET ALL UNIVERSITIES  UNIVERSITIES' ,configUniversities.length );
//     console.log('📥 GET ALL UNIVERSITIES  UNIVERSITIES' ,configUniversities);
//     res.json({ success: true, count: configUniversities.length, data: configUniversities });
// });

// // READ ONE
// app.get('/api/config/universities/:id', simpleAuth, (req, res) => {
//     const university = configUniversities.find(u => u.id === req.params.id);
//     if (!university) {
//         return res.status(404).json({ success: false, message: 'University not found' });
//     }
//     console.log(`📥 GET UNIVERSITIES  ID ${req.params.id} UNIVERSITIES  ${university}`);
//     res.json({ success: true, data: university });
// });

// // UPDATE
// app.put('/api/config/universities/:id', simpleAuth, (req, res) => {
//     console.log('\n✏️ UPDATE UNIVERSITY:', req.params.id);
    
//     const index = configUniversities.findIndex(u => u.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'University not found' });
//     }
    
//     configUniversities[index] = {
//         ...configUniversities[index],
//         ...req.body,
//         lastUpdated: new Date().toISOString(),
//         updatedBy: req.user.userId
//     };
    
//     saveData('./data/config/universities.json', configUniversities, 'universities');
//     console.log('✅ University updated');
//     res.json({ success: true, data: configUniversities[index] });
// });

// // DELETE
// app.delete('/api/config/universities/:id', simpleAuth, (req, res) => {
//     console.log('\n🗑️ DELETE UNIVERSITY:', req.params.id);
    
//     const index = configUniversities.findIndex(u => u.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'University not found' });
//     }
    
//     const deleted = configUniversities[index];
//     configUniversities.splice(index, 1);
//     saveData('./data/config/universities.json', configUniversities, 'universities');
    
//     console.log('✅ University deleted:', deleted.name);
//     res.json({ success: true, message: 'University deleted' });
// });

// // ==============================================
// // ADMIN ROUTES (FULL CRUD)
// // ==============================================

// app.post('/api/config/admins', simpleAuth, (req, res) => {
//     console.log('\n👑 CREATE ADMIN');
    
//     const admin = {
//         id: 'ADM-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configAdmins.push(admin);
//     saveData('./data/config/admins.json', configAdmins, 'admins');
    
//     // Also add to users for login
//     users.push({
//         userId: admin.adminId,
//         name: admin.name,
//         email: admin.email,
//         password: admin.password,
//         role: admin.role || 'admin',
//         department: 'Administration',
//         departmentCode: 'ADMIN',
//         postingScope: 'institute',
//         canPostInstitute: true,
//         requiresApproval: false,
//         createdAt: new Date().toISOString()
//     });
//     saveData(USERS_FILE, users, 'users');
    
//     console.log('✅ Admin created:', admin.name);
//     res.status(201).json({ success: true, data: admin });
// });

// app.get('/api/config/admins', simpleAuth, (req, res) => {
//     res.json({ success: true, count: configAdmins.length, data: configAdmins });
// });

// app.get('/api/config/admins/:id', simpleAuth, (req, res) => {
//     const admin = configAdmins.find(a => a.id === req.params.id);
//     if (!admin) {
//         return res.status(404).json({ success: false, message: 'Admin not found' });
//     }
//     res.json({ success: true, data: admin });
// });

// app.put('/api/config/admins/:id', simpleAuth, (req, res) => {
//     const index = configAdmins.findIndex(a => a.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Admin not found' });
//     }
    
//     configAdmins[index] = {
//         ...configAdmins[index],
//         ...req.body,
//         lastUpdated: new Date().toISOString()
//     };
    
//     saveData('./data/config/admins.json', configAdmins, 'admins');
    
//     // Update users array
//     const userIndex = users.findIndex(u => u.userId === configAdmins[index].adminId);
//     if (userIndex !== -1) {
//         users[userIndex].name = req.body.name || users[userIndex].name;
//         users[userIndex].email = req.body.email || users[userIndex].email;
//         saveData(USERS_FILE, users, 'users');
//     }
    
//     res.json({ success: true, data: configAdmins[index] });
// });

// app.delete('/api/config/admins/:id', simpleAuth, (req, res) => {
//     const index = configAdmins.findIndex(a => a.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Admin not found' });
//     }
    
//     const deleted = configAdmins[index];
//     configAdmins.splice(index, 1);
//     saveData('./data/config/admins.json', configAdmins, 'admins');
    
//     // Remove from users
//     const userIndex = users.findIndex(u => u.userId === deleted.adminId);
//     if (userIndex !== -1) {
//         users.splice(userIndex, 1);
//         saveData(USERS_FILE, users, 'users');
//     }
    
//     res.json({ success: true, message: 'Admin deleted' });
// });

// // ==============================================
// // INSTITUTE ROUTES (FULL CRUD)
// // ==============================================

// app.post('/api/config/institutes', simpleAuth, (req, res) => {
//     const institute = {
//         id: 'INST-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configInstitutes.push(institute);
//     saveData('./data/config/institutes.json', configInstitutes, 'institutes');
    
//     res.status(201).json({ success: true, data: institute });
// });

// app.get('/api/config/institutes', simpleAuth, (req, res) => {
//     res.json({ success: true, count: configInstitutes.length, data: configInstitutes });
// });

// app.get('/api/config/institutes/:id', simpleAuth, (req, res) => {
//     const institute = configInstitutes.find(i => i.id === req.params.id);
//     if (!institute) {
//         return res.status(404).json({ success: false, message: 'Institute not found' });
//     }
//     res.json({ success: true, data: institute });
// });

// app.put('/api/config/institutes/:id', simpleAuth, (req, res) => {
//     const index = configInstitutes.findIndex(i => i.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Institute not found' });
//     }
    
//     configInstitutes[index] = { ...configInstitutes[index], ...req.body, lastUpdated: new Date().toISOString() };
//     saveData('./data/config/institutes.json', configInstitutes, 'institutes');
    
//     res.json({ success: true, data: configInstitutes[index] });
// });

// app.delete('/api/config/institutes/:id', simpleAuth, (req, res) => {
//     const index = configInstitutes.findIndex(i => i.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Institute not found' });
//     }
    
//     configInstitutes.splice(index, 1);
//     saveData('./data/config/institutes.json', configInstitutes, 'institutes');
    
//     res.json({ success: true, message: 'Institute deleted' });
// });

// // ==============================================
// // DEPARTMENT ROUTES (FULL CRUD)
// // ==============================================

// app.post('/api/config/departments', simpleAuth, (req, res) => {
//     const department = {
//         id: 'DEPT-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configDepartments.push(department);
//     saveData('./data/config/departments.json', configDepartments, 'departments');
    
//     // Also add to main departments array
//     departments.push({
//         departmentId: department.id,
//         departmentCode: department.code,
//         departmentName: department.name,
//         hodName: department.hodName,
//         hodDesignation: department.hodDesignation,
//         established: department.established,
//         totalStudents: parseInt(department.totalStudents) || 0,
//         totalFaculty: parseInt(department.totalFaculty) || 0,
//         createdAt: new Date().toISOString()
//     });
//     saveData(DEPARTMENTS_FILE, departments, 'departments');
    
//     res.status(201).json({ success: true, data: department });
// });

// app.get('/api/config/departments', simpleAuth, (req, res) => {
//     res.json({ success: true, count: configDepartments.length, data: configDepartments });
// });

// app.get('/api/config/departments/:id', simpleAuth, (req, res) => {
//     const department = configDepartments.find(d => d.id === req.params.id);
//     if (!department) {
//         return res.status(404).json({ success: false, message: 'Department not found' });
//     }
//     res.json({ success: true, data: department });
// });

// app.put('/api/config/departments/:id', simpleAuth, (req, res) => {
//     const index = configDepartments.findIndex(d => d.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Department not found' });
//     }
    
//     configDepartments[index] = { ...configDepartments[index], ...req.body, lastUpdated: new Date().toISOString() };
//     saveData('./data/config/departments.json', configDepartments, 'departments');
    
//     // Update main departments
//     const mainIndex = departments.findIndex(d => d.departmentId === req.params.id);
//     if (mainIndex !== -1) {
//         departments[mainIndex].departmentName = req.body.name || departments[mainIndex].departmentName;
//         departments[mainIndex].hodName = req.body.hodName || departments[mainIndex].hodName;
//         saveData(DEPARTMENTS_FILE, departments, 'departments');
//     }
    
//     res.json({ success: true, data: configDepartments[index] });
// });

// app.delete('/api/config/departments/:id', simpleAuth, (req, res) => {
//     const index = configDepartments.findIndex(d => d.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Department not found' });
//     }
    
//     configDepartments.splice(index, 1);
//     saveData('./data/config/departments.json', configDepartments, 'departments');
    
//     // Remove from main departments
//     const mainIndex = departments.findIndex(d => d.departmentId === req.params.id);
//     if (mainIndex !== -1) {
//         departments.splice(mainIndex, 1);
//         saveData(DEPARTMENTS_FILE, departments, 'departments');
//     }
    
//     res.json({ success: true, message: 'Department deleted' });
// });

// // ==============================================
// // FACULTY ROUTES (FULL CRUD)
// // ==============================================

// app.post('/api/config/faculty', simpleAuth, (req, res) => {
//     const faculty = {
//         id: 'FAC-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configFaculty.push(faculty);
//     saveData('./data/config/faculty.json', configFaculty, 'faculty');
    
//     // Add to users for login
//     const dept = configDepartments.find(d => d.id === faculty.departmentId);
//     users.push({
//         userId: faculty.facultyId,
//         name: faculty.name,
//         email: faculty.email,
//         password: faculty.password,
//         role: 'faculty',
//         department: dept ? dept.name : 'Unknown',
//         departmentCode: dept ? dept.code : 'UNKNOWN',
//         postingScope: 'department',
//         canPostInstitute: false,
//         requiresApproval: faculty.requiresApproval === 'yes',
//         createdAt: new Date().toISOString()
//     });
//     saveData(USERS_FILE, users, 'users');
    
//     res.status(201).json({ success: true, data: faculty });
// });

// app.get('/api/config/faculty', simpleAuth, (req, res) => {
//     res.json({ success: true, count: configFaculty.length, data: configFaculty });
// });

// app.get('/api/config/faculty/:id', simpleAuth, (req, res) => {
//     const faculty = configFaculty.find(f => f.id === req.params.id);
//     if (!faculty) {
//         return res.status(404).json({ success: false, message: 'Faculty not found' });
//     }
//     res.json({ success: true, data: faculty });
// });

// app.put('/api/config/faculty/:id', simpleAuth, (req, res) => {
//     const index = configFaculty.findIndex(f => f.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Faculty not found' });
//     }
    
//     configFaculty[index] = { ...configFaculty[index], ...req.body, lastUpdated: new Date().toISOString() };
//     saveData('./data/config/faculty.json', configFaculty, 'faculty');
    
//     // Update users
//     const userIndex = users.findIndex(u => u.userId === configFaculty[index].facultyId);
//     if (userIndex !== -1) {
//         users[userIndex].name = req.body.name || users[userIndex].name;
//         users[userIndex].email = req.body.email || users[userIndex].email;
//         saveData(USERS_FILE, users, 'users');
//     }
    
//     res.json({ success: true, data: configFaculty[index] });
// });

// app.delete('/api/config/faculty/:id', simpleAuth, (req, res) => {
//     const index = configFaculty.findIndex(f => f.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Faculty not found' });
//     }
    
//     const deleted = configFaculty[index];
//     configFaculty.splice(index, 1);
//     saveData('./data/config/faculty.json', configFaculty, 'faculty');
    
//     // Remove from users
//     const userIndex = users.findIndex(u => u.userId === deleted.facultyId);
//     if (userIndex !== -1) {
//         users.splice(userIndex, 1);
//         saveData(USERS_FILE, users, 'users');
//     }
    
//     res.json({ success: true, message: 'Faculty deleted' });
// });

// // ==============================================
// // CLASS ROUTES (FULL CRUD + BATCH)
// // ==============================================

// app.post('/api/config/classes', simpleAuth, (req, res) => {
//     const classData = {
//         id: 'CLASS-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configClasses.push(classData);
//     saveData('./data/config/classes.json', configClasses, 'classes');
    
//     res.status(201).json({ success: true, data: classData });
// });

// // Batch create
// app.post('/api/config/classes/batch', simpleAuth, (req, res) => {
//     const { classes } = req.body;
//     const created = [];
    
//     classes.forEach(cls => {
//         const classData = {
//             id: 'CLASS-' + getHumanReadableTimestamp() + '-' + Math.random().toString(36).substr(2, 5),
//             ...cls,
//             createdAt: new Date().toISOString(),
//             createdBy: req.user.userId
//         };
//         configClasses.push(classData);
//         created.push(classData);
//     });
    
//     saveData('./data/config/classes.json', configClasses, 'classes');
//     res.status(201).json({ success: true, message: `Created ${created.length} classes`, data: created });
// });

// app.get('/api/config/classes', simpleAuth, (req, res) => {
//     res.json({ success: true, count: configClasses.length, data: configClasses });
// });

// app.get('/api/config/classes/:id', simpleAuth, (req, res) => {
//     const classData = configClasses.find(c => c.id === req.params.id);
//     if (!classData) {
//         return res.status(404).json({ success: false, message: 'Class not found' });
//     }
//     res.json({ success: true, data: classData });
// });

// app.put('/api/config/classes/:id', simpleAuth, (req, res) => {
//     const index = configClasses.findIndex(c => c.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Class not found' });
//     }
    
//     configClasses[index] = { ...configClasses[index], ...req.body, lastUpdated: new Date().toISOString() };
//     saveData('./data/config/classes.json', configClasses, 'classes');
    
//     res.json({ success: true, data: configClasses[index] });
// });

// app.delete('/api/config/classes/:id', simpleAuth, (req, res) => {
//     const index = configClasses.findIndex(c => c.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Class not found' });
//     }
    
//     configClasses.splice(index, 1);
//     saveData('./data/config/classes.json', configClasses, 'classes');
    
//     res.json({ success: true, message: 'Class deleted' });
// });

// // ==============================================
// // LAB ROUTES (FULL CRUD)
// // ==============================================

// app.post('/api/config/labs', simpleAuth, (req, res) => {
//     const lab = {
//         id: 'LAB-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configLabs.push(lab);
//     saveData('./data/config/labs.json', configLabs, 'labs');
    
//     res.status(201).json({ success: true, data: lab });
// });

// app.get('/api/config/labs', simpleAuth, (req, res) => {
//     res.json({ success: true, count: configLabs.length, data: configLabs });
// });

// app.get('/api/config/labs/:id', simpleAuth, (req, res) => {
//     const lab = configLabs.find(l => l.id === req.params.id);
//     if (!lab) {
//         return res.status(404).json({ success: false, message: 'Lab not found' });
//     }
//     res.json({ success: true, data: lab });
// });

// app.put('/api/config/labs/:id', simpleAuth, (req, res) => {
//     const index = configLabs.findIndex(l => l.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Lab not found' });
//     }
    
//     configLabs[index] = { ...configLabs[index], ...req.body, lastUpdated: new Date().toISOString() };
//     saveData('./data/config/labs.json', configLabs, 'labs');
    
//     res.json({ success: true, data: configLabs[index] });
// });

// app.delete('/api/config/labs/:id', simpleAuth, (req, res) => {
//     const index = configLabs.findIndex(l => l.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Lab not found' });
//     }
    
//     configLabs.splice(index, 1);
//     saveData('./data/config/labs.json', configLabs, 'labs');
    
//     res.json({ success: true, message: 'Lab deleted' });
// });

// // ==============================================
// // ROUTINE ROUTES (FULL CRUD + BATCH)
// // ==============================================

// app.post('/api/config/routines', simpleAuth, (req, res) => {
//     const routine = {
//         id: 'ROUTINE-' + getHumanReadableTimestamp(),
//         ...req.body,
//         createdAt: new Date().toISOString(),
//         createdBy: req.user.userId
//     };
    
//     configRoutines.push(routine);
//     saveData('./data/config/routines.json', configRoutines, 'routines');
    
//     res.status(201).json({ success: true, data: routine });
// });

// // Batch create
// app.post('/api/config/routines/batch', simpleAuth, (req, res) => {
//     const { routines } = req.body;
//     const created = [];
    
//     routines.forEach(r => {
//         const routine = {
//             id: 'ROUTINE-' + getHumanReadableTimestamp() + '-' + Math.random().toString(36).substr(2, 5),
//             ...r,
//             createdAt: new Date().toISOString(),
//             createdBy: req.user.userId
//         };
//         configRoutines.push(routine);
//         created.push(routine);
//     });
    
//     saveData('./data/config/routines.json', configRoutines, 'routines');
//     res.status(201).json({ success: true, message: `Created ${created.length} routines`, data: created });
// });

// app.get('/api/config/routines', simpleAuth, (req, res) => {
//     res.json({ success: true, count: configRoutines.length, data: configRoutines });
// });

// app.get('/api/config/routines/:id', simpleAuth, (req, res) => {
//     const routine = configRoutines.find(r => r.id === req.params.id);
//     if (!routine) {
//         return res.status(404).json({ success: false, message: 'Routine not found' });
//     }
//     res.json({ success: true, data: routine });
// });

// app.put('/api/config/routines/:id', simpleAuth, (req, res) => {
//     const index = configRoutines.findIndex(r => r.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Routine not found' });
//     }
    
//     configRoutines[index] = { ...configRoutines[index], ...req.body, lastUpdated: new Date().toISOString() };
//     saveData('./data/config/routines.json', configRoutines, 'routines');
    
//     res.json({ success: true, data: configRoutines[index] });
// });

// app.delete('/api/config/routines/:id', simpleAuth, (req, res) => {
//     const index = configRoutines.findIndex(r => r.id === req.params.id);
//     if (index === -1) {
//         return res.status(404).json({ success: false, message: 'Routine not found' });
//     }
    
//     configRoutines.splice(index, 1);
//     saveData('./data/config/routines.json', configRoutines, 'routines');
    
//     res.json({ success: true, message: 'Routine deleted' });
// });

// // ==============================================
// // STATISTICS
// // ==============================================

// app.get('/api/config/stats', simpleAuth, (req, res) => {
//     res.json({
//         success: true,
//         data: {
//             universities: configUniversities.length,
//             admins: configAdmins.length,
//             institutes: configInstitutes.length,
//             departments: configDepartments.length,
//             faculty: configFaculty.length,
//             classes: configClasses.length,
//             labs: configLabs.length,
//             routines: configRoutines.length,
//             totalUsers: users.length
//         }
//     });
// });

// console.log('\n' + '='.repeat(80));
// console.log('✅ COMPLETE CONFIGURATION ROUTES LOADED');
// console.log('='.repeat(80));
// console.log('📊 Available modules with FULL CRUD:');
// console.log('   🏛️  Universities');
// console.log('   👑  Admin Users');
// console.log('   🏢  Institutes');
// console.log('   📚  Departments');
// console.log('   👨‍🏫  Faculty');
// console.log('   🎓  Classes (+ Batch Creation)');
// console.log('   🔬  Labs');
// console.log('   📅  Routines (+ Batch Creation)');
// console.log('='.repeat(80) + '\n');



// const PORT = 5000;

// app.listen(PORT, () => {
//     console.log('\n' + '='.repeat(80));
//     console.log('🚀 SMART NOTICE BOARD - FIXED VERSION');
//     console.log('='.repeat(80));
//     console.log(`📡 Server: http://localhost:${PORT}`);
//     console.log(`💚 Health: http://localhost:${PORT}/api/health`);
//     console.log('='.repeat(80));
//     console.log('\n📁 FILE STORAGE:');
//     console.log('   ✅ PDF → uploads/pdf/');
//     console.log('   ✅ Word → uploads/word/');
//     console.log('   ✅ Images → uploads/images/');
//     console.log('   ✅ Videos → uploads/videos/');
//     console.log('\n💾 DATA PERSISTENCE:');
//     console.log('   ✅ Submissions → data/submissions/submissions.json');
//     console.log('   ✅ Users → data/users/users.json');
//     console.log('   ✅ Departments → data/departments/departments.json');
//     console.log('   ✅ Classrooms → data/classrooms/classrooms.json');
//     console.log('   ✅ Displays → data/displays/displays.json');
//     console.log('   ✅ Backups → data/backups/ (with timestamps)');
//     console.log('\n🔧 FILENAME FORMAT:');
//     console.log('   userId_YYYYMMDD_HHMMSS_filename.ext');
//     console.log('   Example: FAC-1011_20260112_195057_exam.pdf');
//     console.log('\n🔍 DEBUG MODE: Enabled');
//     console.log('   All requests show detailed logs');
//     console.log('\n📊 CURRENT DATA:');
//     console.log(`   Users: ${users.length}`);
//     console.log(`   Submissions: ${submissions.length}`);
//     console.log(`   Displays: ${displayScreens.length}`);
//     console.log(`   Classrooms: ${classroomData.length}`);
//     console.log(`   Departments: ${departments.length}`);
//     console.log('='.repeat(80) + '\n');
// });

// module.exports = app;

// UNI     → Universities
// INST    → Institutes  
// DEPT    → Departments
// FAC     → Faculty
// CLASS   → Classes
// LAB     → Labs
// ROUTINE → Routines
// SUB     → Submissions
// DISP    → Displays
// ADM     → Admins

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');




const app = express();

console.log('\n' + '='.repeat(100));
console.log('🚀 SMART NOTICE BOARD - SINGLE SOURCE OF TRUTH VERSION');
console.log('='.repeat(100));

// ==============================================
// MIDDLEWARE
// ==============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// const SERVER_OS = 'WINDOW';
// const os = require('os');
// //const mdns = require('mdns');
// const { Bonjour } = require('bonjour-service');
// const mdns = new Bonjour();

// // ---- CONFIG ----
// const SERVICE_NAME = 'SMART_DASHBOARD_SERVER';
// const HOSTNAME = 'smart-dashboard'; // resolves to smart-dashboard.local
// const SERVICE_TYPE = 'http';
// const SERVICE_PORT = 3000;

// // ---- GET LOCAL IP ----
// function getLocalIPv4() {
//   const nets = os.networkInterfaces();
//   for (const name of Object.keys(nets)) {
//     for (const net of nets[name]) {
//       if (net.family === 'IPv4' && !net.internal) {
//         return net.address;
//       }
//     }
//   }
//   return '127.0.0.1';
// }

// const LOCAL_IP = getLocalIPv4();

// let mdnsAd = null;

// function startMdnsAdvertisement(port) {

// if(SERVER_OS === "WINDOW"){
// // ---- ADVERTISE SERVICE ----
// mdns.publish({

//   name: SERVICE_NAME,
//   type: SERVICE_TYPE,
//   port: port,//SERVICE_PORT,
//   host: `${HOSTNAME}.local`,
//   txt: {
//     ip: LOCAL_IP,
//     device: 'windows-server',
//     app: 'smart-dashboard',
//     version: '2.0', 
//     type: 'noticeboard-server'
//   }
// });

// console.log(`📡 mDNS started: ${SERVICE_NAME}`);
// console.log(`🌐 Hostname: ${HOSTNAME}.local`);
// console.log(`🔌 IP: ${LOCAL_IP}:${SERVICE_PORT}`);
// }else if(SERVER_OS === "LINUX"){

//     try {
//         mdnsAd = mdns.createAdvertisement(mdns.tcp('smartnoticeboard'), port, {
//             name: 'Smart Notice Board Server',
//             txt: {ip: LOCAL_IP,  version: '2.0', type: 'noticeboard-server' }
//         });
//         mdnsAd.start();
//         console.log('\n✅ mDNS service advertised on port', port);
//     } catch (error) {
//         console.log('⚠️  mDNS not available:', error.message);
//     }

//    }else{}
// }



const os = require('os');
const { Bonjour } = require('bonjour-service');

const bonjour = new Bonjour();

// ---- CONFIG ----
const SERVICE_NAME = 'SMART_DASHBOARD_SERVER';
const SERVICE_TYPE = 'http';
const HOSTNAME = 'smart-dashboard';
const VERSION = '2.0';

// ---- GET LOCAL IP ----
function getLocalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIPv4();

let mdnsService = null;

function startMdnsAdvertisement(port) {
  try {
    mdnsService = bonjour.publish({
      name: SERVICE_NAME,
      type: SERVICE_TYPE,
      port: port,
      host: `${HOSTNAME}.local`,
      txt: {
        ip: LOCAL_IP,
        os: process.platform,
        app: 'smart-dashboard',
        version: VERSION,
        role: 'noticeboard-server'
      }
    });

    console.log('📡 mDNS service advertised');
    console.log(`🧭 Name     : ${SERVICE_NAME}`);
    console.log(`🌐 Host     : ${HOSTNAME}.local:${port}`);
    console.log(`🔌 Endpoint : ${LOCAL_IP}:${port}`);
  } catch (err) {
    console.error('❌ mDNS advertisement failed:', err.message);
  }
}

// ---- CLEAN SHUTDOWN ----
process.on('SIGINT', () => {
  if (mdnsService) {
    mdnsService.stop();
    bonjour.destroy();
  }
  process.exit(0);
});

//module.exports = { startMdnsAdvertisement };







// Request logger
app.use((req, res, next) => {

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log(`📦 Body:`, req.body);
    }
    console.log(`${'='.repeat(80)}`);
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});
// ==============================================
// HELPER FUNCTIONS
// ==============================================

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

function generateUniqueCode(prefix, existingCodes = []) {
    let code;
    let attempts = 0;
    
    do {
        const timestamp = getHumanReadableTimestamp();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        code = `${prefix}-${timestamp}-${random}`;
        attempts++;
    } while (existingCodes.includes(code) && attempts < 10);
    return code;
}

function generateFileName(userId, originalName) {
    const timestamp = getHumanReadableTimestamp();
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${userId}_${timestamp}_${nameWithoutExt}${ext}`;
}

// ==============================================
// CREATE FOLDERS
// ==============================================

const folders = [
    'uploads', 'uploads/pdf', 'uploads/word', 'uploads/images', 'uploads/videos',
    'data', 'data/config', 'data/submissions', 'data/logs'
];

folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        console.log(`✅ Created: ${folder}`);
    }
});

// ==============================================
// DATA PERSISTENCE
// ==============================================

function loadData(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`📥 Loaded ${data.length || 0} items from ${path.basename(filePath)}`);
            return data;
        }
    } catch (error) {
        console.error(`❌ Error loading ${filePath}:`, error.message);
    }
    return [];
}

function saveData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`💾 Saved ${data.length || 0} items to ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${filePath}:`, error.message);
        return false;
    }
}

function logAction(action, details) {
    const timestamp = getHumanReadableTimestamp();
    const logFile = `./data/logs/actions_${timestamp.substr(0, 8)}.json`;
    let logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
    logs.push({ timestamp: new Date().toISOString(), action, details });
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// ==============================================
// SINGLE SOURCE OF TRUTH - CONFIG FILES ONLY
// ==============================================
// // Data file paths
const SUBMISSIONS_FILE = './data/submissions/submissions.json';
const USERS_FILE =        './data/config/users.json';
const DEPARTMENTS_FILE =  './data/config/departments.json';
const CLASSROOMS_FILE =   './data/config/classrooms.json';
const DISPLAYS_FILE =     './data/config/displays.json';
const UNIVERSITYS_FILE =     './data/config/universities.json';
const INSTITUTE_FILE =   './data/config/institutes.json';

let universities = loadData(UNIVERSITYS_FILE) || [];
let institutes = loadData(INSTITUTE_FILE) || [];
let departments = loadData(DEPARTMENTS_FILE) || [];
let users = loadData(USERS_FILE) || [];  // ← SINGLE USERS FILE (admins + faculty)
let classes = loadData('./data/config/classes.json') || [];
let labs = loadData('./data/config/labs.json') || [];
let displays = loadData(DISPLAYS_FILE) || [];
let routines = loadData('./data/config/routines.json') || [];
let submissions = loadData(SUBMISSIONS_FILE) || [];
let classrooms = loadData(CLASSROOMS_FILE) || [];

let currentUser = null;

// ==============================================
// CREATE DEFAULT DATA IF EMPTY
// ==============================================

function createDefaultData() {
    console.log('\n🔧 Checking for default data...');
    
    // 1. Create Default University
    if (universities.length === 0) {
        console.log('📝 Creating default university...');
        const uni = {
            id: generateUniqueCode('UNI', universities.map(u => u.id)),
            code: 'PU',
            name: 'Parul University',
            established: '1990',
            type: 'Private',
            chancellorName: 'Dr. Devanshu Patel',
            viceChancellorName: 'Dr. M.N. Patel',
            address: 'Vadodara, Gujarat, India',
            website: 'https://paruluniversity.ac.in',
            email: 'info@paruluniversity.ac.in',
            phone: '+91-2668-260300',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        universities.push(uni);
        saveData(UNIVERSITYS_FILE, universities);
        console.log(`✅ Created university: ${uni.name}`);
    }
    
    // 2. Create Default Institute
    if (institutes.length === 0) {
        console.log('📝 Creating default institute...');
        const inst = {
            id: generateUniqueCode('INST', institutes.map(i => i.id)),
            universityId: universities[0].id,
            code: 'IOE',
            name: 'Institute of Engineering',
            established: '1995',
            type: 'Technical',
            deanName: 'Dr. Rajesh Kumar',
            principalName: 'Dr. Priya Shah',
            email: 'ioe@paruluniversity.ac.in',
            phone: '+91-2668-260350',
            createdAt: new Date().toISOString()
        };
        institutes.push(inst);
        saveData(INSTITUTE_FILE, institutes);
        console.log(`✅ Created institute: ${inst.name}`);
    }
    
    // 3. Create Default Department
    if (departments.length === 0) {
        console.log('📝 Creating default department...');
        const dept = {
            id: generateUniqueCode('DEPT', departments.map(d => d.id)),
            instituteId: institutes[0].id,
            code: 'ECE',
            name: 'Electronics and Communication Engineering',
            established: '2000',
            hodName: 'Dr. Kalpesh Yadav',
            hodDesignation: 'Ph.D., M.Tech (VLSI)',
            totalStudents: 480,
            totalFaculty: 24,
            // NEW: Department Performance Fields
            rating: 4.5,
            performance: {
                attendance: 92,
                passPercentage: 88,
                placementRate: 85,
                researchPapers: 42
            },
            certificates: [
                { name: 'NBA Accredited', year: 2020 },
                { name: 'ISO 9001:2015', year: 2019 }
            ],
            createdAt: new Date().toISOString()
        };
        departments.push(dept);
        saveData('./data/config/departments.json', departments);
        console.log(`✅ Created department: ${dept.name}`);
    }
    
    // 4. Create Default Users (Admin + Faculty)
    if (users.length === 0) {
        console.log('📝 Creating default users...');
        
        // System Admin
        users.push({
            id: generateUniqueCode('USER', users.map(u => u.id)),
            userId:  "ADMIN-20260119_011459-TV5C" ,
            name: 'System Administrator',
            email: 'admin@university.edu',
            password: 'admin123',
            role: 'admin',
            department: 'Administration',
            departmentCode: 'ADMIN',
            departmentId: null,
            postingScope: 'university',  // ← admin can post to entire university
            canPostInstitute: true,
            requiresApproval: false,
            createdAt: new Date().toISOString(),
            adminId: "ADMIN-001",
            createdBy: "ADMIN-001",
            phone: "9101266959"
        });
        
        // HOD (Department Admin)
        users.push({
            id: generateUniqueCode('USER', users.map(u => u.id)),
            userId: 'FAC-1012',
            facultyId: 'FAC-201',
            name: 'KALPESH YADAV',
            email: 'kalpeshyadav@university.edu',
            password: 'kalpesh@123',
            role: 'faculty',
            departmentId: 'DEPT-20260119_013352-EUSW',
            department: departments[0].name,
            departmentCode: departments[0].code,
           // departmentId: departments[0].id,
            postingScope: 'institute',  // ← HOD can post to institute
            canPostInstitute: true,
            requiresApproval: false,
            designation: 'Professor & HOD',
            qualification: 'Ph.D., M.Tech',
            specialization: 'VLSI Design',
            phone: '+91-9876543210',
            createdAt: new Date().toISOString(),
            createdBy: 'ADMIN-20260119_011459-TV5C'
        });
        
        // Regular Faculty
        users.push({
            id: generateUniqueCode('USER', users.map(u => u.id)),
            userId: 'FAC-1011',
             facultyId: 'FAC-202',
            name: 'HEMANT HARLALKA',
            email: 'hemantharlalka@university.edu',
            password: 'hemant@123',
            role: 'faculty',
            department: departments[0].name,
            departmentCode: departments[0].code,
           // departmentId: departments[0].id,
            departmentId: 'DEPT-20260119_013352-EUSW',
            postingScope: 'department',  // ← regular faculty limited to department
            canPostInstitute: false,
            requiresApproval: false,  // ← needs approval
            designation: 'Assistant Professor',
            qualification: 'M.Tech',
            specialization: 'Embedded Systems',
            phone: '+91-9876543211',
            createdAt: new Date().toISOString(),
            createdBy: 'ADMIN-20260119_011459-TV5C'
        });
        
        saveData(USERS_FILE, users);
        console.log(`✅ Created ${users.length} default users`);
    }
    
    // 5. Create Default Classes
    if (classes.length === 0) {
        console.log('📝 Creating default classes...');
        const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
        const sections = ['A'];
        
        semesters.forEach(sem => {
            sections.forEach(sec => {
                const cls = {
                    id: generateUniqueCode('CLASS', classes.map(c => c.id)),
                   // departmentId: departments[0].id,
                     departmentId: "DEPT-20260119_013352-EUSW",
                    classId: `${departments[0].code}-${sem}0${semesters.indexOf(sem) + 1}-${sec}`,
                    semester: sem,
                    section: sec,
                    totalStudents: 60,
                    coordinator: users[1].userId,  // HOD
                    room: `${sem}0${semesters.indexOf(sem) + 1}-${sec}`,
                    type: 'regular',
                    // NEW: Class Rating
                    rating: 4.2,
                    performance: {
                        attendance: 90 + Math.floor(Math.random() * 8),
                        avgMarks: 75 + Math.floor(Math.random() * 15)
                    },
                    createdAt: new Date().toISOString()
                };
                classes.push(cls);
            });
        });
        
        saveData('./data/config/classes.json', classes);
        console.log(`✅ Created ${classes.length} default classes`);
    }
    
    // 6. Create Default Labs
    if (labs.length === 0) {
        console.log('📝 Creating default labs...');
        const labNames = [
            'Digital Electronics Lab',
            'Microprocessor Lab',
            'Communication Lab',
            'VLSI Lab'
        ];
        
        labNames.forEach((name, idx) => {
            const lab = {
                id: generateUniqueCode('LAB', labs.map(l => l.id)),
               // departmentId: departments[0].id,
                 departmentId: "DEPT-20260119_013352-EUSW",
                name: name,
                code: `LAB-${departments[0].code}-0${idx + 1}`,
                room: `LAB-30${idx + 1}`,
                capacity: 30,
                type: 'practical',
                equipment: 'Standard lab equipment',
                safety: 'Safety protocols enabled',
                incharge: users[1].userId,
                status: 'operational',
                createdAt: new Date().toISOString()
            };
            labs.push(lab);
        });
        
        saveData('./data/config/labs.json', labs);
        console.log(`✅ Created ${labs.length} default labs`);
    }
    
    // 7. Create Default Displays
    if (displays.length === 0) {
        console.log('📝 Creating default displays...');
        const locations = ['Main', 'Lab', 'Seminar', 'Library'];
        
        locations.forEach((loc, idx) => {
            const display = {
                id: generateUniqueCode('DISP', displays.map(d => d.id)),
                displayCode: `${departments[0].code.toLowerCase()}-${loc.toLowerCase().replace(/\s+/g, '-')}`,
                displayName: `${departments[0].code} ${loc} Display`,
                department: departments[0].name,
                departmentCode: departments[0].code,
                departmentId: departments[0].id,
                instituteId: departments[0].instituteId,
                location: `${departments[0].name} - ${loc}`,
                displayType: 'department',
                ipAddress: `192.168.1.${101 + idx}`,
                macAddress: `00:1B:44:11:3A:${(180 + idx).toString(16).toUpperCase()}`,
                status: 'active',
                orientation: 'landscape',
                resolution: '1920x1080',
                lastActive: new Date().toISOString(),
                config: {
                    autoRefresh: 30,
                    showNav: true,
                    showRightSidebar: true,
                    temperature: 22,
                    humidity: 45
                },
                createdAt: new Date().toISOString()
            };
            displays.push(display);
        });
        
        saveData(DISPLAYS_FILE, displays);
        console.log(`✅ Created ${displays.length} default displays`);
    }
    
    // 8. Create Default Classrooms (Live Data)
    if (classrooms.length === 0) {
        console.log('📝 Creating default classroom data...');
        const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
        
        semesters.forEach(sem => {
            const classroom = {
                id: generateUniqueCode('ROOM', classrooms.map(c => c.id)),
                classroomId: `${departments[0].code}-${sem}01`,
                 departmentId: "DEPT-20260119_013352-EUSW",
                semester: sem,
                section: 'A',
                subject: `Subject ${sem}`,
                faculty: users[1].name,
                totalStudents: 60,
                presentStudents: 60 - Math.floor(Math.random() * 8),
                absentStudents: Math.floor(Math.random() * 8),
                attendancePercentage: 85 + Math.floor(Math.random() * 15),
                temperature: 22 + Math.floor(Math.random() * 3),
                humidity: 43 + Math.floor(Math.random() * 5),
                lastUpdated: new Date().toISOString()
            };
            classrooms.push(classroom);
        });
        
        saveData('./data/config/classrooms.json', classrooms);
        console.log(`✅ Created ${classrooms.length} default classrooms`);
    }
    
    console.log('\n✅ Default data creation complete!');
}

// Run default data creation
createDefaultData();

console.log('\n📊 LOADED DATA:');
console.log(`   🏛️  Universities: ${universities.length}`);
console.log(`   🏢  Institutes: ${institutes.length}`);
console.log(`   📚  Departments: ${departments.length}`);
console.log(`   👥  Users: ${users.length}`);
console.log(`   🎓  Classes: ${classes.length}`);
console.log(`   🔬  Labs: ${labs.length}`);
console.log(`   📺  Displays: ${displays.length}`);
console.log(`   🏫  Classrooms: ${classrooms.length}`);
console.log(`   📝  Submissions: ${submissions.length}`);

// ==============================================
// mDNS SERVICE
// ==============================================


// ==============================================
// AUTHENTICATION MIDDLEWARE
// ==============================================

function simpleAuth(req, res, next) {

    if (!currentUser) {
        console.log(`simpleAuth ERROR NO USER LOGIN IN `);
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    console.log(`simpleAuth USER LOGIN IN `,currentUser);
    req.user = currentUser;
    next();
}

function requireRole(...allowedRoles){
    return (req, res, next) => {
            console.log(`requireRole USER `,req.user);
            console.log(`requireRole ROLE`,req.user.role);
            console.log(`requireRole ALLOWED ROLE`,allowedRoles);
       
            if (!req.user || !allowedRoles.includes(req.user.role)) {
             console.log(`requireRole DENIED NOT ADMIN`,req.user.role);
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        console.log(`requireRole RUN ADMIN`,req.user.role);
        next();
    };
}

// ==============================================
// MULTER CONFIG
// ==============================================

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         let uploadPath = './uploads';
//         if (req.body.contentType === 'pdf') uploadPath = './uploads/pdf';
//         else if (req.body.contentType === 'word') uploadPath = './uploads/word';
//         else if (req.body.contentType === 'image') uploadPath = './uploads/images';
//         else if (req.body.contentType === 'video') uploadPath = './uploads/videos';
//         cb(null, uploadPath);
//     },
//     filename: function (req, file, cb) {
//         const userId = req.user ? req.user.userId : 'unknown';
//         cb(null, generateFileName(userId, file.originalname));
//     }
// });

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 52428800 },
//     fileFilter: (req, file, cb) => {
//         const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov'];
//         const ext = path.extname(file.originalname).toLowerCase();
//         cb(null, allowed.includes(ext));
//     }
// });
// ==============================================
// MULTER FILE UPLOAD CONFIGURATION
// ==============================================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('\n🔍 MULTER DESTINATION:');
        let uploadPath = './uploads';
        
        if (req.body && req.body.contentType) {
            console.log('✅ ContentType from body:', req.body.contentType);
            switch(req.body.contentType) {
                case 'pdf':
                    uploadPath = './uploads/pdf';
                    break;
                case 'word':
                    uploadPath = './uploads/word';
                    break;
                case 'image':
                    uploadPath = './uploads/images';
                    break;
                case 'video':
                    uploadPath = './uploads/videos';
                    break;
            }
        } else {
            console.log('📁 Detecting from mimetype:', file.mimetype);
            if (file.mimetype === 'application/pdf') {
                uploadPath = './uploads/pdf';
            } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
                uploadPath = './uploads/word';
            } else if (file.mimetype.startsWith('image/')) {
                uploadPath = './uploads/images';
            } else if (file.mimetype.startsWith('video/')) {
                uploadPath = './uploads/videos';
            }
        }
        
        console.log('📂 Upload Path:', uploadPath);
        cb(null, uploadPath);
    },
    
    filename: function (req, file, cb) {
        console.log('\n🔍 MULTER FILENAME:');
        const tempTimestamp = getHumanReadableTimestamp();// Date.now();
        const ext = path.extname(file.originalname);
        let uniqueName;
        
        if(req.body.userId || req.user){
            const userId = req.body.userId || req.user.userId || 'unknown';
            const nameWithoutExt = path.basename(file.originalname, ext);
            uniqueName = `${userId}-${tempTimestamp}-${nameWithoutExt}${ext}`;
            console.log('👤 User ID:', userId);
        } else {
            uniqueName = `temp_${tempTimestamp}${ext}`;
        }
        
        console.log('📝 Generated Name:', uniqueName);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${ext}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 52428800 } // 50MB
});

// ==============================================
// ROUTES - AUTH
// ==============================================

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
        logAction('LOGIN_FAILED', { email });
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    currentUser = user;
    logAction('LOGIN_SUCCESS', { userId: user.userId, name: user.name });
    
    res.json({
        success: true,
        token: 'SIMPLE_TOKEN',
        user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            departmentCode: user.departmentCode,
            departmentId: user.departmentId,
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
    currentUser = null;
    res.json({ success: true, message: 'Logged out' });
});

// ==============================================
// ROUTES - UNIVERSITIES
// ==============================================

app.post('/api/config/universities', simpleAuth, requireRole('admin'), (req, res) => {
    const uni = {
        id: generateUniqueCode('UNI', universities.map(u => u.id)),
        code: generateUniqueCode('UCODE', universities.map(u => u.code)),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    universities.push(uni);
    saveData(UNIVERSITYS_FILE, universities);
    logAction('UNIVERSITY_CREATED', { id: uni.id, name: uni.name });
    res.status(201).json({ success: true, data: uni });
});

app.get('/api/config/universities', simpleAuth, (req, res) => {
    res.json({ success: true, count: universities.length, data: universities });
});

app.get('/api/config/universities/:id', simpleAuth, (req, res) => {
    const uni = universities.find(u => u.id === req.params.id);
    if (!uni) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: uni });
});

app.put('/api/config/universities/:id', simpleAuth, requireRole('admin'), (req, res) => {
    const index = universities.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    universities[index] = { ...universities[index], ...req.body, lastUpdated: new Date().toISOString() };
    saveData(UNIVERSITYS_FILE, universities);
    res.json({ success: true, data: universities[index] });
});

app.delete('/api/config/universities/:id', simpleAuth, requireRole('admin'), (req, res) => {
    const index = universities.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    universities.splice(index, 1);
    saveData(UNIVERSITYS_FILE, universities);
    res.json({ success: true, message: 'Deleted' });
});

// ==============================================
// ROUTES - INSTITUTES
// ==============================================

app.post('/api/config/institutes', simpleAuth, requireRole('admin'), (req, res) => {
    const inst = {
        id: generateUniqueCode('INST', institutes.map(i => i.id)),
        code: generateUniqueCode('ICODE', institutes.map(i => i.code)),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    institutes.push(inst);
    saveData(INSTITUTE_FILE, institutes);
    res.status(201).json({ success: true, data: inst });
});

app.get('/api/config/institutes', simpleAuth, (req, res) => {
    res.json({ success: true, count: institutes.length, data: institutes });
});

// ==============================================
// ROUTES - DEPARTMENTS
// ==============================================

app.post('/api/config/departments', simpleAuth, requireRole('admin'), (req, res) => {
    const dept = {
        id: generateUniqueCode('DEPT', departments.map(d => d.id)),
        code: generateUniqueCode('DCODE', departments.map(d => d.code)),
        rating: 4.0,
        performance: { attendance: 90, passPercentage: 85, placementRate: 80, researchPapers: 0 },
        certificates: [],
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    departments.push(dept);
    saveData('./data/config/departments.json', departments);
    res.status(201).json({ success: true, data: dept });
});
// simpleAuth,
app.get('/api/config/departments', (req, res) => {
    res.json({ success: true, count: departments.length, data: departments });
});

// Update department rating/performance
app.put('/api/config/departments/:id/performance', simpleAuth, (req, res) => {
    const index = departments.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Allow department members to update performance
    const dept = departments[index];
    if (req.user.role !== 'admin' && req.user.departmentId !== dept.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (req.body.rating) dept.rating = req.body.rating;
    if (req.body.performance) dept.performance = { ...dept.performance, ...req.body.performance };
    if (req.body.certificates) dept.certificates = req.body.certificates;
    
    dept.lastUpdated = new Date().toISOString();
    saveData('./data/config/departments.json', departments);
    res.json({ success: true, data: dept });
});

// ==============================================
// ROUTES - USERS (Combined Admins + Faculty)
// ==============================================

app.post('/api/config/users', simpleAuth, requireRole('admin'), (req, res) => {
    const user = {
        id: generateUniqueCode('USER', users.map(u => u.id)),
        userId: generateUniqueCode(req.body.role === 'admin' ? 'ADMIN' : 'FAC', users.map(u => u.userId)),
        role: req.body.role || 'faculty',
        department: req.body.role === 'admin' ? 'ADMININSTRATION' : '--', 
        departmentCode:  req.body.role === 'admin' ? 'ADMIN' : '--', 
        postingScope: req.body.postingScope || 'department',  // ← CONFIGURABLE
        requiresApproval: req.body.requiresApproval === 'yes',  // ← CONFIGURABLE
        canPostInstitute: ['university', 'institute'].includes(req.body.postingScope),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };

    console.log("CREATED USERS ",user);
    users.push(user);
    saveData(USERS_FILE, users);
    res.status(201).json({ success: true, data: user });
});

app.get('/api/config/users', simpleAuth, requireRole('admin'), (req, res) => {
    res.json({ success: true, count: users.length, data: users });
});

// Get faculty only
app.get('/api/config/faculty', simpleAuth, (req, res) => {
    const faculty = users.filter(u => u.role === 'faculty');
    res.json({ success: true, count: faculty.length, data: faculty });
});

// Get admins only  requireRole('admin'),
app.get('/api/config/admins', simpleAuth,  (req, res) => {
    const admins = users.filter(u => u.role === 'admin');
    res.json({ success: true, count: admins.length, data: admins });
});

// ==============================================
// ROUTES - CLASSES
// ==============================================

app.post('/api/config/classes', simpleAuth, requireRole('admin'), (req, res) => {
    const cls = {
        id: generateUniqueCode('CLASS', classes.map(c => c.id)),
        classId: generateUniqueCode('CLS', classes.map(c => c.classId)),
        rating: 4.0,
        performance: { attendance: 90, avgMarks: 75 },
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    classes.push(cls);
    saveData('./data/config/classes.json', classes);
    res.status(201).json({ success: true, data: cls });
});
//simpleAuth, 
app.get('/api/config/classes',(req, res) => {
    res.json({ success: true, count: classes.length, data: classes });
});


// Update class rating
app.put('/api/config/classes/:id/rating', simpleAuth, (req, res) => {
    const index = classes.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    
    if (req.body.rating) classes[index].rating = req.body.rating;
    if (req.body.performance) classes[index].performance = { ...classes[index].performance, ...req.body.performance };
    
    saveData('./data/config/classes.json', classes);
    res.json({ success: true, data: classes[index] });
});

// ==============================================
// ROUTES - LABS
// ==============================================

app.post('/api/config/labs', simpleAuth, requireRole('admin'), (req, res) => {
    const lab = {
        id: generateUniqueCode('LAB', labs.map(l => l.id)),
        code: generateUniqueCode('LABCODE', labs.map(l => l.code)),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    labs.push(lab);
    saveData('./data/config/labs.json', labs);
    res.status(201).json({ success: true, data: lab });
});

app.get('/api/config/labs', simpleAuth, (req, res) => {
    res.json({ success: true, count: labs.length, data: labs });
});

// ==============================================
// ROUTES - DISPLAYS
// ==============================================

app.post('/api/config/displays', simpleAuth, requireRole('admin'), (req, res) => {
    const display = {
        id: generateUniqueCode('DISP', displays.map(d => d.id)),
        displayCode: req.body.displayCode || generateUniqueCode('DSP', displays.map(d => d.displayCode)),
        status: 'active',
        lastActive: new Date().toISOString(),
        config: { autoRefresh: 30, showNav: true, showRightSidebar: true },
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    displays.push(display);
    saveData(DISPLAYS_FILE, displays);
    res.status(201).json({ success: true, data: display });
});

app.get('/api/displays', (req, res) => {
    res.json({ success: true, count: displays.length, data: displays });
});

app.get('/api/displays/:displayCode', (req, res) => {
    const display = displays.find(d => d.displayCode === req.params.displayCode);
    if (!display) return res.status(404).json({ success: false, message: 'Display not found' });
    res.json({ success: true, data: display });
});

app.get('/api/displays/:displayCode/content', (req, res) => {
    const display = displays.find(d => d.displayCode === req.params.displayCode);
    if (!display) return res.status(404).json({ success: false, message: 'Display not found' });
    
    const now = new Date();
    const content = submissions.filter(s => {
       // if (s.approvalStatus !== 'approved') return false;
        const start = new Date(s.startDate + ' ' + s.startTime);
        const end = new Date(s.endDate + ' ' + s.endTime);
       // if (now < start || now > end) return false;
        if (!s.selectedDisplays.includes(display.displayCode)) return false;
        return true;
    }).sort((a, b) => {
        const priority = { emergency: 3, important: 2, normal: 1 };
        return priority[b.priority] - priority[a.priority];
    });
    
    res.json({ success: true, display, contentCount: content.length, content });
});

app.post('/api/displays/:displayCode/heartbeat', (req, res) => {
    const display = displays.find(d => d.displayCode === req.params.displayCode);
    if (!display) return res.status(404).json({ success: false, message: 'Display not found' });
    
    display.lastActive = new Date().toISOString();
    display.status = 'active';
    if (req.body.temperature) display.config.temperature = req.body.temperature;
    if (req.body.humidity) display.config.humidity = req.body.humidity;
    
    saveData(DISPLAYS_FILE, displays);
    res.json({ success: true, message: 'Heartbeat received' });
});

// ==============================================
// ROUTES - SUBMISSIONS
// ==============================================
app.post('/api/submissions', simpleAuth, upload.single('file'), (req, res) => {
    console.log('\n📝 NEW SUBMISSION REQUEST');
    
    try {
        console.log('📋 Request Body:', req.body);
        console.log('📁 File:', req.file ? req.file.originalname : 'No file');
        
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
            }
            return res.status(400).json({
                success: false,
                message: 'Missing required fields or file'
            });
        }
        
        const userId = req.user.userId;
        const properFileName = generateFileName(userId, req.file.originalname);
        
        // Rename file
        const oldPath = req.file.path;
        const newPath = path.join(path.dirname(oldPath), properFileName);
        fs.renameSync(oldPath, newPath);
        console.log('✅ File renamed:', properFileName);
        
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
            return res.status(400).json({
                success: false,
                message: 'At least one display must be selected'
            });
        }
        
        // Generate unique submission ID
        const submissionId = generateUniqueCode('SUB', submissions.map(s => s.submissionId));
        
        // Create submission object
        const submission = {
            submissionId,
            userId: req.user.userId,
            userName: req.user.name,
            userRole: req.user.role,
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
    





        submissions.push(submission);
        saveData(SUBMISSIONS_FILE, submissions, 'submissions');
        
        logAction('SUBMISSION_CREATED', {
            submissionId,
            userId: req.user.userId,
            title,
            displays: displays.length
        });
        
        console.log('✅ Submission created:', submissionId);
        
        res.status(201).json({
            success: true,
            message: 'Submission created successfully',
            data: submission
        });
        
    } catch (error) {
        console.error('❌ Submission error:', error);
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {}
        }
        res.status(500).json({
            success: false,
            message: 'Error creating submission: ' + error.message
        });
    }
});



app.get('/api/submissions', simpleAuth, (req, res) => {
    //const userSubs = req.user.role === 'admin' ? submissions : submissions.filter(s => s.userId === req.user.userId);
   const userSubs = submissions;
   //console(userSubs);
    res.json({ success: true, count: userSubs.length, data: userSubs });
});

app.delete('/api/submissions/:id', simpleAuth, (req, res) => {
    const index = submissions.findIndex(s => s.submissionId === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    
    const sub = submissions[index];
    if (req.user.role !== 'admin' && sub.userId !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    try {
        if (fs.existsSync(sub.filePath)) fs.unlinkSync(sub.filePath);
    } catch (e) {}
    
    submissions.splice(index, 1);
    saveData(SUBMISSIONS_FILE, submissions);
    res.json({ success: true, message: 'Deleted' });
});


// ==============================================
// ROUTES - CLASSROOMS
// ==============================================

app.get('/api/classroom/live', (req, res) => {
    res.json({ success: true, count: classrooms.length, data: classrooms });
});

// ==============================================
// ROUTES - HEALTH
// ==============================================

app.get('/api/health', (req, res) => {

    const networkInterfaces = require('os').networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
        }
    }
    
    res.json({
        success: true,
        version: '2.0.0',
        serverIPs: addresses,
        stats: {
            universities: universities.length,
            institutes: institutes.length,
            departments: departments.length,
            users: users.length,
            classes: classes.length,
            labs: labs.length,
            displays: displays.length,
            submissions: submissions.length
        }
    });
});

app.get('/api/discover', (req, res) =>{

    const networkInterfaces = require('os').networkInterfaces();
    const addresses = [];

    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
        }
    }
    res.json({ success: true, serverIPs: addresses, port: process.env.PORT || 5000 });
});
// ==============================================
// START SERVER
// ==============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(100));
    console.log('✅ SERVER RUNNING');
    console.log('='.repeat(100));
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    
   startMdnsAdvertisement(PORT);
    
    console.log('\n📊 SINGLE SOURCE OF TRUTH:');
    console.log('   📁 data/config/universities.json');
    console.log('   📁 data/config/institutes.json');
    console.log('   📁 data/config/departments.json');
    console.log('   📁 data/config/users.json (admins + faculty)');
    console.log('   📁 data/config/classes.json');
    console.log('   📁 data/config/labs.json');
    console.log('   📁 data/config/displays.json');
    
    console.log('\n✨ FEATURES:');
    console.log('   ✅ Single users file (admins + faculty)');
    console.log('   ✅ Configurable postingScope (university/institute/department)');
    console.log('   ✅ Configurable requiresApproval (yes/no)');
    console.log('   ✅ All IDs system-generated');
    console.log('   ✅ Department rating & performance');
    console.log('   ✅ Class rating & performance');
    console.log('   ✅ Dynamic default data creation');
    console.log('   ✅ mDNS service discovery');
    console.log('='.repeat(100) + '\n');
});

module.exports = app;