import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    subject: { type: String, required: true },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    score: { type: Number, default: null },
    remarks: { type: String, default: "" },
    isFinal: { type: Boolean, default: false } 
}, { timestamps: true });

export default mongoose.model('Submission', SubmissionSchema);