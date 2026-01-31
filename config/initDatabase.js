const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    
    try {
        // Connect without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        console.log('📊 Initializing Smart Notice Board Database...');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log('✅ Database created/verified');

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Create Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'faculty', 'staff', 'student') NOT NULL,
                department VARCHAR(100) NOT NULL,
                department_code VARCHAR(10) NOT NULL,
                posting_scope ENUM('department', 'institute') DEFAULT 'department',
                can_post_institute BOOLEAN DEFAULT FALSE,
                requires_approval BOOLEAN DEFAULT TRUE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_department (department_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Users table created');

        // Create Submissions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                submission_id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category ENUM('exam', 'event', 'circular', 'announcement', 'emergency', 'holiday', 'meeting', 'workshop') NOT NULL,
                content_type ENUM('pdf', 'word', 'image', 'video') NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size VARCHAR(50),
                file_dimensions VARCHAR(50),
                orientation ENUM('landscape', 'portrait') DEFAULT 'landscape',
                with_sound BOOLEAN DEFAULT FALSE,
                start_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_date DATE NOT NULL,
                end_time TIME NOT NULL,
                auto_remove BOOLEAN DEFAULT TRUE,
                wait_time INT DEFAULT 3,
                repeat_mode ENUM('once', 'repeat5', 'repeat10', 'repeat30', 'loop') DEFAULT 'once',
                priority ENUM('normal', 'important', 'emergency') DEFAULT 'normal',
                important_note BOOLEAN DEFAULT FALSE,
                display_scope ENUM('department', 'institute') DEFAULT 'department',
                selected_displays JSON,
                approval_status ENUM('pending', 'approved', 'rejected', 'draft') DEFAULT 'pending',
                approved_by VARCHAR(50),
                approved_at TIMESTAMP NULL,
                rejection_reason TEXT,
                display_count INT DEFAULT 0,
                total_screen_time INT DEFAULT 0,
                reach_count INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user (user_id),
                INDEX idx_status (approval_status),
                INDEX idx_dates (start_date, end_date),
                INDEX idx_priority (priority)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Submissions table created');

        // Create Drafts table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS drafts (
                draft_id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                title VARCHAR(255),
                description TEXT,
                category VARCHAR(50),
                content_type VARCHAR(50),
                draft_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Drafts table created');

        // Create Displays table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS displays (
                display_id VARCHAR(50) PRIMARY KEY,
                display_name VARCHAR(100) NOT NULL,
                display_code VARCHAR(50) UNIQUE NOT NULL,
                department VARCHAR(100),
                department_code VARCHAR(10),
                location VARCHAR(255),
                display_type ENUM('main', 'lab', 'seminar', 'library', 'admin', 'entrance') NOT NULL,
                orientation ENUM('landscape', 'portrait') DEFAULT 'landscape',
                resolution VARCHAR(50),
                is_active BOOLEAN DEFAULT TRUE,
                last_ping TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_department (department_code),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Displays table created');

        // Create Activity Log table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_log (
                log_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50),
                action VARCHAR(100) NOT NULL,
                target_type VARCHAR(50),
                target_id VARCHAR(50),
                details TEXT,
                ip_address VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
                INDEX idx_user (user_id),
                INDEX idx_action (action),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Activity Log table created');

        // Insert default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(`
            INSERT INTO users (user_id, name, email, password, role, department, department_code, 
                              posting_scope, can_post_institute, requires_approval)
            VALUES 
            ('ADMIN-001', 'System Administrator', 'admin@university.edu', ?, 'admin', 
             'Administration', 'ADMIN', 'institute', TRUE, FALSE)
            ON DUPLICATE KEY UPDATE user_id=user_id
        `, [hashedPassword]);
        console.log('✅ Default admin user created (Email: admin@university.edu, Password: admin123)');

        // Insert sample faculty user
        const facultyPassword = await bcrypt.hash('faculty123', 10);
        await connection.query(`
            INSERT INTO users (user_id, name, email, password, role, department, department_code)
            VALUES 
            ('FAC-1023', 'Anjali Sharma', 'anjali.sharma@university.edu', ?, 'faculty', 
             'Electronics and Communication', 'ECE')
            ON DUPLICATE KEY UPDATE user_id=user_id
        `, [facultyPassword]);
        console.log('✅ Sample faculty user created (Email: anjali.sharma@university.edu, Password: faculty123)');

        // Insert sample displays
        await connection.query(`
            INSERT INTO displays (display_id, display_name, display_code, department, department_code, 
                                 location, display_type, orientation)
            VALUES 
            ('DISP-ECE-001', 'ECE Main Display', 'ece-main', 'Electronics and Communication', 'ECE', 
             'ECE Department Main Hall', 'main', 'landscape'),
            ('DISP-ECE-002', 'ECE Lab Display', 'ece-lab', 'Electronics and Communication', 'ECE', 
             'ECE Laboratory', 'lab', 'landscape'),
            ('DISP-ECE-003', 'ECE Seminar Hall', 'ece-seminar', 'Electronics and Communication', 'ECE', 
             'ECE Seminar Hall', 'seminar', 'landscape'),
            ('DISP-ECE-004', 'ECE Library', 'ece-library', 'Electronics and Communication', 'ECE', 
             'ECE Department Library', 'library', 'portrait'),
            ('DISP-MAIN-001', 'Main Entrance Display', 'all-main', 'General', 'ALL', 
             'University Main Entrance', 'entrance', 'landscape'),
            ('DISP-ADMIN-001', 'Admin Block Display', 'all-admin', 'Administration', 'ADMIN', 
             'Administrative Block', 'admin', 'landscape')
            ON DUPLICATE KEY UPDATE display_id=display_id
        `);
        console.log('✅ Sample displays created');

        console.log('\n🎉 Database initialization completed successfully!');
        console.log('\n📝 Default Credentials:');
        console.log('   Admin: admin@university.edu / admin123');
        console.log('   Faculty: anjali.sharma@university.edu / faculty123');
        console.log('\n⚠️  Please change these passwords in production!');

    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = initializeDatabase;
