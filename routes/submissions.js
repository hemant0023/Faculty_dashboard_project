const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, canPostInstitute } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const fs = require('fs').promises;
const path = require('path');

// @route   POST /api/submissions
// @desc    Create new submission
// @access  Private
router.post('/', 
    authenticateToken,
    canPostInstitute,
    // upload.single('file'),
    // handleUploadError,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('category').isIn(['exam', 'event', 'circular', 'announcement', 'emergency', 'holiday', 'meeting', 'workshop'])
            .withMessage('Invalid category'),
        body('contentType').isIn(['pdf', 'word', 'image', 'video']).withMessage('Invalid content type'),
        body('startDate').isDate().withMessage('Valid start date is required'),
        body('endDate').isDate().withMessage('Valid end date is required')
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Delete uploaded file if validation fails
                if (req.file) {
                    await fs.unlink(req.file.path).catch(console.error);
                }
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'File upload is required'
                });
            }

            const {
                title, description, category, contentType, orientation,
                withSound, startDate, startTime, endDate, endTime,
                autoRemove, waitTime, repeatMode, priority,
                importantNote, displayScope, selectedDisplays
            } = req.body;

            // Validate dates
            const start = new Date(`${startDate} ${startTime}`);
            const end = new Date(`${endDate} ${endTime}`);
            
            if (end <= start) {
                await fs.unlink(req.file.path).catch(console.error);
                return res.status(400).json({
                    success: false,
                    message: 'End date must be after start date'
                });
            }

            // Parse selected displays
            let displays = [];
            try {
                displays = JSON.parse(selectedDisplays || '[]');
            } catch (e) {
                displays = selectedDisplays ? selectedDisplays.split(',') : [];
            }

            if (displays.length === 0) {
                await fs.unlink(req.file.path).catch(console.error);
                return res.status(400).json({
                    success: false,
                    message: 'At least one display must be selected'
                });
            }

            // Generate submission ID
            const submissionId = 'INF-' + Date.now();

            // Calculate file size in MB
            const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

            // Get approval status (auto-approve for admin)
            const approvalStatus = req.user.requires_approval ? 'pending' : 'approved';
            const approvedBy = req.user.requires_approval ? null : req.user.user_id;
            const approvedAt = req.user.requires_approval ? null : new Date();

            // Insert submission
            await pool.query(
                `INSERT INTO submissions (
                    submission_id, user_id, title, description, category, content_type,
                    file_name, file_path, file_size, orientation, with_sound,
                    start_date, start_time, end_date, end_time, auto_remove,
                    wait_time, repeat_mode, priority, important_note,
                    display_scope, selected_displays, approval_status,
                    approved_by, approved_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    submissionId, req.user.user_id, title, description || null, category, contentType,
                    req.file.originalname, req.file.path, fileSizeMB, orientation || 'landscape',
                    withSound === 'true' || withSound === true,
                    startDate, startTime, endDate, endTime,
                    autoRemove === 'true' || autoRemove === true,
                    parseInt(waitTime) || 3, repeatMode || 'once', priority || 'normal',
                    importantNote === 'true' || importantNote === true,
                    displayScope || 'department', JSON.stringify(displays), approvalStatus,
                    approvedBy, approvedAt
                ]
            );

            // Log activity
            await pool.query(
                'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
                [req.user.user_id, 'SUBMISSION_CREATED', 'submission', submissionId, 
                 `Created submission: ${title}`]
            );

            res.status(201).json({
                success: true,
                message: approvalStatus === 'approved' ? 
                    'Submission created and approved successfully' : 
                    'Submission created successfully. Pending approval.',
                data: {
                    submissionId,
                    title,
                    approvalStatus,
                    fileName: req.file.originalname,
                    fileSize: fileSizeMB
                }
            });

        } catch (error) {
            console.error('Submission creation error:', error);
            // Delete uploaded file on error
            if (req.file) {
                await fs.unlink(req.file.path).catch(console.error);
            }
            res.status(500).json({
                success: false,
                message: 'Server error during submission creation'
            });
        }
    }
);

// @route   GET /api/submissions
// @desc    Get all submissions for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT s.*, u.name as user_name, u.department
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.user_id = ?
        `;
        const params = [req.user.user_id];

        if (status) {
            query += ' AND s.approval_status = ?';
            params.push(status);
        }

        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [submissions] = await pool.query(query, params);

        // Parse JSON fields
        submissions.forEach(sub => {
            if (sub.selected_displays) {
                try {
                    sub.selected_displays = JSON.parse(sub.selected_displays);
                } catch (e) {
                    sub.selected_displays = [];
                }
            }
        });

        res.json({
            success: true,
            count: submissions.length,
            data: submissions
        });

    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching submissions'
        });
    }
});

