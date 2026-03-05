export const ALGORITHMS = {
  "binary-search": {
    id: "binary-search",
    name: "Binary Search",
    category: "SEARCHING",
    description: "Halves the search space of a sorted array.",
    input: {
      array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
      target: 56,
      expected: 7,
    },
    constraints: [
      "1 <= arr.length <= 10^4",
      "-10^4 < arr[i], target < 10^4",
      "All integers in arr are unique.",
      "arr is sorted in ascending order."
    ],
    steps: [
      "Set L = 0, R = n - 1.",
      "While L <= R:",
      "mid = floor((L + R) / 2)",
      "If arr[mid] == target, return mid.",
      "Else adjust L or R accordingly.",
    ],
    youtubeLink: "",
    pptLink: "",
    code: `function solve(arr, target) {
  let l = 0, r = arr.length - 1;
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return -1;
}`,
    frames: [
      {
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        pointers: { L: 0, R: 9 },
        highlights: {},
        message: "Initial Array State",
      },
      {
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        pointers: { L: 0, R: 9, M: 4 },
        highlights: { mid: 4 },
        message: "mid = 4, arr[mid] = 16",
      },
      {
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        pointers: { L: 5, R: 9 },
        highlights: { leftBound: 5, rightBound: 9 },
        message: "16 < 56, move left bound to 5",
      },
      {
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        pointers: { L: 5, R: 9, M: 7 },
        highlights: { leftBound: 5, rightBound: 9, mid: 7 },
        message: "mid = 7, arr[mid] = 56",
      },
      {
        array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        pointers: { M: 7 },
        highlights: { found: 7 },
        message: "Target found at index 7",
      },
    ],
  },
  "linear-search": {
    id: "linear-search",
    name: "Linear Search",
    category: "SEARCHING",
    description: "Scans each element until a match is found.",
    input: {
      array: [23, 5, 8, 91, 16, 12],
      target: 91,
      expected: 3,
    },
    constraints: [
      "1 <= arr.length <= 10^4",
      "-10^4 <= arr[i], target <= 10^4",
      "All integers in arr are unique."
    ],
    steps: [
      "Set i = 0.",
      "Check arr[i] with target.",
      "If match, return i.",
      "Else increment i and continue.",
      "If loop ends, return -1.",
    ],
    youtubeLink: "",
    pptLink: "",
    code: `function solve(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    frames: [
      {
        array: [23, 5, 8, 91, 16, 12],
        pointers: { i: 0 },
        highlights: { current: 0 },
        message: "Checking index 0",
      },
      {
        array: [23, 5, 8, 91, 16, 12],
        pointers: { i: 1 },
        highlights: { current: 1 },
        message: "Checking index 1",
      },
      {
        array: [23, 5, 8, 91, 16, 12],
        pointers: { i: 2 },
        highlights: { current: 2 },
        message: "Checking index 2",
      },
      {
        array: [23, 5, 8, 91, 16, 12],
        pointers: { i: 3 },
        highlights: { found: 3 },
        message: "Found target at index 3",
      },
    ],
  },
};

export const CATEGORIES = [
  { name: "SEARCHING", items: ["Linear Search", "Binary Search"] },
  {
    name: "SORTING",
    items: [
      "Bubble Sort",
      "Selection Sort",
      "Insertion Sort",
      "Quick Sort",
      "Heap Sort",
      "Merge Sort",
    ],
  },
  {
    name: "TREES",
    items: [
      "Inorder Traversal",
      "Preorder Traversal",
      "Postorder Traversal",
      "Level Order (BFS)",
      "Max Depth",
    ],
  },
  { name: "GRAPHS", items: ["BFS Traversal", "DFS Traversal", "Path Exists"] },
];

export function slugify(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
