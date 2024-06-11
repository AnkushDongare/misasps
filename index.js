const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());

const corsOptions = {
    origin: ['https://misasps.netlify.app', 'http://localhost:5173'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


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
    subject1: {
        type: String,
    },
    subject2: {
        type: String,
    },
    subject3: {
        type: String,
    },
    subject4: {
        type: String,
    },
    subject5: {
        type: String,
    },
    subject6: {
        type: String,
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
        res.status(200).json({ message: 'Code validated successfully:', codeNumber: code.codeNumber });
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
        const newResponse = new Response({ patient: id, response: responses });
        const savedResponse = await newResponse.save();
        console.log('Response added successfully:', savedResponse._id);
        res.status(200).send({ message: 'Responses submitted successfully!', id: savedResponse._id });
    } catch (error) {
        console.error('Error submitting responses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to get data  responses
app.get('/api/data', async (req, res) => {
    try {
        const response = await Response.find({});
        res.status(200).send({ response });
    } catch (error) {
        console.error('Error submitting responses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to get data by ID
app.post('/api/data', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        const response = await Response.findById(id);

        if (!response) {
            return res.status(404).json({ error: 'Data not found' });
        }

        res.status(200).json({ response });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to get data  responses
app.get('/get/patient', async (req, res) => {
    try {
        const response = await Patient.find({});
        res.status(200).send({ response });
    } catch (error) {
        console.error('Error submitting responses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Endpoint to get Patient by ID
app.post('/get/patient', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        const response = await Patient.findById(id);

        if (!response) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.status(200).json({ response });
    } catch (error) {
        console.error('Error retrieving Patient:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

const categories = {
    Linguistic: [10, 19, 37, 46, 64, 73, 1, 28, 55, 82],
    Logical: [2, 20, 29, 47, 56, 74, 83, 11, 38, 65],
    BodilyKinesthetic: [3, 12, 30, 39, 57, 66, 84, 21, 48, 75],
    Spatial: [13, 22, 40, 49, 67, 76, 4, 31, 58, 85],
    Musical: [5, 23, 32, 50, 59, 77, 86, 14, 41, 68],
    Naturalistic: [6, 15, 33, 42, 60, 69, 87, 24, 51, 78],
    Interpersonal: [16, 25, 43, 52, 70, 79, 7, 34, 61, 88],
    Intrapersonal: [8, 26, 35, 53, 62, 80, 89, 17, 44, 71],
    Existential: [9, 18, 36, 45, 63, 72, 90, 27, 54, 81]
};

// Endpoint to get data by ID and compute category sums
app.post('/api/result', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        const response = await Response.findById(id);

        if (!response) {
            return res.status(404).json({ error: 'Data not found' });
        }

        const { response: responseData } = response;

        const categoryResults = Object.entries(categories).reduce((acc, [category, ids]) => {
            const sum = ids.reduce((total, id) => total + (responseData[id] || 0), 0);
            acc[category] = sum;
            return acc;
        }, {});

        res.status(200).json({ patient: response.patient, categoryResults });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/', async (req, res) => {
    res.send("Hello World!")
})

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