// @route   GET /api/submissions/:id
// @desc    Get single submission by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [submissions] = await pool.query(
            `SELECT s.*, u.name as user_name, u.email as user_email, u.department
             FROM submissions s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.submission_id = ? AND s.user_id = ?`,
            [req.params.id, req.user.user_id]
        );

        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        const submission = submissions[0];

        // Parse JSON fields
        if (submission.selected_displays) {
            try {
                submission.selected_displays = JSON.parse(submission.selected_displays);
            } catch (e) {
                submission.selected_displays = [];
            }
        }

        res.json({
            success: true,
            data: submission
        });

    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching submission'
        });
    }
});

// @route   PUT /api/submissions/:id
// @desc    Update submission
// @access  Private
router.put('/:id',
    authenticateToken,
    canPostInstitute,
    // upload.single('file'),
    // handleUploadError,
    async (req, res) => {
        try {
            // Check if submission exists and belongs to user
            const [existing] = await pool.query(
                'SELECT * FROM submissions WHERE submission_id = ? AND user_id = ?',
                [req.params.id, req.user.user_id]
            );

            if (existing.length === 0) {
                if (req.file) {
                    await fs.unlink(req.file.path).catch(console.error);
                }
                return res.status(404).json({
                    success: false,
                    message: 'Submission not found or access denied'
                });
            }

            const oldSubmission = existing[0];

            const {
                title, description, category, contentType, orientation,
                withSound, startDate, startTime, endDate, endTime,
                autoRemove, waitTime, repeatMode, priority,
                importantNote, displayScope, selectedDisplays
            } = req.body;

            // Validate dates if provided
            if (startDate && endDate && startTime && endTime) {
                const start = new Date(`${startDate} ${startTime}`);
                const end = new Date(`${endDate} ${endTime}`);
                
                if (end <= start) {
                    if (req.file) {
                        await fs.unlink(req.file.path).catch(console.error);
                    }
                    return res.status(400).json({
                        success: false,
                        message: 'End date must be after start date'
                    });
                }
            }

            // Parse selected displays
            let displays = oldSubmission.selected_displays;
            if (selectedDisplays) {
                try {
                    displays = JSON.parse(selectedDisplays);
                } catch (e) {
                    displays = selectedDisplays.split(',');
                }
            }

            // Prepare update data
            let updateData = {
                title: title || oldSubmission.title,
                description: description !== undefined ? description : oldSubmission.description,
                category: category || oldSubmission.category,
                content_type: contentType || oldSubmission.content_type,
                orientation: orientation || oldSubmission.orientation,
                with_sound: withSound !== undefined ? (withSound === 'true' || withSound === true) : oldSubmission.with_sound,
                start_date: startDate || oldSubmission.start_date,
                start_time: startTime || oldSubmission.start_time,
                end_date: endDate || oldSubmission.end_date,
                end_time: endTime || oldSubmission.end_time,
                auto_remove: autoRemove !== undefined ? (autoRemove === 'true' || autoRemove === true) : oldSubmission.auto_remove,
                wait_time: waitTime ? parseInt(waitTime) : oldSubmission.wait_time,
                repeat_mode: repeatMode || oldSubmission.repeat_mode,
                priority: priority || oldSubmission.priority,
                important_note: importantNote !== undefined ? (importantNote === 'true' || importantNote === true) : oldSubmission.important_note,
                display_scope: displayScope || oldSubmission.display_scope,
                selected_displays: JSON.stringify(displays),
                approval_status: 'pending' // Reset to pending after update
            };

            // Handle file update
            if (req.file) {
                // Delete old file
                try {
                    await fs.unlink(oldSubmission.file_path);
                } catch (err) {
                    console.error('Error deleting old file:', err);
                }

                updateData.file_name = req.file.originalname;
                updateData.file_path = req.file.path;
                updateData.file_size = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
            }

            // Build update query
            const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = Object.values(updateData);
            values.push(req.params.id);

            await pool.query(
                `UPDATE submissions SET ${fields} WHERE submission_id = ?`,
                values
            );

            // Log activity
            await pool.query(
                'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
                [req.user.user_id, 'SUBMISSION_UPDATED', 'submission', req.params.id, 
                 `Updated submission: ${updateData.title}`]
            );

            res.json({
                success: true,
                message: 'Submission updated successfully. Pending approval.',
                data: {
                    submissionId: req.params.id,
                    title: updateData.title,
                    approvalStatus: 'pending'
                }
            });

        } catch (error) {
            console.error('Update submission error:', error);
            if (req.file) {
                await fs.unlink(req.file.path).catch(console.error);
            }
            res.status(500).json({
                success: false,
                message: 'Server error updating submission'
            });
        }
    }
);

