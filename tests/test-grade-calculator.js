// test-grade-calculator.js

// Assuming getGrade, applyHomeworkBoost, optimizeBoosts are available

function runAllTests() {
    console.log(' Running Base Grade Calculation Tests...');
    runBaseGradeTests();
    
    console.log('\n Running Homework Boost Tests...');
    runHomeworkBoostTests();
    
    console.log('\n Running Recitation Boost Tests...');
    runRecitationBoostTests();
    
    console.log('\n Running Combined Boost Tests...');
    runCombinedBoostTests();
}

function runBaseGradeTests() {
    const tests = [
        { description: "Perfect A+", IP: {P:3,G:0,N:0,L:0}, MP: {P:12,G:0,N:0,L:0}, expected: "A+" },
        { description: "Solid A", IP: {P:2,G:1,N:0,L:0}, MP: {P:10,G:2,N:0,L:0}, expected: "A" },
        { description: "Solid A-", IP: {P:1,G:2,N:0,L:0}, MP: {P:9,G:3,N:0,L:0}, expected: "A-" },
        { description: "Solid B+", IP: {P:0,G:2,N:1,L:0}, MP: {P:8,G:4,N:0,L:0}, expected: "B+" },
        { description: "Solid B", IP: {P:0,G:1,N:2,L:0}, MP: {P:7,G:5,N:0,L:0}, expected: "B" },
        { description: "Solid B-", IP: {P:0,G:0,N:2,L:1}, MP: {P:6,G:6,N:0,L:0}, expected: "B-" },
        { description: "Solid C+", IP: {P:0,G:0,N:0,L:3}, MP: {P:5,G:7,N:0,L:0}, expected: "C+" },
        { description: "Solid C", IP: {P:0,G:0,N:0,L:3}, MP: {P:4,G:6,N:2,L:0}, expected: "C" },
        { description: "Solid C-", IP: {P:0,G:0,N:0,L:3}, MP: {P:3,G:6,N:3,L:0}, expected: "C-" },
        { description: "Solid D", IP: {P:0,G:0,N:0,L:3}, MP: {P:2,G:5,N:5,L:0}, expected: "D" },
        { description: "Solid F", IP: {P:0,G:0,N:0,L:3}, MP: {P:1,G:2,N:3,L:6}, expected: "F" },
        { description: "Barely miss B-", IP: {P:0,G:0,N:1,L:2}, MP: {P:6,G:6,N:0,L:0}, expected: "C+" },
        { description: "Perfect IPs but bad MPs (C)", IP: {P:3,G:0,N:0,L:0}, MP: {P:4,G:6,N:2,L:0}, expected: "C" },
        { description: "Almost perfect A-", IP: {P:1,G:2,N:0,L:0}, MP: {P:9,G:3,N:0,L:0}, expected: "A-" },
        { description: "Edge case: Exactly B-", IP: {P:0,G:0,N:2,L:1}, MP: {P:6,G:2,N:4,L:0}, expected: "B-" },
        { description: "Edge case: Just missing A-", IP: {P:1,G:1,N:1,L:0}, MP: {P:9,G:2,N:1,L:0}, expected: "B+" }
    ];
    
    runTestSuite(tests, (test) => getGrade(test.IP, test.MP));
}

