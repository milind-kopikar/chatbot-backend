const express = require('express');
const db = require('../utils/db');

const router = express.Router();

/**
 * GET /api/dictionary - Fetch dictionary entries
 * Query parameters:
 * - limit: number of entries to fetch (default: 10, max: 100)
 * - offset: pagination offset (default: 0)
 * - search: optional search term
 */
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search;

        let query = `
            SELECT 
                id,
                entry_number,
                word_konkani_devanagari,
                word_konkani_english_alphabet,
                english_meaning,
                context_usage_sentence,
                created_at,
                updated_at
            FROM dictionary_entries
        `;

        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` WHERE 
                word_konkani_english_alphabet ILIKE $${paramIndex} OR 
                word_konkani_devanagari ILIKE $${paramIndex} OR
                english_meaning ILIKE $${paramIndex}
            `;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY entry_number LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Get total count for pagination
        const countQuery = search 
            ? `SELECT COUNT(*) FROM dictionary_entries WHERE 
               word_konkani_english_alphabet ILIKE $1 OR 
               word_konkani_devanagari ILIKE $1 OR
               english_meaning ILIKE $1`
            : 'SELECT COUNT(*) FROM dictionary_entries';
        
        const countParams = search ? [`%${search}%`] : [];
        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            entries: result.rows,
            pagination: {
                limit,
                offset,
                total,
                hasMore: offset + limit < total
            }
        });
    } catch (error) {
        console.error('Dictionary route error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dictionary entries',
            message: error.message 
        });
    }
});

/**
 * GET /api/dictionary/:id - Get a specific dictionary entry
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                id,
                entry_number,
                word_konkani_devanagari,
                word_konkani_english_alphabet,
                english_meaning,
                context_usage_sentence,
                devanagari_needs_correction,
                meaning_needs_correction,
                created_at,
                updated_at
            FROM dictionary_entries
            WHERE id = $1
        `;

        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Dictionary entry fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dictionary entry',
            message: error.message 
        });
    }
});

module.exports = router;
