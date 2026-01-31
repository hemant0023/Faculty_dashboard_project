//git_token
//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

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
const axios = require('axios');
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

const folders = ['uploads', 'uploads/pdf', 'uploads/word', 'uploads/images', 'uploads/videos','data', 'data/config', 'data/submissions', 'data/logs' ];

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
const CLASSES_FILE =   './data/config/classes.json';
const DISPLAYS_FILE =     './data/config/displays.json';
const UNIVERSITYS_FILE =     './data/config/universities.json';
const INSTITUTE_FILE =   './data/config/institutes.json';

let universities = loadData(UNIVERSITYS_FILE) || [];
let institutes = loadData(INSTITUTE_FILE) || [];
let departments = loadData(DEPARTMENTS_FILE) || [];
let classrooms = loadData(CLASSROOMS_FILE) || [];
let classes = loadData(CLASSES_FILE) || [];
let labs = loadData('./data/config/labs.json') || [];
let routines = loadData('./data/config/routines.json') || [];
let users = loadData(USERS_FILE) || [];  // ← SINGLE USERS FILE (admins + faculty)
let displays = loadData(DISPLAYS_FILE) || [];
let submissions = loadData(SUBMISSIONS_FILE) || [];





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
    

 // 8. Create Default Classrooms (Live Data)
    if (classrooms.length === 0){
        console.log('📝 Creating default classroom data...');
        const TEMP_classrooms = [301, 302, 303, 304, 305, 306, 307, 308,309];
        
        TEMP_classrooms.forEach(CLASS_NO => {
            
    const classroom = {

        id: generateUniqueCode('ROOM', classrooms.map(c => c.id)),
        classroomId: `${departments[0].code}-${sem}01`,
        CLASSROOM_NO : CLASS_NO,
        department: "Electronics and Communication Engineering",
        departmentCode: "ECE",
        departmentId: "DEPT-20260119_013352-EUSW",
        LOCATION :"2TH FLOOR",      
        MAX_CAPCITY :100,
        ATTENDANCE_DEVICE_STATUS :"online",
        ATTENDANCE_DEVICE_IP:"192.168.0.101",
        ATTENDANCE_DEVICE_PORT: 80,
        ATTENDANCE_DEVICE_SERIAL_NO:"",
        ATTENDANCE_DEVICEMAC_ADDR:"",
        ATTENDANCE_DEVICE_MAC_ADDR:"",
        ATTENDANCE_DEVICE_ENABLED:  true,
        ATTENDANCE_DEVICE_STATUS: "online",
        ATTENDANCE_DEVICE_POLLING: {
        interval: 5000,        
        timeout: 8000,          
        retryAttempts: 3,       
        retryDelay: 2000        
    },

    cache: {
        enabled: true,
        ttl: 30000,            
        maxAge: 60000          
    },
  
    display: {
        showInactiveClassrooms: false,  
        maxSessionsPerDay: 10,
        temperatureUnit: "celsius",     
        humidityWarningThreshold: 70,   
        temperatureWarningMin:    18,      
        temperatureWarningMax:    34      
    },
    
     classId: "ECE-301-A",
     semester: 1 + TEMP_classrooms.indexOf.CLASS_NO,
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
        saveData(CLASSROOMS_FILE, classrooms);
        console.log(`✅ Created ${classrooms.length} default classrooms`);
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
              department: "Electronics and Communication Engineering",
              departmentCode: "ECE",
              departmentId: "DEPT-20260119_013352-EUSW",
                 "classId": "ECE-7A_108",
              classId: `${departments[0].code}-${sem}${sec}_${100 + semesters.indexOf(sem)}`,
                    semester: sem,
                    section: sec,
                    totalStudents: 60,
                    subject_list:  "",
                    faculty_list:  "",
                    routine_id:"",
                    coordinator:   "",  // HOD
                    room: `${sem}0${semesters.indexOf(sem) + 1}-${sec}`,
                    type: 'regular',
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
        
        saveData(CLASSES_FILE, classes);
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

// ==============================================
// ROUTES - CLASSROOMS
// ==============================================

app.get('/api/classrooms/config', (req, res) => {
    res.json({ success: true, count: classrooms.length, data: classrooms });
});

app.get('/api/classrooms/config/:classroomId', (req, res) => {
    
    const { classroomId } = req.params;
    const classroom  = classrooms.find(c => c.classroomId === classroomId);
    
    if (!classroom) {
        return res.status(404).json({
            success: false,
            error: 'Classroom not found'
        });
    }
    
    res.json({
        success: true,
        data: classroom
    });
});

app.post('/api/config/classrooms', simpleAuth, requireRole('admin'), (req, res) => {
  
    try {
    const classroom = {

        id:          generateUniqueCode('CLASSROOM', classes.map(c => c.id)),
        classroomId: generateUniqueCode('CLASSROOM', classes.map(c => c.classId)),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };
    
    classrooms.push(classroom);
    saveData(CLASSROOMS_FILE, classroom);
      // Restart polling with new config
        stopPolling();
        startPolling();
    res.status(201).json({ success: true, data: classroom });
   
} catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


//simpleAuth, 
app.get('/api/config/classes',(req, res) => {
    res.json({ success: true, count: classes.length, data: classes });
});


app.post('/api/config/classes', simpleAuth, requireRole('admin'), (req, res) => {
    const cls = {

        id:      generateUniqueCode('CLASS', classes.map(c => c.id)),
        classId: generateUniqueCode('CLASS', classes.map(c => c.classId)),
        rating:  4.0,
        performance: { attendance: 90, avgMarks: 75 },
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
    };

    classes.push(cls);
    saveData(CLASSES_FILE, classes);
    res.status(201).json({ success: true, data: cls });
});

// Update class rating
app.put('/api/config/classes/:id/rating', simpleAuth, (req, res) => {

    const index = classes.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    
    if (req.body.rating) classes[index].rating = req.body.rating;
    if (req.body.performance) classes[index].performance = { ...classes[index].performance, ...req.body.performance };
    
    saveData(CLASSES_FILE, classes);
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

   for (const name of Object.keys(networkInterfaces)){

        for (const net of networkInterfaces[name]){
            if(net.family === 'IPv4' && !net.internal) addresses.push(net.address);
        }
    }
    res.json({ success: true, serverIPs: addresses, port: process.env.PORT || 5000 });
});


//==================== ESP32 POLLING SYSTEM ====================

// Cache for live classroom data
const liveClassroomData = new Map();
const classroomStatus = new Map();

function getEnabledClassrooms(){
   return classrooms.filter(c => c.ATTENDANCE_DEVICE_ENABLED === true && c.ATTENDANCE_DEVICE_IP && c.ATTENDANCE_DEVICE_PORT);
}

function getClassroomById(classroomId){
   return classrooms.find(c => c.classroomId === classroomId);
}

function getClassroomsByDepartment(departmentCode){
   return classrooms.filter(c => c.departmentCode === departmentCode);
}

/**
 * Fetch live data from a single ESP32 device
 */
async function fetchLiveClassroomData(classroom){

    const deviceIP = classroom.ATTENDANCE_DEVICE_IP;
    const devicePort = classroom.ATTENDANCE_DEVICE_PORT;
    const url = `http://${deviceIP}:${devicePort}/api/classroom/live`;
    
    // Get polling config (use classroom-specific or defaults)
    const timeout =       classroom.ATTENDANCE_DEVICE_POLLING?.timeout || 8000;
    const retryAttempts = classroom.ATTENDANCE_DEVICE_POLLING?.retryAttempts || 3;
    const retryDelay =    classroom.ATTENDANCE_DEVICE_POLLING?.retryDelay || 2000;
    
    let lastError = null;
    
    // Retry logic
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {

            const response = await axios.get(url, { timeout });
            const liveData = response.data;
            
            // Merge live data with classroom metadata
            const mergedData = {
                // Classroom metadata (from config)
                id: classroom.id,
                classroomId:    classroom.classroomId,
                department:     classroom.department,
                departmentCode: classroom.departmentCode,
                departmentId:   classroom.departmentId,
                maxCapacity:    classroom.MAX_CAPCITY,
                location:       classroom.LOCATION,
                
                // Device info
                deviceIP:      classroom.ATTENDANCE_DEVICE_IP,
                devicePort:    classroom.ATTENDANCE_DEVICE_PORT,
                deviceSerialNo: classroom.ATTENDANCE_DEVICE_SERIAL_NO,
                
                // Live data from ESP32
                ...liveData,
                
                // Status
                status: 'online',
                lastUpdated: new Date().toISOString(),
                lastSuccessfulPoll: Date.now()
            };
            
            // Cache the data
            liveClassroomData.set(classroom.classroomId, mergedData);
            
            // Update status
            classroomStatus.set(classroom.classroomId, {
                status: 'online',
                lastSeen: Date.now(),
                errorCount: 0,
                lastError: null
            });
            
            console.log(`✓ Fetched live data from ${classroom.classroomId} (${deviceIP})`);
            return mergedData;
            
        }catch (error){

            lastError = error.message;
            if (attempt < retryAttempts){
                console.log(`⚠ Retry ${attempt}/${retryAttempts} for ${classroom.classroomId}: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
    
    // All retries failed
    console.error(`✗ Failed to fetch from ${classroom.classroomId} after ${retryAttempts} attempts: ${lastError}`);
    
    // Update status
    const status = classroomStatus.get(classroom.classroomId) || { errorCount: 0 };
    status.errorCount = (status.errorCount || 0) + 1;
    status.status = 'offline';
    status.lastError = lastError;
    classroomStatus.set(classroom.classroomId, status);
    
    // Return cached data if available
    const cachedData = liveClassroomData.get(classroom.classroomId);
    if (cachedData) {
        cachedData.status = 'offline';
        cachedData.stale = true;
        return cachedData;
    }
    
    // Return offline placeholder with metadata
    return {
        id: classroom.id,
        classroomId: classroom.classroomId,
        department: classroom.department,
        departmentCode: classroom.departmentCode,
        maxCapacity: classroom.MAX_CAPCITY,
        location: classroom.LOCATION,
        status: 'offline',
        sessions: [],
        activeSession: null,
        temperature: null,
        humidity: null,
        lastError: lastError
    };
}


async function pollAllClassrooms(){
    
    const enabled = getEnabledClassrooms();
    if(enabled.length === 0){
        console.log('⚠ No enabled classrooms to poll');
        return;
    }
    
    console.log(`\n🔄 Polling ${enabled.length} classroom(s)...`);
    const startTime = Date.now();
    const promises = enabled.map(c => fetchLiveClassroomData(c));
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const elapsed = Date.now() - startTime;
    console.log(`✓ Poll complete: ${successful}/${enabled.length} successful (${elapsed}ms)\n`);
}

let pollingInterval = null;

/**
 * Start automatic polling
 */
function startPolling() {
    // Get global polling interval (use first enabled classroom's config or default)
    const enabledClassrooms = getEnabledClassrooms();
    if (enabledClassrooms.length === 0) {
        console.log('⚠ No enabled classrooms - polling not started');
        return;
    }
    
    const interval = enabledClassrooms[0]?.ATTENDANCE_DEVICE_POLLING?.interval || 5000;
    
    console.log(`🚀 Starting ESP32 polling (interval: ${interval}ms)`);
    
    // Initial poll
    pollAllClassrooms();
    
    // Set up interval
    pollingInterval = setInterval(pollAllClassrooms, interval);
}

/**
 * Stop polling
 */
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('🛑 ESP32 polling stopped');
    }
}


// ==================== API ENDPOINTS ====================



/**
 * GET /api/classroom/live
 * Returns live data from all classrooms
 */

/**
 * GET /api/classroom/live
 * Returns live data from all classrooms
 */
app.get('/api/classroom/live', (req, res) => {
   
   try {
    res.json({ success: true, count: classrooms.length, data: classrooms });
    } catch (error) {
         console.error('Error in /api/classroom/live:', error);
        res.status(500).json({success: false, error: error.message});
     }
});


// app.get('/api/classroom/live', (req, res) => {
   
//     try {
//         const classrooms = [];
        
//         for (const [classroomId, data] of liveClassroomData) {

//             // Get display config from classroom config
//             const classroom = getClassroomById(classroomId);
//             const showInactive = classroom?.display?.showInactiveClassrooms ?? true;
            
//             // Filter out inactive if configured
          
//                 if (!showInactive) {
//                 if (!data.activeSession && (!data.sessions || data.sessions.length === 0)) {
//                     continue;
//                 }
//             }
//         }
        
//         res.json({
//             success: true,
//             timestamp: Date.now(),
//             data: classrooms,
//             count: classrooms.length
//         });
        
//     } catch (error) {
//         console.error('Error in /api/classroom/live:', error);
//         res.status(500).json({success: false, error: error.message});
//     }
// });

/**
 * GET /api/classroom/:classroomId
 * Returns data for specific classroom
 */
app.get('/api/classroom/:classroomId', async (req, res) => {
    try {
        const { classroomId } = req.params;
        const data = classroomDataCache.get(classroomId);
        
        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Classroom not found'
            });
        }
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
/**
 * GET /api/classroom/live/:classroomId
 * Returns live data for specific classroom
 */
app.get('/api/classroom/live/:classroomId', (req, res) => {
    try {
        const { classroomId } = req.params;
        const data = liveClassroomData.get(classroomId);
        
        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'No live data available for this classroom'
            });
        }
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/classroom/live/department/:departmentCode
 * Returns live data for all classrooms in a department
 */
app.get('/api/classroom/live/department/:departmentCode', (req, res) => {
    try {
        const { departmentCode } = req.params;
        const classrooms = [];
        
        for (const [classroomId, data] of liveClassroomData) {
            if (data.departmentCode === departmentCode) {
                classrooms.push(data);
            }
        }
        
        res.json({
            success: true,
            departmentCode: departmentCode,
            data: classrooms,
            count: classrooms.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/classroom/:classroomId/sessions/today
 * Fetch today's sessions directly from ESP32
 */
app.get('/api/classroom/:classroomId/sessions/today', async (req, res) => {
    try {
        const { classroomId } = req.params;
        const classroom = getClassroomById(classroomId);
        
        if (!classroom) {
            return res.status(404).json({
                success: false,
                error: 'Classroom not found'
            });
        }
        
        if (!classroom.ATTENDANCE_DEVICE_ENABLED) {
            return res.status(503).json({
                success: false,
                error: 'Attendance device not enabled for this classroom'
            });
        }
        
        const url = `http://${classroom.ATTENDANCE_DEVICE_IP}:${classroom.ATTENDANCE_DEVICE_PORT}/api/classroom/sessions/today`;
        const timeout = classroom.ATTENDANCE_DEVICE_POLLING?.timeout || 5000;
        
        const response = await axios.get(url, { timeout });
        
        res.json({
            success: true,
            data: response.data
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/classroom/status
 * Returns status of all ESP32 devices
 */
app.get('/api/classroom/status', (req, res) => {
    const statuses = [];
    
    for (const classroom of classroomConfig) {
        const status = classroomStatus.get(classroom.classroomId) || {
            status: 'unknown',
            errorCount: 0
        };
        
        statuses.push({
            id: classroom.id,
            classroomId: classroom.classroomId,
            department: classroom.department,
            departmentCode: classroom.departmentCode,
            location: classroom.LOCATION,
            deviceIP: classroom.ATTENDANCE_DEVICE_IP,
            devicePort: classroom.ATTENDANCE_DEVICE_PORT,
            enabled: classroom.ATTENDANCE_DEVICE_ENABLED,
            status: status.status,
            lastSeen: status.lastSeen,
            errorCount: status.errorCount,
            lastError: status.lastError
        });
    }
    
    res.json({
        success: true,
        data: statuses,
        count: statuses.length
    });
});

/**
 * POST /api/classroom/poll
 * Manually trigger polling
 */
app.post('/api/classroom/poll', async (req, res) => {
    try {
        await pollAllClassrooms();
        res.json({
            success: true,
            message: 'Polling complete'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/classroom/:classroomId/poll
 * Poll specific classroom
 */
app.post('/api/classroom/:classroomId/poll', async (req, res) => {
    try {
        const { classroomId } = req.params;
        const classroom = getClassroomById(classroomId);
        
        if (!classroom) {
            return res.status(404).json({
                success: false,
                error: 'Classroom not found'
            });
        }
        
        const data = await fetchLiveClassroomData(classroom);
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== STATISTICS & ANALYTICS ====================

/**
 * GET /api/statistics/overview
 * Overall system statistics
 */
app.get('/api/statistics/overview', (req, res) => {
    const stats = {
        totalClassrooms: classroomConfig.length,
        enabledClassrooms: getEnabledClassrooms().length,
        onlineClassrooms: Array.from(classroomStatus.values()).filter(s => s.status === 'online').length,
        offlineClassrooms: Array.from(classroomStatus.values()).filter(s => s.status === 'offline').length,
        activeSessions: 0,
        totalStudentsPresent: 0,
        totalStudents: 0
    };
    
    // Calculate from live data
    for (const data of liveClassroomData.values()) {
        if (data.activeSession) {
            stats.activeSessions++;
        }
        if (data.sessions) {
            for (const session of data.sessions) {
                if (session.active) {
                    stats.totalStudentsPresent += session.presentStudents || 0;
                    stats.totalStudents += session.totalStudents || 0;
                }
            }
        }
    }
    
    stats.overallAttendancePercentage = stats.totalStudents > 0 
        ? ((stats.totalStudentsPresent / stats.totalStudents) * 100).toFixed(2)
        : 0;
    
    res.json({
        success: true,
        data: stats
    });
});

/**
 * GET /api/statistics/department/:departmentCode
 * Department-specific statistics
 */
app.get('/api/statistics/department/:departmentCode', (req, res) => {
    const { departmentCode } = req.params;
    
    const departmentClassrooms = getClassroomsByDepartment(departmentCode);
    const stats = {
        departmentCode: departmentCode,
        totalClassrooms: departmentClassrooms.length,
        activeSessions: 0,
        totalStudentsPresent: 0,
        totalStudents: 0
    };
    
    for (const data of liveClassroomData.values()) {
        if (data.departmentCode === departmentCode && data.activeSession) {
            stats.activeSessions++;
            
            if (data.sessions) {
                for (const session of data.sessions) {
                    if (session.active) {
                        stats.totalStudentsPresent += session.presentStudents || 0;
                        stats.totalStudents += session.totalStudents || 0;
                    }
                }
            }
        }
    }
    
    stats.attendancePercentage = stats.totalStudents > 0 
        ? ((stats.totalStudentsPresent / stats.totalStudents) * 100).toFixed(2)
        : 0;
    
    res.json({
        success: true,
        data: stats
    });
});


// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    stopPolling();
    if (mdnsService) {
          console.log('\n🛑 mdnsService clear...');
    mdnsService.stop();
   
    bonjour.destroy();
  }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    stopPolling();
    if (mdnsService) {
        console.log('\n🛑 mdnsService clear...');
    mdnsService.stop();
    bonjour.destroy();
  }
    process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(100));
    console.log('✅ SERVER RUNNING');
    console.log('='.repeat(100));
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    
   startMdnsAdvertisement(PORT);
    startPolling();
    
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