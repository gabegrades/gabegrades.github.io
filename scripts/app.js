/**
 * Physics I Grade Calculator
 * 
 * This file contains the core logic for calculating Physics I grades based on:
 * - Module Problems (MPs): 12 total problems
 * - Integrated Problems (IPs): 3 total problems
 * - Optional boosts from recitation attendance and homework performance
 * 
 * Grade types:
 * - P: Proficient
 * - G: Getting There
 * - N: Needs Improvement
 * - L/B: Lost/Blank
 * 
 * Boost types:
 * 1. Recitation boosts:
 *    - 8-9 attendances: 1 boost
 *    - 10+ attendances: 2 boosts
 * 2. Homework boost:
 *    - ≥90%: Replace lowest MP with P
 *    - ≥75%: Replace lowest MP with G
 *    - ≥50%: Replace lowest MP with N
 *    - <50%: No replacement
 */

document.addEventListener('DOMContentLoaded', function() {
    const mpGradeInputs = document.querySelectorAll('.mp-grade-count-input');
    const ipGradeInputs = document.querySelectorAll('.ip-grade-count-input');
    const calculateBtn = document.getElementById('calculate-btn');
    const mpWarningElement = document.getElementById('mp-total-warning');
    const ipWarningElement = document.getElementById('ip-total-warning');
    const form = document.getElementById('gpa-form');
    const resultDisplay = document.getElementById('grade-value');

    // Add these to your existing DOMContentLoaded event listener
    const recitationBoostCheckbox = document.getElementById('add-recitation-boosts');
    const homeworkBoostCheckbox = document.getElementById('add-homework-boost');
    const recitationInput = document.getElementById('recitation-input');
    const homeworkInput = document.getElementById('homework-input');
    const boostedGradeDisplay = document.getElementById('boosted-grade-value');
    const boostedGradeSection = document.querySelector('.boosted-grade');

    function validateInputs() {
        let mpTotal = 0;
        let ipTotal = 0;

        mpGradeInputs.forEach(input => {
            mpTotal += input.value === '' ? 0 : parseInt(input.value);
        });

        ipGradeInputs.forEach(input => {
            ipTotal += input.value === '' ? 0 : parseInt(input.value);
        });

        // Validate MP total
        const mpValid = mpTotal === 12;
        mpWarningElement.classList.toggle('hidden', mpValid);

        // Validate IP total
        const ipValid = ipTotal === 3;
        ipWarningElement.classList.toggle('hidden', ipValid);

        // Enable button only when both totals are valid
        calculateBtn.disabled = !(mpValid && ipValid);

        // Log values for debugging
        // console.log('MP Total:', mpTotal, 'IP Total:', ipTotal, 'Button Disabled:', calculateBtn.disabled);
    }

    // Make sure to call validateInputs initially
    validateInputs();

    // Add event listeners to all inputs
    [...mpGradeInputs, ...ipGradeInputs].forEach(input => {
        input.addEventListener('input', validateInputs);
        input.addEventListener('change', validateInputs);
    });

    // Add toggle functionality for boost inputs
    recitationBoostCheckbox.addEventListener('change', function() {
        recitationInput.classList.toggle('hidden', !this.checked);
    });

    homeworkBoostCheckbox.addEventListener('change', function() {
        homeworkInput.classList.toggle('hidden', !this.checked);
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const mpDict = constructDict('mp');
        const ipDict = constructDict('ip');

        // Calculate base grade
        const baseGrade = getGrade(ipDict, mpDict);
        displayResult(baseGrade);

        // Replace the existing boost handling section in the form submit handler
        if (recitationBoostCheckbox.checked || homeworkBoostCheckbox.checked) {
            let boostedMP = { ...mpDict };
            let boostedIP = { ...ipDict };
            let remainingBoosts = 0;

            // Apply homework boost first if enabled
            if (homeworkBoostCheckbox.checked) {
                const homeworkScore = parseInt(document.getElementById('homework-score').value) || 0;
                const hwBoostResult = applyHomeworkBoost(boostedMP, boostedIP, homeworkScore);
                boostedMP = hwBoostResult.boostedMP;
                boostedIP = hwBoostResult.boostedIP;
            }

            // Then apply recitation boosts
            if (recitationBoostCheckbox.checked) {
                const recitations = parseInt(document.getElementById('recitation-count').value) || 0;
                let numBoosts = 0;
                if (recitations >= 10) numBoosts = 2;
                else if (recitations >= 8) numBoosts = 1;

                if (numBoosts > 0) {
                    const boostResult = optimizeBoosts(boostedIP, boostedMP, numBoosts);
                    boostedIP = boostResult.boostedIP;
                    boostedMP = boostResult.boostedMP;
                }
            }

            // Calculate and display boosted grade
            const boostedGrade = getGrade(boostedIP, boostedMP);
            boostedGradeSection.classList.remove('hidden');
            boostedGradeDisplay.textContent = boostedGrade;
        } else {
            boostedGradeSection.classList.add('hidden');
        }
    });

    // Update the constructDict function
    function constructDict(prefix) {
        return {
            'P': parseInt(document.getElementById(`${prefix}-num-p`).value) || 0,
            'G': parseInt(document.getElementById(`${prefix}-num-g`).value) || 0,
            'N': parseInt(document.getElementById(`${prefix}-num-n`).value) || 0,
            'L': parseInt(document.getElementById(`${prefix}-num-l`).value) || 0
        };
    }
    
    function displayResult(grade) {
        resultDisplay.textContent = grade;
    }

    const gradeRequirements = [
        {
            grade: "A+",
            IP: { P: 3 },
            MP: { P: 12 }
        },
        {
            grade: "A",
            IP: { P: 2, G: 3 },
            MP: { P: 10 }
        },
        {
            grade: "A-",
            IP: { P: 1, G: 3 },
            MP: { P: 9, G: 10 }
        },
        {
            grade: "B+",
            IP: { G: 2, N: 3 },
            MP: { P: 8, G: 9 }
        },
        {
            grade: "B",
            IP: { G: 1, N: 2 },
            MP: { P: 7, G: 9 }
        },
        {
            grade: "B-",
            IP: { N: 2 },
            MP: { P: 6, G: 8, N: 9 }
        },
        {
            grade: "C+",
            IP: {},
            MP: { P: 5, G: 7, N: 8 }
        },
        {
            grade: "C",
            IP: {},
            MP: { P: 4, G: 6, N: 8 }
        },
        {
            grade: "C-",
            IP: {},
            MP: { P: 3, G: 6, N: 8 }
        },
        {
            grade: "D",
            IP: {},
            MP: { P: 2, G: 5, N: 7 }
        }
    ];

    const HW_cutoffs = {
        'P': 90,
        'G': 75,
        'N': 50
    };

    // Update getTotal function
    function getTotal(dict, level) {
        // Calculate superseded totals
        const p = dict['P'] || 0;
        const g = dict['G'] || 0;
        const n = dict['N'] || 0;
        const l = dict['L'] || 0; // L represents both L and B grades

        if (level === 'P') return p;
        if (level === 'G') return p + g;
        if (level === 'N') return p + g + n;
        if (level === 'L') return p + g + n + l;

        return 0;
    }
    
    function getGrade(IP_dict, MP_dict) {
        for (const req of gradeRequirements) {
            let ipPass = true;
            let mpPass = true;
    
            // Check Integrated Problems
            for (const [key, val] of Object.entries(req.IP)) {
                if (getTotal(IP_dict, key) < val) {
                    ipPass = false;
                    break;
                }
            }
    
            // Check Module Problems
            for (const [key, val] of Object.entries(req.MP)) {
                if (getTotal(MP_dict, key) < val) {
                    mpPass = false;
                    break;
                }
            }
    
            if (ipPass && mpPass) {
                return req.grade;
            }
        }
    
        return "F"; // If no grades matched
    }

    // Assume gradeRequirements and getTotal, getGrade already defined.

    const gradeOrder = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

    function applySingleBoost(dict, from, to) {
        const newDict = { ...dict };
        if ((newDict[from] || 0) > 0) {
            newDict[from]--;
            newDict[to] = (newDict[to] || 0) + 1;
        }
        return newDict;
    }

    function optimizeBoosts(IP_dict, MP_dict, numBoosts) {
        let bestGrade = getGrade(IP_dict, MP_dict);
        let bestIP = { ...IP_dict };
        let bestMP = { ...MP_dict };

        function dfs(currentIP, currentMP, boostsLeft) {
            const currentGrade = getGrade(currentIP, currentMP);
            if (gradeOrder.indexOf(currentGrade) < gradeOrder.indexOf(bestGrade)) {
                bestGrade = currentGrade;
                bestIP = { ...currentIP };
                bestMP = { ...currentMP };
            }

            if (boostsLeft <= 0) return;

            // Try all possible boosts on MP first (1 boost each)
            const mpBoostOptions = [
                { from: 'G', to: 'P', cost: 1 },
                { from: 'N', to: 'G', cost: 1 },
                { from: 'L', to: 'N', cost: 1 }
            ];
            for (const { from, to, cost } of mpBoostOptions) {
                if ((currentMP[from] || 0) > 0 && boostsLeft >= cost) {
                    const newMP = applySingleBoost(currentMP, from, to);
                    dfs(currentIP, newMP, boostsLeft - cost);
                }
            }

            // Try all possible boosts on IP next (2 boosts each)
            const ipBoostOptions = [
                { from: 'G', to: 'P', cost: 2 },
                { from: 'N', to: 'G', cost: 2 },
                { from: 'L', to: 'N', cost: 2 }
            ];
            for (const { from, to, cost } of ipBoostOptions) {
                if ((currentIP[from] || 0) > 0 && boostsLeft >= cost) {
                    const newIP = applySingleBoost(currentIP, from, to);
                    dfs(newIP, currentMP, boostsLeft - cost);
                }
            }
        }

        dfs(IP_dict, MP_dict, numBoosts);

        return { boostedIP: bestIP, boostedMP: bestMP, finalGrade: bestGrade };
    }

    function applyHomeworkBoost(MP_dict, IP_dict, homeworkScore) {
        // First determine what level the homework score translates to
        let homeworkLevel;
        if (homeworkScore >= HW_cutoffs.P) {
            homeworkLevel = 'P';
        } else if (homeworkScore >= HW_cutoffs.G) {
            homeworkLevel = 'G';
        } else if (homeworkScore >= HW_cutoffs.N) {
            homeworkLevel = 'N';
        } else {
            // If homework score is LOST (< 50%), no boost allowed
            return { boostedMP: { ...MP_dict }, boostedIP: { ...IP_dict }, boostUsed: false };
        }

        let bestGrade = getGrade(IP_dict, MP_dict);
        let bestMP = { ...MP_dict };
        let bestIP = { ...IP_dict };
        let boostUsed = false;

        // Option 1: Try MP replacement (excluding L grades)
        const mpLevels = ['N', 'G', 'P'];
        for (const level of mpLevels) {
            if ((MP_dict[level] || 0) > 0) {
                const trialMP = { ...MP_dict };
                trialMP[level]--;
                trialMP[homeworkLevel] = (trialMP[homeworkLevel] || 0) + 1;
                
                const trialGrade = getGrade(IP_dict, trialMP);
                if (gradeOrder.indexOf(trialGrade) < gradeOrder.indexOf(bestGrade)) {
                    bestGrade = trialGrade;
                    bestMP = trialMP;
                    bestIP = { ...IP_dict };
                    boostUsed = true;
                }
            }
        }

        // Option 2: Try IP single-level boost (Only valid if P)
        const ipBoostOptions = [
            { from: 'G', to: 'P' },
            { from: 'N', to: 'G' }
        ];

        if (homeworkLevel === 'P') {
            for (const { from, to } of ipBoostOptions) {
                if ((IP_dict[from] || 0) > 0) {
                    const trialIP = { ...IP_dict };
                    trialIP[from]--;
                    trialIP[to] = (trialIP[to] || 0) + 1;
                    
                    const trialGrade = getGrade(trialIP, MP_dict);
                    if (gradeOrder.indexOf(trialGrade) < gradeOrder.indexOf(bestGrade)) {
                        bestGrade = trialGrade;
                        bestMP = { ...MP_dict };
                        bestIP = trialIP;
                        boostUsed = true;
                    }
                }
            }
        }

        return {
            boostedMP: bestMP,
            boostedIP: bestIP,
            boostUsed: boostUsed
        };
    }

});