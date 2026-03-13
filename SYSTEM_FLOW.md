# System Flow Diagram

## Complete Code Execution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 1. User writes code
                                  │    function mySearch(arr, target) { ... }
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (AlgoDashboard.jsx)                      │
│                      http://localhost:5173                           │
├─────────────────────────────────────────────────────────────────────┤
│  runCode() function:                                                 │
│  • Collects: code, language, problemSlug                            │
│  • Adds JWT token from localStorage                                 │
│  • Sends POST request to backend                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 2. POST /api/runner/run
                                  │    { code, language, problemSlug }
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express Server)                          │
│                      http://localhost:5000                           │
├─────────────────────────────────────────────────────────────────────┤
│  Route: /api/runner/run                                             │
│  • Validates JWT token (authMiddleware)                             │
│  • Routes to codeRunnerController                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 3. Validate & fetch problem
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CODE RUNNER CONTROLLER                                  │
│         (codeRunnerController.js)                                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. Validate request (code, language, problemSlug)                  │
│  2. Query database for problem                                      │
│  3. Parse test cases from problem.input_json                        │
│  4. Call testRunner.runTestCases()                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 4. Execute tests
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TEST RUNNER SERVICE                               │
│                   (testRunner.js)                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Step 1: Extract function name                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION EXTRACTOR (functionExtractor.js)                 │    │
│  │  • Analyzes code with regex patterns                       │    │
│  │  • Detects: function name, const name, def name            │    │
│  │  • Returns: "mySearch"                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Step 2: For each test case                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Test Case 1: { input: [[1,3,5],3], expected: 1 }         │    │
│  │                                                             │    │
│  │  a) Wrap code:                                             │    │
│  │     function mySearch(arr, target) { ... }                 │    │
│  │     const result = mySearch([1,3,5], 3);                   │    │
│  │     console.log(JSON.stringify(result));                   │    │
│  │                                                             │    │
│  │  b) Write to temp file:                                    │    │
│  │     backend/temp/abc123def456.js                           │    │
│  │                                                             │    │
│  │  c) Execute in sandbox:                                    │    │
│  │     exec('node abc123def456.js')                           │    │
│  │     Timeout: 5000ms                                        │    │
│  │     MaxBuffer: 1MB                                         │    │
│  │                                                             │    │
│  │  d) Capture output:                                        │    │
│  │     stdout: "1"                                            │    │
│  │                                                             │    │
│  │  e) Compare:                                               │    │
│  │     actual: 1                                              │    │
│  │     expected: 1                                            │    │
│  │     passed: true ✓                                         │    │
│  │                                                             │    │
│  │  f) Measure runtime: 15ms                                  │    │
│  │                                                             │    │
│  │  g) Cleanup: delete temp file                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Step 3: Aggregate results                                          │
│  • Total tests: 3                                                   │
│  • Passed: 3                                                        │
│  • All passed: true                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 5. Return results
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSE TO FRONTEND                              │
├─────────────────────────────────────────────────────────────────────┤
│  {                                                                   │
│    status: "success",                                               │
│    functionName: "mySearch",                                        │
│    results: [                                                       │
│      {                                                              │
│        testNumber: 1,                                               │
│        input: [[1,3,5], 3],                                         │
│        expected: 1,                                                 │
│        actual: 1,                                                   │
│        passed: true,                                                │
│        runtime_ms: 15,                                              │
│        error: null                                                  │
│      },                                                             │
│      { ... test 2 ... },                                            │
│      { ... test 3 ... }                                             │
│    ],                                                               │
│    totalTests: 3,                                                   │
│    passedTests: 3,                                                  │
│    allPassed: true                                                  │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ 6. Display results
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Console Output:                                                     │
│                                                                      │
│  > Executing Binary Search [JAVASCRIPT]...                          │
│  > Function detected: mySearch()                                    │
│  > Running 3 test cases...                                          │
│  >                                                                   │
│  > Test 1: ✓ PASS                                                   │
│  >   Input: [[1,3,5],3]                                             │
│  >   Expected: 1                                                    │
│  >   Your Output: 1                                                 │
│  >   Runtime: 15ms                                                  │
│  >                                                                   │
│  > Test 2: ✓ PASS                                                   │
│  >   Input: [[1,3,5],1]                                             │
│  >   Expected: 0                                                    │
│  >   Your Output: 0                                                 │
│  >   Runtime: 12ms                                                  │
│  >                                                                   │
│  > Test 3: ✓ PASS                                                   │
│  >   Input: [[1,3,5],7]                                             │
│  >   Expected: -1                                                   │
│  >   Your Output: -1                                                │
│  >   Runtime: 10ms                                                  │
│  >                                                                   │
│  > ═══════════════════════════════════════                          │
│  > Test Results: 3/3 Passed                                         │
│  > Status: ✓ ALL TESTS PASSED!                                      │
│  > ═══════════════════════════════════════                          │
│                                                                      │
│  If all passed → saveSubmission() called automatically              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                                   │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: No Function Found
─────────────────────────────
User code: let x = 5;  // No function

Function Extractor → Returns: null
Test Runner → Returns: { status: 'error', message: 'No function definition found' }
Frontend → Displays: "> Error: No function definition found. Please define a function."


Scenario 2: Runtime Error
─────────────────────────────
User code: function test() { throw new Error('oops'); }

Test Runner → Catches error in try-catch
Result → { passed: false, error: 'oops', actual: null }
Frontend → Displays: ">   Error: oops"


Scenario 3: Wrong Output
─────────────────────────────
User code: function test() { return 0; }  // Always returns 0
Expected: 1

Test Runner → Compares: actual (0) !== expected (1)
Result → { passed: false, actual: 0, expected: 1 }
Frontend → Displays: 
  "> Test 1: ✗ FAIL"
  ">   Expected: 1"
  ">   Your Output: 0"


Scenario 4: Timeout
─────────────────────────────
User code: function test() { while(true) {} }  // Infinite loop

Test Runner → exec() with timeout: 5000ms
After 5s → Process killed
Result → { error: 'Time limit exceeded', passed: false }
Frontend → Displays: ">   Error: Time limit exceeded"


Scenario 5: Syntax Error
─────────────────────────────
User code: function test( { return 0; }  // Missing )

Test Runner → exec() returns stderr
Result → { error: 'SyntaxError: Unexpected token', passed: false }
Frontend → Displays: ">   Error: SyntaxError: Unexpected token"
```

---

## Database Schema Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    QUESTIONS TABLE                                   │
├─────────────────────────────────────────────────────────────────────┤
│  id: 1                                                              │
│  slug: "binary-search"                                              │
│  title: "Binary Search"                                             │
│  category: "searching"                                              │
│  difficulty: "Easy"                                                 │
│  description: "Binary Search is an efficient..."                    │
│  constraints: "Array must be sorted..."                             │
│  algorithm_steps: "1. Set left = 0..."                              │
│  starter_code: "function binarySearch(arr, target) { ... }"         │
│  solution_code: "function binarySearch(arr, target) { ... }"        │
│  input_json: {                                                      │
│    "array": [1, 3, 5, 7, 9, 11, 13, 15],                           │
│    "target": 7,                                                     │
│    "expected": 3                                                    │
│  }                                                                  │
│  frames_json: [ ... visualization frames ... ]                      │
│  youtube_link: "https://youtube.com/..."                            │
│  is_active: 1                                                       │
│  created_by: 1                                                      │
│  created_at: 2024-03-14 10:00:00                                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Fetched by problemSlug
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PARSED TEST CASES                                 │
├─────────────────────────────────────────────────────────────────────┤
│  [                                                                   │
│    {                                                                │
│      input: [[1,3,5,7,9,11,13,15], 7],                             │
│      expected: 3                                                    │
│    }                                                                │
│  ]                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Used for testing
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TEST EXECUTION                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TEMPORARY FILE LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────────┘

1. Generate Session ID
   ↓
   sessionId = crypto.randomBytes(16).toString('hex')
   // Example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

2. Create Temp File
   ↓
   filename = backend/temp/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.js
   content = wrapped code

3. Execute File
   ↓
   exec('node backend/temp/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.js')

4. Capture Output
   ↓
   stdout: "1"
   stderr: ""

5. Cleanup
   ↓
   fs.unlink(backend/temp/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.js)
   
   File deleted ✓
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Layer 1: Authentication                                            │
│  ├─ JWT token required for all API calls                           │
│  ├─ Token validated by authMiddleware                              │
│  └─ Expired tokens rejected                                        │
│                                                                      │
│  Layer 2: Input Validation                                          │
│  ├─ Code, language, problemSlug required                           │
│  ├─ Problem must exist in database                                 │
│  └─ Test cases must be valid JSON                                  │
│                                                                      │
│  Layer 3: Sandboxed Execution                                       │
│  ├─ Code runs in isolated child process                            │
│  ├─ No access to parent process                                    │
│  ├─ No access to file system (except temp)                         │
│  └─ No network access                                              │
│                                                                      │
│  Layer 4: Resource Limits                                           │
│  ├─ Timeout: 5000ms (5 seconds)                                    │
│  ├─ Memory: 1MB buffer limit                                       │
│  └─ Process killed if exceeded                                     │
│                                                                      │
│  Layer 5: File Cleanup                                              │
│  ├─ Unique session IDs prevent conflicts                           │
│  ├─ Files deleted after execution                                  │
│  └─ Cleanup runs even if execution fails                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Performance Metrics

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TIMING BREAKDOWN                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Frontend → Backend:           ~10-20ms   (network latency)        │
│  Authentication:               ~1-2ms     (JWT validation)         │
│  Database Query:               ~5-10ms    (fetch problem)          │
│  Function Extraction:          <1ms       (regex matching)         │
│  Code Wrapping:                <1ms       (string concatenation)   │
│  File Write:                   ~1-2ms     (write to disk)          │
│  Code Execution:               ~10-50ms   (per test case)          │
│  Output Parsing:               <1ms       (JSON.parse)             │
│  Comparison:                   <1ms       (JSON.stringify)         │
│  File Cleanup:                 ~1-2ms     (delete file)            │
│  Backend → Frontend:           ~10-20ms   (network latency)        │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  TOTAL (3 test cases):         ~80-200ms                            │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

This flow diagram shows the complete journey from user clicking "Run Code" to seeing test results displayed in the console.
