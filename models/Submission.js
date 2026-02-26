import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    subject: { type: String, required: true },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    score: { 
        type: {
            logic: { type: Number, default: 0 },
            quality: { type: Number, default: 0 },
            viva: { type: Number, default: 0 },
            total: { type: Number, default: 0 }
        }, 
        default: null 
    },
    remarks: { type: String, default: "" },
    isFinal: { type: Boolean, default: false },
    dueDate: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('Submission', SubmissionSchema);