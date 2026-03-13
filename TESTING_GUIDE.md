# Testing Guide - "Function solve() is not defined" Fix

## Quick Test Steps

### 1. Access the Application
1. Open browser and go to: **http://localhost:5173/**
2. Login with:
   - Email: `subhankar@gmail.com`
   - Password: `Subh@8617`

### 2. Navigate to a Problem
1. Click on **"Searching"** category
2. Click on **"Binary Search"** problem
3. You should see the code editor panel

### 3. Test with Custom Function Name

#### Test Case 1: JavaScript with Custom Name
Replace the starter code with:

```javascript
function myBinarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    }
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}
```

**Click "Run Code"**

**Expected Output**:
```
> Executing Binary Search [JAVASCRIPT]...
> Function detected: myBinarySearch()
> Running test cases...
> 
> Test 1: ✓ PASS
>   Input: [[1,3,5,7,9,11,13,15],7]
>   Expected: 3
>   Your Output: 3
>   Runtime: ~15ms
> 
> ═══════════════════════════════════════
> Test Results: 1/1 Passed
> Status: ✓ ALL TESTS PASSED!
> ═══════════════════════════════════════
```

✅ **Success Criteria**: 
- No "solve() is not defined" error
- Function name "myBinarySearch" detected
- Test passes
- Results display correctly

---

#### Test Case 2: Arrow Function
Replace with:

```javascript
const search = (arr, target) => {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
};
```

**Click "Run Code"**

**Expected**: Function name "search" detected, tests pass

---

#### Test Case 3: Intentional Bug (to test failure display)
Replace with:

```javascript
function buggySearch(arr, target) {
  // Intentionally wrong - always returns 0
  return 0;
}
```

**Click "Run Code"**

**Expected Output**:
```
> Test 1: ✗ FAIL
>   Input: [[1,3,5,7,9,11,13,15],7]
>   Expected: 3
>   Your Output: 0
>   Runtime: ~10ms
> 
> Status: ✗ Some tests failed
```

✅ **Success Criteria**: 
- Test fails correctly
- Shows expected vs actual output
- Clear failure indication

---

#### Test Case 4: Python Code
Change language to **Python** and use:

```python
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

**Click "Run Code"**

**Expected**: Function name "binary_search" detected, tests pass

---

#### Test Case 5: No Function Defined
Replace with:

```javascript
// Just a comment, no function
let x = 5;
```

**Click "Run Code"**

**Expected Output**:
```
> Error: No function definition found. Please define a function.
```

✅ **Success Criteria**: Clear error message when no function found

---

### 4. Test Different Problems

#### Linear Search
1. Go back and select **"Linear Search"**
2. Write code with function name `linearSearch` or any other name
3. Verify it works

#### Bubble Sort
1. Select **"Bubble Sort"** from sorting category
2. Write code with function name `bubbleSort` or any other name
3. Verify it works

---

## What to Look For

### ✅ Success Indicators
- [ ] No "Function solve() is not defined" error
- [ ] Function name correctly detected and displayed
- [ ] Test cases execute automatically
- [ ] Pass/fail status shown with ✓ or ✗
- [ ] Input, Expected, and Actual output displayed
- [ ] Runtime shown in milliseconds
- [ ] Summary shows X/Y tests passed
- [ ] Submission saved when all tests pass

### ❌ Failure Indicators
- [ ] "solve() is not defined" error appears
- [ ] Function name not detected
- [ ] Test results don't display
- [ ] Console shows raw error messages
- [ ] No runtime information

---

## Browser Console Check

Open browser DevTools (F12) and check Console tab:

**Good Signs**:
- API call to `http://localhost:5000/api/runner/run`
- Response with status 200
- JSON response with results array

**Bad Signs**:
- 404 errors
- CORS errors
- Network errors
- 500 server errors

---

## Backend Verification

Check backend terminal output for:

```
POST /api/runner/run 200 - response time
```

If you see errors, check:
1. Is MySQL running?
2. Is backend on port 5000?
3. Are environment variables set correctly?

---

## Common Issues & Solutions

### Issue: "Cannot read property 'slug' of undefined"
**Solution**: Problem data not loaded. Check database connection.

### Issue: "Network Error"
**Solution**: Backend not running. Start with `npm start` in backend folder.

### Issue: "Unauthorized"
**Solution**: Token expired. Logout and login again.

### Issue: Tests don't run
**Solution**: Check if `input_json` exists in database for that problem.

---

## Performance Benchmarks

Expected execution times:
- Simple algorithms (Binary Search): 10-20ms per test
- Complex algorithms (Merge Sort): 20-50ms per test
- Timeout limit: 5000ms (5 seconds)

---

## Test Completion Checklist

After testing, verify:

- [x] Backend running on port 5000
- [x] Frontend running on port 5173
- [x] MySQL connected
- [x] Can login successfully
- [x] Can navigate to problems
- [x] Code editor loads
- [x] Can write code with any function name
- [x] Run button works
- [x] Test results display correctly
- [x] Pass/fail status clear
- [x] Runtime information shown
- [x] Errors handled gracefully
- [x] Submission saves when all pass

---

## Next Test: Full User Flow

1. **Register** a new user
2. **Login** with new credentials
3. **Browse** categories
4. **Select** a problem
5. **Write** solution code
6. **Run** tests multiple times
7. **Submit** when all pass
8. **Check** leaderboard for submission
9. **View** profile for stats

---

## Automated Testing (Future)

Consider adding:
- Unit tests for function extractor
- Integration tests for API endpoints
- E2E tests for user flows
- Performance tests for code execution

---

**Ready to Test!** 🚀

Open http://localhost:5173/ and start testing with different function names!
