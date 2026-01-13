const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/drafts
// @desc    Save draft
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, category, contentType, draftData } = req.body;

        // Generate draft ID
        const draftId = 'DRAFT-' + Date.now();

        // Insert draft
        await pool.query(
            `INSERT INTO drafts (draft_id, user_id, title, description, category, content_type, draft_data)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                draftId,
                req.user.user_id,
                title || null,
                description || null,
                category || null,
                contentType || null,
                JSON.stringify(draftData || {})
            ]
        );

        // Log activity
        await pool.query(
            'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.user_id, 'DRAFT_SAVED', 'draft', draftId, `Saved draft: ${title || 'Untitled'}`]
        );

        res.status(201).json({
            success: true,
            message: 'Draft saved successfully',
            data: {
                draftId,
                title
            }
        });

    } catch (error) {
        console.error('Save draft error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error saving draft'
        });
    }
});

// @route   GET /api/drafts
// @desc    Get all drafts for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const [drafts] = await pool.query(
            `SELECT * FROM drafts 
             WHERE user_id = ?
             ORDER BY updated_at DESC
             LIMIT ? OFFSET ?`,
            [req.user.user_id, parseInt(limit), parseInt(offset)]
        );

        // Parse draft_data JSON
        drafts.forEach(draft => {
            if (draft.draft_data) {
                try {
                    draft.draft_data = JSON.parse(draft.draft_data);
                } catch (e) {
                    draft.draft_data = {};
                }
            }
        });

        res.json({
            success: true,
            count: drafts.length,
            data: drafts
        });

    } catch (error) {
        console.error('Get drafts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching drafts'
        });
    }
});

// @route   GET /api/drafts/:id
// @desc    Get single draft by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [drafts] = await pool.query(
            'SELECT * FROM drafts WHERE draft_id = ? AND user_id = ?',
            [req.params.id, req.user.user_id]
        );

        if (drafts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Draft not found'
            });
        }

        const draft = drafts[0];

        // Parse draft_data JSON
        if (draft.draft_data) {
            try {
                draft.draft_data = JSON.parse(draft.draft_data);
            } catch (e) {
                draft.draft_data = {};
            }
        }

        res.json({
            success: true,
            data: draft
        });

    } catch (error) {
        console.error('Get draft error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching draft'
        });
    }
});

// @route   PUT /api/drafts/:id
// @desc    Update draft
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if draft exists and belongs to user
        const [existing] = await pool.query(
            'SELECT * FROM drafts WHERE draft_id = ? AND user_id = ?',
            [req.params.id, req.user.user_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Draft not found or access denied'
            });
        }

        const { title, description, category, contentType, draftData } = req.body;

        // Update draft
        await pool.query(
            `UPDATE drafts 
             SET title = ?, description = ?, category = ?, content_type = ?, draft_data = ?
             WHERE draft_id = ?`,
            [
                title || existing[0].title,
                description !== undefined ? description : existing[0].description,
                category || existing[0].category,
                contentType || existing[0].content_type,
                JSON.stringify(draftData || {}),
                req.params.id
            ]
        );

        // Log activity
        await pool.query(
            'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.user_id, 'DRAFT_UPDATED', 'draft', req.params.id, `Updated draft: ${title || 'Untitled'}`]
        );

        res.json({
            success: true,
            message: 'Draft updated successfully',
            data: {
                draftId: req.params.id,
                title
            }
        });

    } catch (error) {
        console.error('Update draft error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating draft'
        });
    }
});

// @route   DELETE /api/drafts/:id
// @desc    Delete draft
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if draft exists and belongs to user
        const [existing] = await pool.query(
            'SELECT * FROM drafts WHERE draft_id = ? AND user_id = ?',
            [req.params.id, req.user.user_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Draft not found or access denied'
            });
        }

        // Delete draft
        await pool.query('DELETE FROM drafts WHERE draft_id = ?', [req.params.id]);

        // Log activity
        await pool.query(
            'INSERT INTO activity_log (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.user_id, 'DRAFT_DELETED', 'draft', req.params.id, `Deleted draft: ${existing[0].title || 'Untitled'}`]
        );

        res.json({
            success: true,
            message: 'Draft deleted successfully'
        });

    } catch (error) {
        console.error('Delete draft error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting draft'
        });
    }
});

module.exports = router;