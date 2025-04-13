# Physics I Grade Calculator

This website calculates final grades for Gabe's Physics I course based on Module Problems (MPs) and Integrated Problems (IPs) grades, with optional recitation and homework boosts.

## Features

- Calculate grades based on:
  - 12 Module Problems (MPs)
  - 3 Integrated Problems (IPs)
  - Grade types: P (Proficient), G (Getting There), N (Needs Improvement), L/B (Lost/Blank)
- Optional grade boosts:
  - Recitation attendance boost (1-2 boosts based on attendance)
  - Homework performance boost
- Up-to-date Rubric
- Displays both base grade and boosted grade when applicable

## Project Structure

```
gpa-calculator-website
├── scripts
│   └── app.js              # Grade calculation logic and UI interactions
├── styles
│   └── style.css           # Website styling
├── tests
│   └── test-grade-calculator.js              # Unit tests for Calculator Logic
├── index.html              # Main calculator interface
├── assets            additional assets
├── package.json            # Project configuration
└── README.md               # Documentation
```

## Usage

1. Enter the number of P, G, N, and L/B grades for Module Problems (total must be 12)
2. Enter the number of P, G, N, and L/B grades for Integrated Problems (total must be 3)
3. Optionally enable:
   - Recitation boosts (8+ attendances = 1 boost, 10+ = 2 boosts)
   - Homework boost (based on homework score percentage)
4. Click "Calculate Grade" to see your final grade

## Grade Requirements

Press the "Show Rubric" button to see an explanation for:
- Grade Types
- Grade Cutoffs
- Homework/Recitation Boosts
