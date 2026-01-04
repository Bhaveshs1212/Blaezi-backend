/**
 * DSA Problems Seed Data
 * 
 * PURPOSE: Import Striver SDE Sheet problems into MasterProblem collection
 * 
 * SOURCE: Striver's SDE Sheet (Top Interview Problems)
 * 
 * RUN: node src/seed/seedDSA.js
 */

/**
 * Striver SDE Sheet - Top 191 Problems
 * 
 * This is a SAMPLE of the sheet. You can expand this with all 191 problems.
 * 
 * DATA STRUCTURE:
 * - title: Problem name
 * - problemNumber: LeetCode problem number
 * - difficulty: Easy/Medium/Hard
 * - topic: Main topic category
 * - subtopics: Related concepts/algorithms
 * - platform: Where to solve it
 * - url: Direct link
 * - sheet: Which sheet it belongs to
 * - companies: Companies that ask this
 * - description: Brief description
 * - hints: Helpful hints for solving
 * - acceptance: Success rate %
 * - likes: Popularity metric
 */

const striverSDESheet = [
  // ═══════════════════════════════════════════════════════════
  // ARRAY PROBLEMS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Set Matrix Zeroes',
    problemNumber: 73,
    difficulty: 'Medium',
    topic: 'Array',
    subtopics: ['Matrix', 'Hash Table', 'In-place'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/set-matrix-zeroes/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    description: 'Given an m x n matrix, if an element is 0, set its entire row and column to 0s in-place.',
    hints: [
      'Use first row and column as markers',
      'Process matrix in reverse to avoid overwriting markers',
      'Space complexity O(1) solution exists'
    ],
    acceptance: 51.2,
    likes: 8500,
    isActive: true
  },
  {
    title: 'Pascal\'s Triangle',
    problemNumber: 118,
    difficulty: 'Easy',
    topic: 'Array',
    subtopics: ['Dynamic Programming', 'Math'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/pascals-triangle/',
    sheet: 'Striver SDE Sheet',
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Generate the first numRows of Pascal\'s triangle.',
    hints: [
      'Each row starts and ends with 1',
      'Middle elements: arr[i][j] = arr[i-1][j-1] + arr[i-1][j]',
      'Use previous row to build current row'
    ],
    acceptance: 70.8,
    likes: 9200,
    isActive: true
  },
  {
    title: 'Next Permutation',
    problemNumber: 31,
    difficulty: 'Medium',
    topic: 'Array',
    subtopics: ['Two Pointers', 'Math'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/next-permutation/',
    sheet: 'Striver SDE Sheet',
    companies: ['Google', 'Amazon', 'Facebook'],
    description: 'Find the next lexicographically greater permutation of numbers.',
    hints: [
      'Find longest decreasing suffix from right',
      'Swap pivot with smallest greater element in suffix',
      'Reverse the suffix'
    ],
    acceptance: 38.4,
    likes: 12000,
    isActive: true
  },
  {
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    problemNumber: 53,
    difficulty: 'Medium',
    topic: 'Array',
    subtopics: ['Dynamic Programming', 'Divide and Conquer', 'Kadane\'s Algorithm'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/maximum-subarray/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple', 'Bloomberg'],
    description: 'Find the contiguous subarray with the largest sum.',
    hints: [
      'Kadane\'s Algorithm: O(n) solution',
      'Keep track of current sum, reset if negative',
      'Update max sum at each step'
    ],
    acceptance: 50.3,
    likes: 25000,
    isActive: true
  },
  {
    title: 'Sort Colors (Dutch National Flag)',
    problemNumber: 75,
    difficulty: 'Medium',
    topic: 'Array',
    subtopics: ['Two Pointers', 'Sorting'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/sort-colors/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Facebook'],
    description: 'Sort array of 0s, 1s, and 2s in-place (Dutch National Flag problem).',
    hints: [
      'Use three pointers: low, mid, high',
      'Swap 0s to left, 2s to right',
      'Single pass O(n) solution'
    ],
    acceptance: 59.7,
    likes: 11500,
    isActive: true
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    problemNumber: 121,
    difficulty: 'Easy',
    topic: 'Array',
    subtopics: ['Dynamic Programming', 'Greedy'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Facebook', 'Microsoft', 'Google', 'Bloomberg'],
    description: 'Find maximum profit from buying and selling stock once.',
    hints: [
      'Track minimum price seen so far',
      'Calculate profit at each step',
      'O(n) time, O(1) space'
    ],
    acceptance: 54.2,
    likes: 22000,
    isActive: true
  },

  // ═══════════════════════════════════════════════════════════
  // LINKED LIST PROBLEMS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Reverse Linked List',
    problemNumber: 206,
    difficulty: 'Easy',
    topic: 'Linked List',
    subtopics: ['Iterative', 'Recursive', 'Pointers'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/reverse-linked-list/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Google', 'Facebook', 'Apple'],
    description: 'Reverse a singly linked list.',
    hints: [
      'Use three pointers: prev, current, next',
      'Iterative solution: O(n) time, O(1) space',
      'Recursive solution also possible'
    ],
    acceptance: 73.5,
    likes: 18000,
    isActive: true
  },
  {
    title: 'Middle of the Linked List',
    problemNumber: 876,
    difficulty: 'Easy',
    topic: 'Linked List',
    subtopics: ['Two Pointers', 'Fast and Slow'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/middle-of-the-linked-list/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Find the middle node of a linked list.',
    hints: [
      'Tortoise and Hare algorithm',
      'Slow pointer moves 1 step, fast moves 2 steps',
      'When fast reaches end, slow is at middle'
    ],
    acceptance: 74.8,
    likes: 8500,
    isActive: true
  },
  {
    title: 'Merge Two Sorted Lists',
    problemNumber: 21,
    difficulty: 'Easy',
    topic: 'Linked List',
    subtopics: ['Recursion', 'Two Pointers'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Google'],
    description: 'Merge two sorted linked lists into one sorted list.',
    hints: [
      'Use dummy node to simplify code',
      'Compare values and link smaller node',
      'Both iterative and recursive solutions work'
    ],
    acceptance: 61.5,
    likes: 16500,
    isActive: true
  },
  {
    title: 'Remove Nth Node From End of List',
    problemNumber: 19,
    difficulty: 'Medium',
    topic: 'Linked List',
    subtopics: ['Two Pointers', 'One Pass'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Facebook', 'Google'],
    description: 'Remove the nth node from the end of a linked list in one pass.',
    hints: [
      'Use two pointers with n gap between them',
      'Move both until first reaches end',
      'Second pointer will be at (n+1)th from end'
    ],
    acceptance: 42.3,
    likes: 14500,
    isActive: true
  },
  {
    title: 'Linked List Cycle',
    problemNumber: 141,
    difficulty: 'Easy',
    topic: 'Linked List',
    subtopics: ['Two Pointers', 'Hash Table', 'Cycle Detection'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/linked-list-cycle/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Google', 'Facebook'],
    description: 'Detect if a linked list has a cycle.',
    hints: [
      'Floyd\'s Cycle Detection (Tortoise and Hare)',
      'Slow moves 1, fast moves 2',
      'If they meet, there\'s a cycle'
    ],
    acceptance: 48.7,
    likes: 12800,
    isActive: true
  },

  // ═══════════════════════════════════════════════════════════
  // DYNAMIC PROGRAMMING PROBLEMS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Longest Increasing Subsequence',
    problemNumber: 300,
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    subtopics: ['Binary Search', 'DP', 'LIS'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Google', 'Facebook'],
    description: 'Find the length of the longest strictly increasing subsequence.',
    hints: [
      'DP solution: O(n²) time',
      'Binary search optimization: O(n log n)',
      'Maintain array of smallest tail elements'
    ],
    acceptance: 52.8,
    likes: 16000,
    isActive: true
  },
  {
    title: 'Longest Common Subsequence',
    problemNumber: 1143,
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    subtopics: ['String', 'LCS'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/longest-common-subsequence/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Find the length of the longest common subsequence between two strings.',
    hints: [
      'Use 2D DP table',
      'If chars match: dp[i][j] = dp[i-1][j-1] + 1',
      'Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])'
    ],
    acceptance: 58.9,
    likes: 11200,
    isActive: true
  },
  {
    title: '0/1 Knapsack Problem',
    problemNumber: 416,
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    subtopics: ['Subset Sum', 'Knapsack'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/partition-equal-subset-sum/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Partition array into two subsets with equal sum (variation of 0/1 Knapsack).',
    hints: [
      'Check if sum is even first',
      'Find subset with sum = total/2',
      'Classic DP knapsack approach'
    ],
    acceptance: 46.8,
    likes: 9800,
    isActive: true
  },

  // ═══════════════════════════════════════════════════════════
  // BINARY SEARCH PROBLEMS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Binary Search',
    problemNumber: 704,
    difficulty: 'Easy',
    topic: 'Binary Search',
    subtopics: ['Array', 'Divide and Conquer'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/binary-search/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Google', 'Facebook'],
    description: 'Implement binary search on sorted array.',
    hints: [
      'Classic binary search template',
      'O(log n) time complexity',
      'Watch for integer overflow: mid = left + (right-left)/2'
    ],
    acceptance: 56.2,
    likes: 7500,
    isActive: true
  },
  {
    title: 'Search in Rotated Sorted Array',
    problemNumber: 33,
    difficulty: 'Medium',
    topic: 'Binary Search',
    subtopics: ['Array', 'Rotated Array'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Facebook', 'Google'],
    description: 'Search for a target value in a rotated sorted array.',
    hints: [
      'Modified binary search',
      'Determine which half is sorted',
      'Check if target is in sorted half'
    ],
    acceptance: 39.8,
    likes: 18500,
    isActive: true
  },
  {
    title: 'Median of Two Sorted Arrays',
    problemNumber: 4,
    difficulty: 'Hard',
    topic: 'Binary Search',
    subtopics: ['Array', 'Divide and Conquer'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
    description: 'Find median of two sorted arrays in O(log(min(m,n))).',
    hints: [
      'Binary search on smaller array',
      'Partition both arrays',
      'Ensure left partition ≤ right partition'
    ],
    acceptance: 36.4,
    likes: 22000,
    isActive: true
  },

  // ═══════════════════════════════════════════════════════════
  // TREE PROBLEMS
  // ═══════════════════════════════════════════════════════════
  {
    title: 'Inorder Traversal',
    problemNumber: 94,
    difficulty: 'Easy',
    topic: 'Tree',
    subtopics: ['Binary Tree', 'DFS', 'Stack'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Perform inorder traversal of binary tree (iterative and recursive).',
    hints: [
      'Recursive: left → root → right',
      'Iterative: use stack',
      'Morris traversal for O(1) space'
    ],
    acceptance: 74.5,
    likes: 10500,
    isActive: true
  },
  {
    title: 'Maximum Depth of Binary Tree',
    problemNumber: 104,
    difficulty: 'Easy',
    topic: 'Tree',
    subtopics: ['Binary Tree', 'DFS', 'BFS'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Facebook'],
    description: 'Find the maximum depth of a binary tree.',
    hints: [
      'DFS: 1 + max(left_depth, right_depth)',
      'BFS: count levels using queue',
      'Both solutions are O(n)'
    ],
    acceptance: 74.2,
    likes: 9800,
    isActive: true
  },
  {
    title: 'Lowest Common Ancestor of Binary Tree',
    problemNumber: 236,
    difficulty: 'Medium',
    topic: 'Tree',
    subtopics: ['Binary Tree', 'DFS', 'Recursion'],
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    sheet: 'Striver SDE Sheet',
    companies: ['Amazon', 'Microsoft', 'Facebook', 'Google'],
    description: 'Find the lowest common ancestor of two nodes in a binary tree.',
    hints: [
      'Use recursion',
      'If root is one of p or q, return root',
      'If found in both subtrees, root is LCA'
    ],
    acceptance: 59.3,
    likes: 13500,
    isActive: true
  }
];

module.exports = striverSDESheet;