// @route   DELETE /api/submissions/:id
// @desc    Delete submission
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if submission exists and belongs to user
        const [existing] = await pool.query(
            'SELECT * FROM submissions WHERE submission_id = ? AND user_id = ?',
            [req.params.id, req.user.user_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found or access denied'
            });
        }

        const submission = existing[0];

        // Delete file
        try {
            await fs.unlink(submission.file_path);
        } catch (err) {
            console.error('Error deleting file:', err);
        }

        // Delete submission from database
        await pool.query('DELETE FROM submissions WHERE submission_id = ?', [req.params.id]);

        // Log activity
        await pool.query(
            'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.user_id, 'SUBMISSION_DELETED', 'submission', req.params.id, 
             `Deleted submission: ${submission.title}`]
        );

        res.json({
            success: true,
            message: 'Submission deleted successfully'
        });

    } catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting submission'
        });
    }
});

// @route   GET /api/submissions/history/all
// @desc    Get submission history with filters
// @access  Private
router.get('/history/all', authenticateToken, async (req, res) => {
    try {
        const { 
            status, 
            category, 
            priority,
            startDate,
            endDate,
            limit = 50, 
            offset = 0 
        } = req.query;

        let query = `
            SELECT s.*, u.name as user_name, u.department
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.user_id = ?
        `;
        const params = [req.user.user_id];

        if (status) {
            query += ' AND s.approval_status = ?';
            params.push(status);
        }

        if (category) {
            query += ' AND s.category = ?';
            params.push(category);
        }

        if (priority) {
            query += ' AND s.priority = ?';
            params.push(priority);
        }

        if (startDate) {
            query += ' AND s.start_date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND s.end_date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [submissions] = await pool.query(query, params);

        // Parse JSON fields
        submissions.forEach(sub => {
            if (sub.selected_displays) {
                try {
                    sub.selected_displays = JSON.parse(sub.selected_displays);
                } catch (e) {
                    sub.selected_displays = [];
                }
            }
        });

        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total
            FROM submissions s
            WHERE s.user_id = ?
        `;
        const countParams = [req.user.user_id];

        if (status) {
            countQuery += ' AND s.approval_status = ?';
            countParams.push(status);
        }

        const [countResult] = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            count: submissions.length,
            total: countResult[0].total,
            data: submissions
        });

    } catch (error) {
        console.error('Get submission history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching submission history'
        });
    }
});

module.exports = router;