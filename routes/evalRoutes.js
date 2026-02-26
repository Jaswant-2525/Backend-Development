import express from 'express';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { auth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Analytics Dashboard - Aggregated Stats (Admin only)
router.get('/stats', auth, authorize(['ADMIN']), async (req, res) => {
    try {
        const totalTasks = await Submission.countDocuments();
        const completedTasks = await Submission.countDocuments({ isFinal: true });
        const pendingTasks = totalTasks - completedTasks;

        const avgBySubject = await Submission.aggregate([
            { $match: { isFinal: true, 'score.total': { $exists: true } } },
            { $group: { _id: '$subject', avgScore: { $avg: '$score.total' } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalTasks,
            pendingTasks,
            completedTasks,
            avgBySubject
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign task (Admin only) - now supports optional studentId and dueDate
router.post('/assign', auth, authorize(['ADMIN']), async (req, res) => {
    try {
        const { studentName, subject, assignedTo, studentId, dueDate } = req.body;
        if (!dueDate) return res.status(400).json({ message: 'Due date is required' });
        const newSubmission = new Submission({ studentName, subject, assignedTo, studentId: studentId || null, dueDate });
        await newSubmission.save();
        res.status(201).json(newSubmission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all evaluations (Admin) - with search & filter support
router.get('/all', auth, authorize(['ADMIN']), async (req, res) => {
    try {
        const { search, status } = req.query;
        let filter = {};

        // Search by student name (case-insensitive)
        if (search) {
            filter.studentName = { $regex: search, $options: 'i' };
        }

        // Filter by status
        if (status === 'Pending') {
            filter.isFinal = false;
        } else if (status === 'Completed') {
            filter.isFinal = true;
        }

        const evaluations = await Submission.find(filter)
            .populate('assignedTo', 'username')
            .populate('studentId', 'username');
        res.json(evaluations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get assigned tasks (Evaluator)
router.get('/assigned', auth, authorize(['EVALUATOR']), async (req, res) => {
    try {
        const mySubmissions = await Submission.find({ assignedTo: req.user.id });
        res.json(mySubmissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get student's own scores (Student)
router.get('/my-scores', auth, authorize(['STUDENT']), async (req, res) => {
    try {
        const myScores = await Submission.find({ studentId: req.user.id })
            .populate('assignedTo', 'username');
        res.json(myScores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit evaluation with rubric scores (Evaluator)
router.put('/evaluate/:id', auth, authorize(['EVALUATOR']), async (req, res) => {
    const { score, remarks } = req.body;
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Not found' });

        if (submission.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (submission.isFinal) {
            return res.status(400).json({ message: 'Evaluation is final.' });
        }

        // Deadline check - block if past due date
        if (submission.dueDate && new Date() > new Date(submission.dueDate)) {
            return res.status(403).json({ message: 'Deadline has passed. Submission is locked.' });
        }

        // Support both rubric object and legacy single number
        if (typeof score === 'object' && score !== null) {
            submission.score = {
                logic: score.logic || 0,
                quality: score.quality || 0,
                viva: score.viva || 0,
                total: (score.logic || 0) + (score.quality || 0) + (score.viva || 0)
            };
        } else {
            submission.score = { logic: 0, quality: 0, viva: 0, total: Number(score) || 0 };
        }

        submission.remarks = remarks;
        submission.isFinal = true;

        await submission.save();
        res.json({ message: 'Submitted successfully', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unlock (re-evaluate) a finalized submission (Admin only)
router.put('/unlock/:id', auth, authorize(['ADMIN']), async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Not found' });

        submission.isFinal = false;
        await submission.save();

        res.json({ message: 'Submission unlocked for re-evaluation', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;