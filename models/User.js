import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { 
        type: String, 
        required: true,
        // 4. Password Complexity: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
        validate: {
            validator: function (v) {
                // Only validate on new documents (raw password), skip for hashed passwords
                if (this.isNew || this.isModified('password')) {
                    // Hashed passwords (bcrypt) start with '$2a$' or '$2b$' — skip them
                    if (v.startsWith('$2a$') || v.startsWith('$2b$')) return true;
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
                }
                return true;
            },
            message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
        }
    },
    role: { 
        type: String, 
        enum: ['ADMIN', 'EVALUATOR', 'STUDENT'], 
        required: true 
    }
});

export default mongoose.model('User', UserSchema);