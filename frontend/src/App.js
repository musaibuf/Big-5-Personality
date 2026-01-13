import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // Import CSV Parser
import {
  Container, Box, Typography, TextField, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Paper, LinearProgress, Alert, MenuItem
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';

// --- ICONS ---
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import logo from './logo.png'; 
import participantsFile from './data/participants.csv'; // Import the CSV file

// --- THEME CONFIGURATION ---
let theme = createTheme({
  palette: {
    primary: {
      main: '#F57C00', // Orange
      light: 'rgba(245, 124, 0, 0.1)',
    },
    secondary: {
      main: '#B31B1B', // Red
    },
    text: {
      primary: '#2c3e50',
      secondary: '#34495e',
    },
    background: {
      default: '#f8f9fa',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'sans-serif',
    h1: {
      fontWeight: 700,
      color: '#B31B1B',
      textAlign: 'center',
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      color: '#B31B1B',
      textAlign: 'center',
      marginBottom: '1rem',
      fontSize: '1.8rem',
    },
    body1: {
      fontSize: '1rem',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        }
      }
    }
  }
});
theme = responsiveFontSizes(theme);

const containerStyles = {
  padding: { xs: 2, sm: 3, md: 4 },
  margin: { xs: '1rem auto', md: '2rem auto' },
  borderRadius: '15px',
  backgroundColor: 'background.paper',
  border: '1px solid #e9ecef',
  maxWidth: { xs: '100%', sm: '700px', md: '900px' },
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
};

// --- DATA ---
const sections = [
  {
    id: 'openness',
    title: 'Openness', 
    questions: [
      { id: 1, text: "I enjoy talking to customers about their lifestyle, not just the product." },
      { id: 2, text: "I am comfortable when a sales conversation does not go exactly as planned." },
      { id: 3, text: "I like learning about customers who think or live differently from me." },
      { id: 4, text: "I can change my approach easily when a customer changes their mind." },
      { id: 5, text: "I am interested in understanding what matters to customers beyond price and features." },
      { id: 6, text: "I see new selling challenges as exciting rather than stressful." },
    ]
  },
  {
    id: 'conscientiousness',
    title: 'Conscientiousness',
    questions: [
      { id: 7, text: "I follow up with customers even if the deal is not closing right away." },
      { id: 8, text: "I prepare well before meeting senior or important customers." },
      { id: 9, text: "I keep my promises to customers and usually meet my commitments." },
      { id: 10, text: "I pay attention to details, especially when the situation is important." },
      { id: 11, text: "I plan my work instead of leaving things to the last minute." },
      { id: 12, text: "Customers would see me as organized and dependable." },
    ]
  },
  {
    id: 'extraversion',
    title: 'Extraversion',
    questions: [
      { id: 13, text: "I am comfortable starting conversations with new or senior customers." },
      { id: 14, text: "I usually guide the direction of a sales conversation." },
      { id: 15, text: "I feel confident sharing my views, even with influential customers." },
      { id: 16, text: "I get energy from meeting and talking with people." },
      { id: 17, text: "I am comfortable staying quiet when a customer wants space." },
      { id: 18, text: "I can stay confident without taking over the conversation." },
    ]
  },
  {
    id: 'agreeableness',
    title: 'Agreeableness',
    questions: [
      { id: 19, text: "I try to fully understand a customer’s concerns before responding." },
      { id: 20, text: "I stay respectful even when a customer disagrees with me." },
      { id: 21, text: "I can disagree with a customer while keeping the relationship positive." },
      { id: 22, text: "I avoid pushing customers to decide before they are ready." },
      { id: 23, text: "I notice body language and tone and adjust how I respond." },
      { id: 24, text: "Customers feel at ease sharing their expectations with me." },
    ]
  },
  {
    id: 'emotional_stability',
    title: 'Emotional Stability',
    questions: [
      { id: 25, text: "I stay calm when customers strongly question price or value." },
      { id: 26, text: "I do not take it personally when customers are silent or hesitant." },
      { id: 27, text: "I bounce back quickly after losing a sale." },
      { id: 28, text: "I remain composed with very confident or status-focused customers." },
      { id: 29, text: "I do not feel stressed when customers delay their decision." },
      { id: 30, text: "I do not judge my personal worth based on whether I close a sale." },
    ]
  }
];

const cities = ["Karachi", "Lahore", "Islamabad", "Multan"];

// --- LABELS MAPPING ---
const optionLabels = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree"
};