function runHomeworkBoostTests() {
    const tests = [
        { description: "HW 92% replaces N in MP", IP: {P:0,G:0,N:3,L:0}, MP: {P:5,G:6,N:1,L:0}, hwScore: 92, expected: "B-" },
        { description: "HW 92% boosts MP G→P", IP: {P:0,G:2,N:1,L:0}, MP: {P:7,G:5,N:0,L:0}, hwScore: 92, expected: "B+" },
        { description: "HW 92% can't boost both", IP: {P:0,G:1,N:2,L:0}, MP: {P:7,G:5,N:0,L:0}, hwScore: 92, expected: "B" },
        { description: "HW 85% replaces N in MP", IP: {P:0,G:2,N:1,L:0}, MP: {P:7,G:5,N:0,L:0}, hwScore: 85, expected: "B" },
        { description: "HW 72% boost not very helpful", IP: {P:0,G:2,N:1,L:0}, MP: {P:7,G:5,N:0,L:0}, hwScore: 72, expected: "B" },
        { description: "HW 45% provides no boost", IP: {P:0,G:1,N:2,L:0}, MP: {P:4,G:6,N:2,L:0}, hwScore: 45, expected: "C" },
        { description: "HW 92% boost IP but not enough", IP: {P:0,G:2,N:1,L:0}, MP: {P:9,G:3,N:0,L:0}, hwScore: 92, expected: "B+" },
        { description: "HW 92% boosts IP to 1P, >=3G", IP: {P:0,G:3,N:0,L:0}, MP: {P:9,G:3,N:0,L:0}, hwScore: 92, expected: "A-" }
    ];
    
    runTestSuite(tests, (test) => {
        const result = applyHomeworkBoost(test.MP, test.IP, test.hwScore);
        return getGrade(result.boostedIP, result.boostedMP);
    });
}

function runRecitationBoostTests() {
    const tests = [
        { description: "2 recitation boosts IP G→P", IP: {P:0,G:3,N:0,L:0}, MP: {P:9,G:2,N:1,L:0}, boosts: 2, expected: "A-" },
        { description: "1 boost MP N→G", IP: {P:0,G:1,N:2,L:0}, MP: {P:4,G:6,N:2,L:0}, boosts: 1, expected: "C+" },
        { description: "Boosts optimized perfectly to save an F", IP: {P:0,G:0,N:0,L:3}, MP: {P:2,G:2,N:2,L:6}, boosts: 2, expected: "D" },
        { description: "Boosts can't save failing grade (too many L's)", IP: {P:0,G:0,N:0,L:3}, MP: {P:2,G:1,N:2,L:6}, boosts: 2, expected: "F" }
    ];
    
    runTestSuite(tests, (test) => {
        const result = optimizeBoosts(test.IP, test.MP, test.boosts);
        return result.finalGrade;
    });
}

function runCombinedBoostTests() {
    const tests = [
        { description: "HW 92% + 2 recitation boosts optimize best", IP: {P:0,G:2,N:1,L:0}, MP: {P:5,G:5,N:2,L:0}, hwScore: 92, recitationBoosts: 2, expected: "B+" },
        { description: "HW 85% + 1 recitation boost", IP: {P:0,G:1,N:2,L:0}, MP: {P:4,G:6,N:2,L:0}, hwScore: 85, recitationBoosts: 1, expected: "C+" },
        { description: "HW LOST 45% + boosts only help", IP: {P:0,G:1,N:2,L:0}, MP: {P:4,G:6,N:2,L:0}, hwScore: 45, recitationBoosts: 1, expected: "C+" },
        { description: "HW 92% + no boost needed", IP: {P:3,G:0,N:0,L:0}, MP: {P:12,G:0,N:0,L:0}, hwScore: 92, recitationBoosts: 0, expected: "A+" }
    ];
    
    runTestSuite(tests, (test) => {
        // Apply Homework boost first
        let result = applyHomeworkBoost(test.MP, test.IP, test.hwScore);

        // Then Recitation Boosts if any
        if (test.recitationBoosts > 0) {
            result = optimizeBoosts(result.boostedIP, result.boostedMP, test.recitationBoosts);
        }
        
        return getGrade(result.boostedIP, result.boostedMP);
    });
}

function runTestSuite(tests, testFn) {
    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = testFn(test);
        if (result === test.expected) {
            console.log(`✅ PASS: ${test.description}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${test.description}\nExpected: ${test.expected}, Got: ${result}`);
            failed++;
        }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

// Run all tests when the script loads
runAllTests();