const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB using the URL from environment variables
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define mongoose schema for Code
const codeSchema = new mongoose.Schema({
    codeNumber: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Code = mongoose.model('Code', codeSchema);

// Define mongoose schema for Patient
const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    father_name: {
        type: String,
        required: true
    },
    family_name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    class: {
        type: String,
        required: true
    },
    subjects: {
        type: [String],
        required: true
    },
    institution: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    area: {
        type: String,
        enum: ['metro', 'urban', 'rural'],
        required: true
    },
    school_type: {
        type: [String],
        enum: ['government', 'private', 'aided', 'boys_only', 'girls_only', 'combined'],
        required: true
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

// Define mongoose schema for questionnaire responses
const responseSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    response: {
        type: Object,
        required: true
    },
}, {
    timestamps: true
});
const Response = mongoose.model('Response', responseSchema);

// Endpoint to add code
app.post('/code/add', async (req, res) => {
    try {
        const { codeNumber } = req.body;
        const newCode = new Code({ codeNumber });
        const savedCode = await newCode.save();
        console.log('Code added successfully:', savedCode);
        res.status(200).json(savedCode);
    } catch (error) {
        console.error('Error adding code:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to validate code
app.post('/code/validate', async (req, res) => {
    try {
        const { codeNumber } = req.body;
        const code = await Code.findOne({ codeNumber });
        if (!code) {
            return res.status(404).json({ error: 'Code not found' });
        }
        console.log('Code validated successfully:', code);
        res.status(200).json({message: 'Code validated successfully:', codeNumber: code.codeNumber});
        await Code.deleteOne(code._id);
    } catch (error) {
        console.error('Error validating code:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to add patient
app.post('/entry', async (req, res) => {
    try {
        const patientData = req.body;
        const newPatient = new Patient(patientData);
        const savedPatient = await newPatient.save();
        console.log('Patient added successfully:', savedPatient._id);
        res.status(200).json({ id: savedPatient._id });
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to submit responses
app.post('/submit', async (req, res) => {
    try {
        const { id, responses } = req.body;
        const newResponse = new Response({
            patient: id,
            response: responses
        });
        const savedResponse = await newResponse.save();
        res.status(200).send('Responses submitted successfully!');
    } catch (error) {
        console.error('Error submitting responses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
