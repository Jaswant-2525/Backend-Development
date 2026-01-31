import express from 'express';
import Submission from '../models/Submission.js';
import { auth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/assign', auth, authorize(['ADMIN']), async (req, res) => {
    try {
        const { studentName, subject, assignedTo } = req.body;
        const newSubmission = new Submission({ studentName, subject, assignedTo });
        await newSubmission.save();
        res.status(201).json(newSubmission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/all', auth, authorize(['ADMIN']), async (req, res) => {
    try {
        const evaluations = await Submission.find().populate('assignedTo', 'username');
        res.json(evaluations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/assigned', auth, authorize(['EVALUATOR']), async (req, res) => {
    try {
        const mySubmissions = await Submission.find({ assignedTo: req.user.id });
        res.json(mySubmissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/evaluate/:id', auth, authorize(['EVALUATOR']), async (req, res) => {
    const { score, remarks } = req.body;
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ message: 'Not found' });

        if (submission.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (submission.isFinal) { // [cite: 32, 33]
            return res.status(400).json({ message: 'Evaluation is final.' });
        }

        submission.score = score;
        submission.remarks = remarks;
        submission.isFinal = true; 

        await submission.save();
        res.json({ message: 'Submitted successfully', submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;