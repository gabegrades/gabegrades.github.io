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

function optimizeAll(IP_dict, MP_dict, hwScore, recitationCount) {
    // Determine how many boosts from recitation
    let recBoosts = 0;
    if (recitationCount >= 10) recBoosts = 2;
    else if (recitationCount >= 8) recBoosts = 1;

    // This BFS/DFS will store states of the form:
    // { IP, MP, hwUsed, boostsLeft }
    // 'hwUsed' = boolean, indicating if we already used the homework boost.

    const initialGrade = getGrade(IP_dict, MP_dict);
    let bestGrade = initialGrade;
    let bestState = {
        IP: { ...IP_dict },
        MP: { ...MP_dict }
    };

    const queue = [];
    // Push both possibilities: used HW or not used HW initially
    // Actually, we start "not used" by default. If HW can be used, we do it as an action inside BFS.
    queue.push({
        IP: { ...IP_dict },
        MP: { ...MP_dict },
        hwUsed: false,
        boostsLeft: recBoosts
    });

    // Function to attempt rec-boost
    function tryRecBoost(IP, MP, from, to, cost) {
        if ((MP[from] || 0) > 0 && cost <= 1) {
            // MP single-level
            const newMP = applySingleBoost(MP, from, to);
            return { newIP: IP, newMP };
        } else if ((IP[from] || 0) > 0 && cost === 2) {
            // IP single-level
            const newIP = applySingleBoost(IP, from, to);
            return { newIP, newMP: MP };
        }
        return null;
    }

    // Function to attempt homework usage
    function tryHomework(IP, MP, score) {
        // If score < 50, no usage
        if (score < 50) return [];

        // Convert HW to a letter
        let hwLetter = 'N';
        if (score >= 90) hwLetter = 'P';
        else if (score >= 75) hwLetter = 'G';
        // else if (score >= 50) hwLetter = 'N';

        const results = [];

        // 1) Try MP replacement
        // We replace the "lowest" non-L grade, but we can check all possibilities to be thorough
        const possibleLevels = ['N','G','P'];
        for (const lv of possibleLevels) {
            if ((MP[lv] || 0) > 0) {
                const newMP = { ...MP };
                newMP[lv]--;
                newMP[hwLetter] = (newMP[hwLetter] || 0) + 1;
                results.push({ IP, MP: newMP });
            }
        }

        // 2) Try IP single-level boost only if hwLetter == 'P'
        if (hwLetter === 'P') {
            const ipUps = [
                { from: 'G', to: 'P' },
                { from: 'N', to: 'G' },
                { from: 'L', to: 'N' }
            ];
            for (const { from, to } of ipUps) {
                if ((IP[from] || 0) > 0) {
                    const newIP = { ...IP };
                    newIP[from]--;
                    newIP[to] = (newIP[to] || 0) + 1;
                    results.push({ IP: newIP, MP });
                }
            }
        }
        return results;
    }

    while (queue.length > 0) {
        const state = queue.shift();
        const { IP, MP, hwUsed, boostsLeft } = state;

        // Update best if needed
        const currentGrade = getGrade(IP, MP);
        if (gradeOrder.indexOf(currentGrade) < gradeOrder.indexOf(bestGrade)) {
            bestGrade = currentGrade;
            bestState = { IP, MP };
        }

        // 1) If HW not used yet, try using it
        if (!hwUsed) {
            const hwOptions = tryHomework(IP, MP, hwScore);
            for (const opt of hwOptions) {
                const newGrade = getGrade(opt.IP, opt.MP);
                // Only enqueue if it might improve or at least could lead to rec-boost combos
                queue.push({
                    IP: opt.IP,
                    MP: opt.MP,
                    hwUsed: true,
                    boostsLeft
                });
            }
        }

        // 2) Try rec-boost usage if we have any left
        if (boostsLeft > 0) {
            // MP single-level costs 1
            const mpUps = [
                { from: 'G', to: 'P', cost: 1 },
                { from: 'N', to: 'G', cost: 1 },
                { from: 'L', to: 'N', cost: 1 }
            ];
            for (const up of mpUps) {
                const result = tryRecBoost(IP, MP, up.from, up.to, up.cost);
                if (result) {
                    queue.push({
                        IP: result.newIP,
                        MP: result.newMP,
                        hwUsed,
                        boostsLeft: boostsLeft - up.cost
                    });
                }
            }

            // IP single-level costs 2
            const ipUps = [
                { from: 'G', to: 'P', cost: 2 },
                { from: 'N', to: 'G', cost: 2 },
                { from: 'L', to: 'N', cost: 2 }
            ];
            for (const up of ipUps) {
                if (boostsLeft >= 2) {
                    const result = tryRecBoost(IP, MP, up.from, up.to, up.cost);
                    if (result) {
                        queue.push({
                            IP: result.newIP,
                            MP: result.newMP,
                            hwUsed,
                            boostsLeft: boostsLeft - up.cost
                        });
                    }
                }
            }
        }
    }

    return {
        finalGrade: bestGrade,
        boostedIP: bestState.IP,
        boostedMP: bestState.MP
    };
}

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

    // Add these to your existing variable declarations
    const rubricBtn = document.getElementById('rubric-btn');
    const rubricModal = document.getElementById('rubric-modal');
    const closeRubricBtn = document.getElementById('close-rubric');

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
    
        // Calculate and display base grade
        const baseGrade = getGrade(ipDict, mpDict);
        displayResult(baseGrade);
    
        // Check if we have any boosts at all
        const usingRecitation = recitationBoostCheckbox.checked;
        const usingHomework = homeworkBoostCheckbox.checked;
    
        if (usingRecitation || usingHomework) {
            const hwScore = usingHomework
                ? parseFloat(document.getElementById('homework-score').value) || 0
                : 0;
            const recitations = usingRecitation
                ? parseInt(document.getElementById('recitation-count').value) || 0
                : 0;
            
            // Call the new BFS-based function
            const { finalGrade } = optimizeAll(ipDict, mpDict, hwScore, recitations);
    
            // Show boosted grade
            boostedGradeSection.classList.remove('hidden');
            boostedGradeDisplay.textContent = finalGrade;
        } else {
            // Hide boosted grade if no boosts are used
            boostedGradeSection.classList.add('hidden');
        }
    });

    // Add the rubric toggle functionality
    rubricBtn.addEventListener('click', function() {
        if (rubricModal.classList.contains('hidden')) {
            rubricModal.classList.remove('hidden');
            rubricBtn.textContent = 'Hide Rubric';
        } else {
            rubricModal.classList.add('hidden');
            rubricBtn.textContent = 'Show Rubric';
        }
    });

    closeRubricBtn.addEventListener('click', function() {
        rubricModal.classList.add('hidden');
        rubricBtn.textContent = 'Show Rubric';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === rubricModal) {
            rubricModal.classList.add('hidden');
            rubricBtn.textContent = 'Show Rubric';
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

    // Add touch support for grade type tooltips
    document.querySelectorAll('.grade-type').forEach(type => {
        type.addEventListener('click', function(e) {
            // If this type is already active, just deactivate it
            if (type.classList.contains('active')) {
                type.classList.remove('active');
            } 
            else {
                // Otherwise, remove active from others and activate this one
                document.querySelectorAll('.grade-type').forEach(otherType => {
                    if (otherType !== type) {
                        otherType.classList.remove('active');
                    }
                });
                type.classList.add('active');
            }
            
            // Prevent this click from immediately closing the tooltip
            e.stopPropagation();
        });
    });

    // Close tooltips when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.grade-type').forEach(type => {
            type.classList.remove('active');
        });
    });

});