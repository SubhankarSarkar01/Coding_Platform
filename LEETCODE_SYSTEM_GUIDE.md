# LeetCode-Style Coding Platform - Complete Guide

## Overview
This is a full-stack LeetCode-style coding platform with automatic problem parsing, test case generation, sandboxed code execution, and submission tracking.

## Features
- ✅ Problem file parsing and auto-generation
- ✅ Automatic test case generation (basic, edge, stress, null, negative)
- ✅ Multi-language support (Python, JavaScript, Java, C, C++)
- ✅ Sandboxed code execution with 5-second timeout
- ✅ Real-time test case results with pass/fail indicators
- ✅ Submit button enabled ONLY when all tests pass
- ✅ Submission tracking with runtime and status
- ✅ Monaco Editor integration
- ✅ Comprehensive database schema

## Setup Instructions

### 1. Initialize Database Schema
```bash
cd Coding_Platform/Model/backend
node init-leetcode-schema.js
```

This creates:
- `problems` table
- `test_cases` table
- `code_submissions` table
- `test_results` table

### 2. Install Dependencies
Already installed: `@monaco-editor/react`, `axios`

### 3. Start Servers
```bash
# Backend
cd Coding_Platform/Model/backend
npm start

# Frontend
cd Coding_Platform/Model
npm run dev
```

## API Endpoints

### Upload Problem
```
POST /api/leetcode/problems/upload
Authorization: Bearer <token>

Body:
{
  "problemText": "# Two Sum\n\nDescription: Find two numbers..."
}
```

### Get Problem
```
GET /api/leetcode/problems/:slug
```

### Run Code
```
POST /api/leetcode/run
Authorization: Bearer <token>

Body:
{
  "code": "function solution(input) { ... }",
  "language": "javascript",
  "problemId": 1
}

Response:
{
  "allPassed": true,
  "passed": 5,
  "total": 5,
  "totalRuntime": 245,
  "results": [...],
  "canSubmit": true
}
```

### Submit Code
```
POST /api/leetcode/submit
Authorization: Bearer <token>

Body:
{
  "code": "...",
  "language": "javascript",
  "problemId": 1,
  "testResults": [...]
}
```

## Problem File Format

Example problem file:
```
# Two Sum

Description:
Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.

Input Format:
First line: array of integers
Second line: target integer

Output Format:
Two space-separated integers representing the indices

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- Only one valid answer exists

Example 1:
Input: [2,7,11,15]
9
Output: 0 1

Example 2:
Input: [3,2,4]
6
Output: 1 2
```

## Test Case Generation

The system automatically generates 5+ test cases:
1. **Basic** - From problem examples
2. **Edge** - Boundary conditions (empty, single element)
3. **Stress** - Large inputs
4. **Null** - Null/empty inputs
5. **Negative** - Negative numbers or invalid inputs

## Code Execution Rules

- **Timeout**: 5 seconds per test case
- **Sandbox**: No file system or network access
- **Languages**:
  - Python: `python3`
  - JavaScript: `node`
  - Java: `javac` + `java`
  - C: `gcc`
  - C++: `g++`

## Submission Logic

Submit button is **DISABLED** until:
1. Code has been run
2. ALL test cases PASS (✅)

On submit:
- Status: `accepted | wrong_answer | time_limit_exceeded | compile_error | runtime_error`
- Stores: code, language, runtime, test results
- Returns: submission receipt with score and timestamp

## UI Components

### LeetCodeProblem Component
- Split view: Problem description | Code editor
- Tabs: Description, Test Cases
- Real-time test results with pass/fail indicators
- Monaco Editor with syntax highlighting
- Language selector
- Run and Submit buttons with loading states

## Database Schema

```sql
-- Problems table
CREATE TABLE problems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  difficulty ENUM('Easy', 'Medium', 'Hard'),
  examples JSON
);

-- Test cases table
CREATE TABLE test_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT,
  input TEXT,
  expected_output TEXT,
  label ENUM('basic', 'edge', 'stress', 'null', 'negative'),
  is_hidden TINYINT(1)
);

-- Submissions table
CREATE TABLE code_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  problem_id INT,
  language VARCHAR(50),
  code TEXT,
  status ENUM('accepted', 'wrong_answer', 'time_limit_exceeded', 'compile_error', 'runtime_error'),
  runtime_ms INT,
  test_cases_passed INT,
  test_cases_total INT
);
```