function App() {
  const [step, setStep] = useState('welcome');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: '',
    cnic: '',
    city: '',
    dealership: ''
  });
  const [responses, setResponses] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State to hold CSV data
  const [participants, setParticipants] = useState([]);

  // --- LOAD CSV DATA ON MOUNT ---
  useEffect(() => {
    Papa.parse(participantsFile, {
      download: true,
      header: true,
      complete: (results) => {
        // Clean up data (trim spaces from keys/values if necessary)
        const cleanData = results.data.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            newRow[key.trim()] = row[key] ? row[key].trim() : '';
          });
          return newRow;
        });
        setParticipants(cleanData);
        console.log("Participants Loaded:", cleanData.length);
      },
      error: (err) => {
        console.error("Error loading CSV:", err);
      }
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, currentSectionIndex]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cnic') {
      let cleanVal = value.replace(/\D/g, '');
      if (cleanVal.length > 13) cleanVal = cleanVal.slice(0, 13);
      let formattedVal = cleanVal;
      if (cleanVal.length > 5) formattedVal = `${cleanVal.slice(0, 5)}-${cleanVal.slice(5)}`;
      if (cleanVal.length > 12) formattedVal = `${formattedVal.slice(0, 13)}-${formattedVal.slice(13)}`;
      setUserInfo({ ...userInfo, cnic: formattedVal });
      // Clear error when typing
      if(error) setError('');
    } else {
      setUserInfo({ ...userInfo, [name]: value });
    }
  };

  const handleStart = () => {
    // 1. Basic Format Validation
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(userInfo.cnic)) {
      setError('Invalid CNIC format. Use xxxxx-xxxxxxx-x');
      return;
    }

    // 2. Check against CSV Records
    const foundParticipant = participants.find(p => p.cnic === userInfo.cnic);

    if (!foundParticipant) {
      setError('Your CNIC number does not match our records. Access denied.');
      return;
    }

    // 3. Auto-fill data from CSV (Optional but recommended for consistency)
    // Mapping CSV headers to our state: name -> name, region -> city, dealership -> dealership
    setUserInfo(prev => ({
      ...prev,
      name: foundParticipant.name || prev.name,
      city: foundParticipant.region || prev.city, // CSV uses 'region' for city
      dealership: foundParticipant.dealership || prev.dealership
    }));

    // 4. Proceed
    setError('');
    setStep('assessment');
  };

  const handleResponseChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: parseInt(value) }));
  };

  const validateCurrentSection = () => {
    const currentQuestions = sections[currentSectionIndex].questions;
    return currentQuestions.every(q => responses.hasOwnProperty(q.id));
  };

  const handleNextSection = () => {
    if (validateCurrentSection()) {
      setError('');
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
      }
    } else {
      setError('Please answer all questions in this section to continue.');
    }
  };

  const handlePreviousSection = () => {
    setError('');
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const calculateScores = () => {
    const scores = {};
    let totalScore = 0;
    sections.forEach(section => {
      let sectionSum = 0;
      section.questions.forEach(q => {
        sectionSum += (responses[q.id] || 0);
      });
      scores[section.id] = (sectionSum / 6).toFixed(1);
      totalScore += sectionSum;
    });
    return { scores, totalScore };
  };

  const handleSubmit = async () => {
    if (!validateCurrentSection()) {
      setError('Please answer all questions in this section to continue.');
      return;
    }
    setIsSubmitting(true);
    
    // We don't need to calculate scores here anymore, the backend does it.
    // But we send the raw responses.
    
    const payload = {
      user: userInfo,
      responses: responses
    };

    try {
      // SEND DATA TO BACKEND
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Data saved to Google Sheets");
        setStep('results'); // Show Thank You screen
      } else {
        console.error("Failed to save data");
        setError("Connection error. Please try again.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please ensure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDERERS ---

  const renderWelcome = () => (
    <Paper elevation={3} sx={containerStyles}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box component="img" src={logo} alt="Logo" sx={{ maxWidth: { xs: '100px', sm: '120px' }, height: 'auto' }} />
        <Typography variant="h1">Big Five Personality Assessment</Typography>
      </Box>
      <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal', px: { xs: 1, sm: 2 }, borderBottom: 'none' }}>
        This framework describes how you naturally think, react, and behave. It evaluates five broad dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Stability.
      </Typography>
      
      <Box sx={{ maxWidth: { xs: '100%', sm: 500 }, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2, px: { xs: 1, sm: 0 } }}>
        
        {/* CNIC Field First - Since it drives the validation */}
        <TextField 
          fullWidth 
          label="CNIC (xxxxx-xxxxxxx-x)" 
          name="cnic" 
          variant="outlined" 
          value={userInfo.cnic} 
          onChange={handleInputChange} 
          inputProps={{ maxLength: 15 }} 
          helperText="Enter your CNIC to verify registration."
        />

        {/* Other fields are read-only or editable based on preference. 
            Here I leave them editable but they will auto-fill on Start */}
        <TextField fullWidth label="Your Name" name="name" variant="outlined" value={userInfo.name} onChange={handleInputChange} />
        
        <TextField select fullWidth label="Development Center City" name="city" value={userInfo.city} onChange={handleInputChange}>
          {cities.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
        </TextField>
        
        <TextField fullWidth label="Dealership Name" name="dealership" variant="outlined" value={userInfo.dealership} onChange={handleInputChange} />
        
        {error && <Alert severity="error">{error}</Alert>}
        
        <Button variant="contained" size="large" color="primary" onClick={handleStart} startIcon={<RocketLaunchIcon />} sx={{ mt: 2, py: 1.5, width: { xs: '100%', sm: 'auto' }, alignSelf: 'center' }}>
          Start Assessment
        </Button>
      </Box>
    </Paper>
  );

  const renderAssessment = () => {
    const answeredQuestions = Object.keys(responses).length;
    const totalQuestions = 30;
    const progress = (answeredQuestions / totalQuestions) * 100;
    const currentSection = sections[currentSectionIndex];

    return (
      <Paper sx={containerStyles}>
        <Box sx={{ mb: 3, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 10, pt: 2, px: { xs: 1, sm: 2 }, borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h2" sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            Page {currentSectionIndex + 1} of {sections.length}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
            {answeredQuestions} of {totalQuestions} questions answered
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: '8px', borderRadius: '4px', mb: 2 }} />
        </Box>

        <Box>
          {currentSection.questions.map((q) => (
            <FormControl key={q.id} component="fieldset" fullWidth sx={{ mb: 4, borderTop: '1px solid #eee', pt: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary', fontSize: '1.1rem', lineHeight: 1.4 }}>
                {q.id}. {q.text}
              </FormLabel>
              
              <RadioGroup 
                value={responses[q.id] || ''} 
                onChange={(e) => handleResponseChange(q.id, e.target.value)} 
                sx={{ gap: 1.5 }} 
              >
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = responses[q.id] === val;
                  return (
                    <FormControlLabel 
                      key={val} 
                      value={val} 
                      control={<Radio sx={{ display: 'none' }} />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: '50%', 
                              bgcolor: isSelected ? 'primary.main' : '#e0e0e0',
                              color: isSelected ? 'white' : 'text.secondary',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              mr: 2,
                              flexShrink: 0
                            }}
                          >
                            {val}
                          </Box>
                          <Typography 
                            sx={{ 
                              fontWeight: isSelected ? 'bold' : 'normal',
                              color: isSelected ? 'primary.dark' : 'text.primary',
                              fontSize: '1rem'
                            }}
                          >
                            {optionLabels[val]}
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        m: 0, 
                        p: 1.5,
                        width: '100%',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : '#e0e0e0',
                        backgroundColor: isSelected ? 'primary.light' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(245, 124, 0, 0.04)'
                        }
                      }}
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
          ))}
        </Box>

        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column-reverse', gap: 1.5, mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
          {currentSectionIndex < sections.length - 1 ? (
            <Button variant="contained" fullWidth size="large" onClick={handleNextSection} endIcon={<ArrowForwardIcon />}>
              Next Page
            </Button>
          ) : (
            <Button variant="contained" fullWidth size="large" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
          {currentSectionIndex > 0 && (
            <Button variant="outlined" fullWidth onClick={handlePreviousSection} startIcon={<ArrowBackIcon />}>
              Previous
            </Button>
          )}
        </Box>
      </Paper>
    );
  };

  const renderResults = () => {
    return (
      <Paper sx={containerStyles}>
        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
          <Box component="img" src={logo} alt="Logo" sx={{ height: 80, mb: 4 }} />
          
          <Typography variant="h1" sx={{ mb: 2, color: 'primary.main', fontSize: { xs: '2rem', md: '3rem' } }}>
            Thank You!
          </Typography>
          
          <Typography variant="h5" sx={{ mb: 2, border: 'none', color: 'text.primary', fontWeight: 'normal' }}>
            Your response has been recorded.
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We appreciate your time in completing the Big Five Personality Assessment.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
             <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" sx={{ mt: { xs: 2, sm: 3, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        {step === 'welcome' && renderWelcome()}
        {step === 'assessment' && renderAssessment()}
        {step === 'results' && renderResults()}
      </Container>
    </ThemeProvider>
  );
}

export default App; 