const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('Seeding sample data...');

  try {
    // Delete existing incomplete data and reseed
    await connection.query('DELETE FROM questions');

    // Insert sample questions with proper JSON data
    const questions = [
      {
        slug: 'binary-search',
        title: 'Binary Search',
        category: 'searching',
        difficulty: 'Easy',
        description: 'Binary Search is an efficient algorithm used to find a target value in a sorted array by repeatedly dividing the search interval in half.',
        constraints: 'Array must be sorted\nTime Complexity: O(log n)\nSpace Complexity: O(1)',
        algorithm_steps: '1. Set left = 0 and right = array.length - 1\n2. While left <= right:\n   - Calculate mid = (left + right) / 2\n   - If array[mid] == target, return mid\n   - If array[mid] < target, set left = mid + 1\n   - Else set right = mid - 1\n3. Return -1 if not found',
        starter_code: 'function binarySearch(arr, target) {\n  // Your code here\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    // Complete the logic\n  }\n  return -1;\n}',
        solution_code: 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
        youtube_link: 'https://www.youtube.com/watch?v=P3YID7liBug',
        is_active: 1,
        created_by: 1,
        input_json: JSON.stringify({ array: [1, 3, 5, 7, 9, 11, 13, 15], target: 7, expected: 3 }),
        frames_json: JSON.stringify([
          { array: [1, 3, 5, 7, 9, 11, 13, 15], pointers: { left: 0, right: 7 }, message: "Initialize: left=0, right=7" },
          { array: [1, 3, 5, 7, 9, 11, 13, 15], pointers: { left: 0, right: 7, mid: 3 }, message: "Calculate mid=3, arr[3]=7" },
          { array: [1, 3, 5, 7, 9, 11, 13, 15], pointers: { left: 0, right: 7, mid: 3, found: 3 }, message: "Found! Target 7 at index 3" }
        ])
      },
      {
        slug: 'linear-search',
        title: 'Linear Search',
        category: 'searching',
        difficulty: 'Easy',
        description: 'Linear Search is a simple algorithm that checks every element in the array sequentially until the target is found.',
        constraints: 'Time Complexity: O(n)\nSpace Complexity: O(1)',
        algorithm_steps: '1. Start from the first element\n2. Compare each element with target\n3. If match found, return index\n4. If end reached, return -1',
        starter_code: 'function linearSearch(arr, target) {\n  // Your code here\n}',
        solution_code: 'function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}',
        youtube_link: 'https://www.youtube.com/watch?v=246V51AWwZM',
        is_active: 1,
        created_by: 1,
        input_json: JSON.stringify({ array: [4, 2, 7, 1, 9, 5], target: 7, expected: 2 }),
        frames_json: JSON.stringify([
          { array: [4, 2, 7, 1, 9, 5], pointers: { current: 0 }, message: "Check index 0: 4 ≠ 7" },
          { array: [4, 2, 7, 1, 9, 5], pointers: { current: 1 }, message: "Check index 1: 2 ≠ 7" },
          { array: [4, 2, 7, 1, 9, 5], pointers: { current: 2, found: 2 }, message: "Found! Target 7 at index 2" }
        ])
      },
      {
        slug: 'bubble-sort',
        title: 'Bubble Sort',
        category: 'sorting',
        difficulty: 'Easy',
        description: 'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        constraints: 'Time Complexity: O(n²)\nSpace Complexity: O(1)',
        algorithm_steps: '1. Compare adjacent elements\n2. Swap if they are in wrong order\n3. Repeat for all elements\n4. Continue until no swaps needed',
        starter_code: 'function bubbleSort(arr) {\n  // Your code here\n}',
        solution_code: 'function bubbleSort(arr) {\n  const n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}',
        youtube_link: 'https://www.youtube.com/watch?v=xli_FI7CuzA',
        is_active: 1,
        created_by: 1,
        input_json: JSON.stringify({ array: [5, 2, 8, 1, 9], target: null, expected: [1, 2, 5, 8, 9] }),
        frames_json: JSON.stringify([
          { array: [5, 2, 8, 1, 9], pointers: { i: 0, j: 0 }, message: "Compare 5 and 2" },
          { array: [2, 5, 8, 1, 9], pointers: { i: 0, j: 1 }, message: "Swapped! Now compare 5 and 8" },
          { array: [2, 5, 1, 8, 9], pointers: { i: 0, j: 2 }, message: "Swapped! Continue..." },
          { array: [1, 2, 5, 8, 9], pointers: {}, message: "Sorted!" }
        ])
      },
      {
        slug: 'merge-sort',
        title: 'Merge Sort',
        category: 'sorting',
        difficulty: 'Medium',
        description: 'Merge Sort is an efficient, stable sorting algorithm that uses divide-and-conquer approach.',
        constraints: 'Time Complexity: O(n log n)\nSpace Complexity: O(n)',
        algorithm_steps: '1. Divide array into two halves\n2. Recursively sort both halves\n3. Merge the sorted halves',
        starter_code: 'function mergeSort(arr) {\n  // Your code here\n}',
        solution_code: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] < right[j]) result.push(left[i++]);\n    else result.push(right[j++]);\n  }\n  return result.concat(left.slice(i)).concat(right.slice(j));\n}',
        youtube_link: 'https://www.youtube.com/watch?v=4VqmGXwpLqc',
        is_active: 1,
        created_by: 1,
        input_json: JSON.stringify({ array: [38, 27, 43, 3, 9, 82, 10], target: null, expected: [3, 9, 10, 27, 38, 43, 82] }),
        frames_json: JSON.stringify([
          { array: [38, 27, 43, 3, 9, 82, 10], pointers: {}, message: "Divide array into halves" },
          { array: [38, 27, 43, 3], pointers: {}, message: "Left half" },
          { array: [9, 82, 10], pointers: {}, message: "Right half" },
          { array: [3, 9, 10, 27, 38, 43, 82], pointers: {}, message: "Merge sorted halves" }
        ])
      }
    ];

    for (const q of questions) {
      await connection.query(
        `INSERT INTO questions (slug, title, category, difficulty, description, constraints, 
         algorithm_steps, starter_code, solution_code, youtube_link, is_active, created_by, input_json, frames_json) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.slug, q.title, q.category, q.difficulty, q.description, q.constraints,
         q.algorithm_steps, q.starter_code, q.solution_code, q.youtube_link, q.is_active, q.created_by,
         q.input_json, q.frames_json]
      );
    }

    console.log('✅ Sample data seeded successfully!');
    console.log('   - 2 Searching problems');
    console.log('   - 2 Sorting problems');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  await connection.end();
  process.exit(0);
}

seedData();
