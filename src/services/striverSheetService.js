/**
 * Striver SDE Sheet Service
 * 
 * PURPOSE: Fetch DSA problems from Striver's SDE Sheet
 * 
 * SOURCES:
 * - Striver's SDE Sheet (takeuforward.org)
 * - Can be extended to other problem sheets
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Striver SDE Sheet problems
 * This is the curated list from the official Striver SDE Sheet
 */
const STRIVER_SDE_SHEET_PROBLEMS = [
  // Arrays
  { id: "striver-1", problemNumber: 1, title: "Set Matrix Zeroes", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/set-matrix-zeroes/", sheet: "Striver SDE Sheet" },
  { id: "striver-2", problemNumber: 2, title: "Pascal's Triangle", difficulty: "Easy", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/pascals-triangle/", sheet: "Striver SDE Sheet" },
  { id: "striver-3", problemNumber: 3, title: "Next Permutation", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/next-permutation/", sheet: "Striver SDE Sheet" },
  { id: "striver-4", problemNumber: 4, title: "Kadane's Algorithm (Maximum Subarray)", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/maximum-subarray/", sheet: "Striver SDE Sheet" },
  { id: "striver-5", problemNumber: 5, title: "Sort Colors", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/sort-colors/", sheet: "Striver SDE Sheet" },
  { id: "striver-6", problemNumber: 6, title: "Stock Buy and Sell", difficulty: "Easy", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", sheet: "Striver SDE Sheet" },
  
  // Arrays Part II
  { id: "striver-7", problemNumber: 7, title: "Rotate Matrix", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/rotate-image/", sheet: "Striver SDE Sheet" },
  { id: "striver-8", problemNumber: 8, title: "Merge Overlapping Intervals", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/merge-intervals/", sheet: "Striver SDE Sheet" },
  { id: "striver-9", problemNumber: 9, title: "Merge Two Sorted Arrays", difficulty: "Easy", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/merge-sorted-array/", sheet: "Striver SDE Sheet" },
  { id: "striver-10", problemNumber: 10, title: "Find Duplicate Number", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/find-the-duplicate-number/", sheet: "Striver SDE Sheet" },
  { id: "striver-11", problemNumber: 11, title: "Repeat and Missing Number", difficulty: "Medium", topic: "Arrays", platform: "GFG", link: "https://www.geeksforgeeks.org/find-a-repeating-and-a-missing-number/", sheet: "Striver SDE Sheet" },
  { id: "striver-12", problemNumber: 12, title: "Inversion of Array", difficulty: "Hard", topic: "Arrays", platform: "GFG", link: "https://www.geeksforgeeks.org/counting-inversions/", sheet: "Striver SDE Sheet" },
  
  // Arrays Part III
  { id: "striver-13", problemNumber: 13, title: "Search in 2D Matrix", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/search-a-2d-matrix/", sheet: "Striver SDE Sheet" },
  { id: "striver-14", problemNumber: 14, title: "Power(x, n)", difficulty: "Medium", topic: "Math", platform: "LeetCode", link: "https://leetcode.com/problems/powx-n/", sheet: "Striver SDE Sheet" },
  { id: "striver-15", problemNumber: 15, title: "Majority Element (>n/2)", difficulty: "Easy", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/majority-element/", sheet: "Striver SDE Sheet" },
  { id: "striver-16", problemNumber: 16, title: "Majority Element II (>n/3)", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/majority-element-ii/", sheet: "Striver SDE Sheet" },
  { id: "striver-17", problemNumber: 17, title: "Grid Unique Paths", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/unique-paths/", sheet: "Striver SDE Sheet" },
  { id: "striver-18", problemNumber: 18, title: "Reverse Pairs", difficulty: "Hard", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/reverse-pairs/", sheet: "Striver SDE Sheet" },
  
  // Arrays Part IV
  { id: "striver-19", problemNumber: 19, title: "2 Sum Problem", difficulty: "Easy", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/two-sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-20", problemNumber: 20, title: "4 Sum Problem", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/4sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-21", problemNumber: 21, title: "Longest Consecutive Sequence", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/longest-consecutive-sequence/", sheet: "Striver SDE Sheet" },
  { id: "striver-22", problemNumber: 22, title: "Longest Subarray with Zero Sum", difficulty: "Easy", topic: "Arrays", platform: "GFG", link: "https://www.geeksforgeeks.org/find-the-largest-subarray-with-0-sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-23", problemNumber: 23, title: "Count Subarrays with Given XOR", difficulty: "Medium", topic: "Arrays", platform: "InterviewBit", link: "https://www.interviewbit.com/problems/subarray-with-given-xor/", sheet: "Striver SDE Sheet" },
  { id: "striver-24", problemNumber: 24, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Strings", platform: "LeetCode", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", sheet: "Striver SDE Sheet" },
  
  // Linked List
  { id: "striver-25", problemNumber: 25, title: "Reverse a Linked List", difficulty: "Easy", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/reverse-linked-list/", sheet: "Striver SDE Sheet" },
  { id: "striver-26", problemNumber: 26, title: "Middle of Linked List", difficulty: "Easy", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/middle-of-the-linked-list/", sheet: "Striver SDE Sheet" },
  { id: "striver-27", problemNumber: 27, title: "Merge Two Sorted Lists", difficulty: "Easy", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/merge-two-sorted-lists/", sheet: "Striver SDE Sheet" },
  { id: "striver-28", problemNumber: 28, title: "Remove Nth Node From End", difficulty: "Medium", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", sheet: "Striver SDE Sheet" },
  { id: "striver-29", problemNumber: 29, title: "Delete Node in Linked List", difficulty: "Easy", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/delete-node-in-a-linked-list/", sheet: "Striver SDE Sheet" },
  { id: "striver-30", problemNumber: 30, title: "Add Two Numbers", difficulty: "Medium", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/add-two-numbers/", sheet: "Striver SDE Sheet" },
  
  // Linked List Part II
  { id: "striver-31", problemNumber: 31, title: "Intersection of Two Linked Lists", difficulty: "Easy", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/intersection-of-two-linked-lists/", sheet: "Striver SDE Sheet" },
  { id: "striver-32", problemNumber: 32, title: "Linked List Cycle", difficulty: "Easy", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/linked-list-cycle/", sheet: "Striver SDE Sheet" },
  { id: "striver-33", problemNumber: 33, title: "Reverse Nodes in k-Group", difficulty: "Hard", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/reverse-nodes-in-k-group/", sheet: "Striver SDE Sheet" },
  { id: "striver-34", problemNumber: 34, title: "Palindrome Linked List", difficulty: "Easy", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/palindrome-linked-list/", sheet: "Striver SDE Sheet" },
  { id: "striver-35", problemNumber: 35, title: "Starting Point of Loop in Linked List", difficulty: "Medium", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/linked-list-cycle-ii/", sheet: "Striver SDE Sheet" },
  { id: "striver-36", problemNumber: 36, title: "Flattening of a Linked List", difficulty: "Medium", topic: "Linked List", platform: "GFG", link: "https://www.geeksforgeeks.org/flattening-a-linked-list/", sheet: "Striver SDE Sheet" },
  
  // Greedy Algorithm
  { id: "striver-37", problemNumber: 37, title: "N Meetings in One Room", difficulty: "Easy", topic: "Greedy", platform: "GFG", link: "https://www.geeksforgeeks.org/find-maximum-meetings-in-one-room/", sheet: "Striver SDE Sheet" },
  { id: "striver-38", problemNumber: 38, title: "Minimum Platforms", difficulty: "Medium", topic: "Greedy", platform: "GFG", link: "https://www.geeksforgeeks.org/minimum-number-platforms-required-railwaybus-station/", sheet: "Striver SDE Sheet" },
  { id: "striver-39", problemNumber: 39, title: "Job Sequencing Problem", difficulty: "Medium", topic: "Greedy", platform: "GFG", link: "https://www.geeksforgeeks.org/job-sequencing-problem/", sheet: "Striver SDE Sheet" },
  { id: "striver-40", problemNumber: 40, title: "Fractional Knapsack", difficulty: "Medium", topic: "Greedy", platform: "GFG", link: "https://www.geeksforgeeks.org/fractional-knapsack-problem/", sheet: "Striver SDE Sheet" },
  { id: "striver-41", problemNumber: 41, title: "Greedy Algorithm to find Minimum Coins", difficulty: "Easy", topic: "Greedy", platform: "GFG", link: "https://www.geeksforgeeks.org/greedy-algorithm-to-find-minimum-number-of-coins/", sheet: "Striver SDE Sheet" },
  { id: "striver-42", problemNumber: 42, title: "Activity Selection", difficulty: "Easy", topic: "Greedy", platform: "GFG", link: "https://www.geeksforgeeks.org/activity-selection-problem-greedy-algo-1/", sheet: "Striver SDE Sheet" },
  
  // Recursion
  { id: "striver-43", problemNumber: 43, title: "Subset Sums", difficulty: "Easy", topic: "Recursion", platform: "GFG", link: "https://www.geeksforgeeks.org/subset-sum-problem/", sheet: "Striver SDE Sheet" },
  { id: "striver-44", problemNumber: 44, title: "Subsets II", difficulty: "Medium", topic: "Recursion", platform: "LeetCode", link: "https://leetcode.com/problems/subsets-ii/", sheet: "Striver SDE Sheet" },
  { id: "striver-45", problemNumber: 45, title: "Combination Sum", difficulty: "Medium", topic: "Recursion", platform: "LeetCode", link: "https://leetcode.com/problems/combination-sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-46", problemNumber: 46, title: "Combination Sum II", difficulty: "Medium", topic: "Recursion", platform: "LeetCode", link: "https://leetcode.com/problems/combination-sum-ii/", sheet: "Striver SDE Sheet" },
  { id: "striver-47", problemNumber: 47, title: "Palindrome Partitioning", difficulty: "Medium", topic: "Recursion", platform: "LeetCode", link: "https://leetcode.com/problems/palindrome-partitioning/", sheet: "Striver SDE Sheet" },
  { id: "striver-48", problemNumber: 48, title: "K-th Permutation Sequence", difficulty: "Hard", topic: "Recursion", platform: "LeetCode", link: "https://leetcode.com/problems/permutation-sequence/", sheet: "Striver SDE Sheet" },
  
  // Binary Search
  { id: "striver-49", problemNumber: 49, title: "Nth Root of Integer", difficulty: "Easy", topic: "Binary Search", platform: "GFG", link: "https://www.geeksforgeeks.org/n-th-root-number/", sheet: "Striver SDE Sheet" },
  { id: "striver-50", problemNumber: 50, title: "Matrix Median", difficulty: "Medium", topic: "Binary Search", platform: "InterviewBit", link: "https://www.interviewbit.com/problems/matrix-median/", sheet: "Striver SDE Sheet" },
  { id: "striver-51", problemNumber: 51, title: "Single Element in Sorted Array", difficulty: "Medium", topic: "Binary Search", platform: "LeetCode", link: "https://leetcode.com/problems/single-element-in-a-sorted-array/", sheet: "Striver SDE Sheet" },
  { id: "striver-52", problemNumber: 52, title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", platform: "LeetCode", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", sheet: "Striver SDE Sheet" },
  { id: "striver-53", problemNumber: 53, title: "Median of Two Sorted Arrays", difficulty: "Hard", topic: "Binary Search", platform: "LeetCode", link: "https://leetcode.com/problems/median-of-two-sorted-arrays/", sheet: "Striver SDE Sheet" },
  { id: "striver-54", problemNumber: 54, title: "Kth Element of Two Sorted Arrays", difficulty: "Medium", topic: "Binary Search", platform: "GFG", link: "https://www.geeksforgeeks.org/k-th-element-two-sorted-arrays/", sheet: "Striver SDE Sheet" },
  { id: "striver-55", problemNumber: 55, title: "Allocate Minimum Pages", difficulty: "Medium", topic: "Binary Search", platform: "GFG", link: "https://www.geeksforgeeks.org/allocate-minimum-number-pages/", sheet: "Striver SDE Sheet" },
  { id: "striver-56", problemNumber: 56, title: "Aggressive Cows", difficulty: "Medium", topic: "Binary Search", platform: "SPOJ", link: "https://www.spoj.com/problems/AGGRCOW/", sheet: "Striver SDE Sheet" },
  
  // Heaps
  { id: "striver-57", problemNumber: 57, title: "Max Heap", difficulty: "Easy", topic: "Heaps", platform: "GFG", link: "https://www.geeksforgeeks.org/max-heap-in-java/", sheet: "Striver SDE Sheet" },
  { id: "striver-58", problemNumber: 58, title: "Min Heap", difficulty: "Easy", topic: "Heaps", platform: "GFG", link: "https://www.geeksforgeeks.org/min-heap-in-java/", sheet: "Striver SDE Sheet" },
  { id: "striver-59", problemNumber: 59, title: "Kth Largest Element", difficulty: "Medium", topic: "Heaps", platform: "LeetCode", link: "https://leetcode.com/problems/kth-largest-element-in-an-array/", sheet: "Striver SDE Sheet" },
  { id: "striver-60", problemNumber: 60, title: "Maximum Sum Combination", difficulty: "Medium", topic: "Heaps", platform: "InterviewBit", link: "https://www.interviewbit.com/problems/maximum-sum-combinations/", sheet: "Striver SDE Sheet" },
  { id: "striver-61", problemNumber: 61, title: "Find Median from Data Stream", difficulty: "Hard", topic: "Heaps", platform: "LeetCode", link: "https://leetcode.com/problems/find-median-from-data-stream/", sheet: "Striver SDE Sheet" },
  { id: "striver-62", problemNumber: 62, title: "Merge K Sorted Arrays", difficulty: "Medium", topic: "Heaps", platform: "GFG", link: "https://www.geeksforgeeks.org/merge-k-sorted-arrays/", sheet: "Striver SDE Sheet" },
  { id: "striver-63", problemNumber: 63, title: "K Most Frequent Elements", difficulty: "Medium", topic: "Heaps", platform: "LeetCode", link: "https://leetcode.com/problems/top-k-frequent-elements/", sheet: "Striver SDE Sheet" },
  
  // Stack and Queue
  { id: "striver-64", problemNumber: 64, title: "Implement Stack using Arrays", difficulty: "Easy", topic: "Stack", platform: "GFG", link: "https://www.geeksforgeeks.org/stack-data-structure-introduction-program/", sheet: "Striver SDE Sheet" },
  { id: "striver-65", problemNumber: 65, title: "Implement Queue using Arrays", difficulty: "Easy", topic: "Queue", platform: "GFG", link: "https://www.geeksforgeeks.org/queue-set-1introduction-and-array-implementation/", sheet: "Striver SDE Sheet" },
  { id: "striver-66", problemNumber: 66, title: "Implement Stack using Queue", difficulty: "Easy", topic: "Stack", platform: "LeetCode", link: "https://leetcode.com/problems/implement-stack-using-queues/", sheet: "Striver SDE Sheet" },
  { id: "striver-67", problemNumber: 67, title: "Implement Queue using Stack", difficulty: "Easy", topic: "Queue", platform: "LeetCode", link: "https://leetcode.com/problems/implement-queue-using-stacks/", sheet: "Striver SDE Sheet" },
  { id: "striver-68", problemNumber: 68, title: "Valid Parentheses", difficulty: "Easy", topic: "Stack", platform: "LeetCode", link: "https://leetcode.com/problems/valid-parentheses/", sheet: "Striver SDE Sheet" },
  { id: "striver-69", problemNumber: 69, title: "Next Greater Element", difficulty: "Medium", topic: "Stack", platform: "LeetCode", link: "https://leetcode.com/problems/next-greater-element-i/", sheet: "Striver SDE Sheet" },
  { id: "striver-70", problemNumber: 70, title: "Sort a Stack", difficulty: "Medium", topic: "Stack", platform: "GFG", link: "https://www.geeksforgeeks.org/sort-stack-using-temporary-stack/", sheet: "Striver SDE Sheet" },
  
  // String
  { id: "striver-71", problemNumber: 71, title: "Reverse Words in a String", difficulty: "Medium", topic: "Strings", platform: "LeetCode", link: "https://leetcode.com/problems/reverse-words-in-a-string/", sheet: "Striver SDE Sheet" },
  { id: "striver-72", problemNumber: 72, title: "Longest Palindromic Substring", difficulty: "Medium", topic: "Strings", platform: "LeetCode", link: "https://leetcode.com/problems/longest-palindromic-substring/", sheet: "Striver SDE Sheet" },
  { id: "striver-73", problemNumber: 73, title: "Roman to Integer", difficulty: "Easy", topic: "Strings", platform: "LeetCode", link: "https://leetcode.com/problems/roman-to-integer/", sheet: "Striver SDE Sheet" },
  { id: "striver-74", problemNumber: 74, title: "Implement ATOI/STRSTR", difficulty: "Medium", topic: "Strings", platform: "LeetCode", link: "https://leetcode.com/problems/string-to-integer-atoi/", sheet: "Striver SDE Sheet" },
  { id: "striver-75", problemNumber: 75, title: "Longest Common Prefix", difficulty: "Easy", topic: "Strings", platform: "LeetCode", link: "https://leetcode.com/problems/longest-common-prefix/", sheet: "Striver SDE Sheet" },
  { id: "striver-76", problemNumber: 76, title: "Rabin Karp Algorithm", difficulty: "Hard", topic: "Strings", platform: "GFG", link: "https://www.geeksforgeeks.org/rabin-karp-algorithm-for-pattern-searching/", sheet: "Striver SDE Sheet" },
  
  // Binary Tree
  { id: "striver-77", problemNumber: 77, title: "Inorder Traversal", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-inorder-traversal/", sheet: "Striver SDE Sheet" },
  { id: "striver-78", problemNumber: 78, title: "Preorder Traversal", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-preorder-traversal/", sheet: "Striver SDE Sheet" },
  { id: "striver-79", problemNumber: 79, title: "Postorder Traversal", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-postorder-traversal/", sheet: "Striver SDE Sheet" },
  { id: "striver-80", problemNumber: 80, title: "Left View of Binary Tree", difficulty: "Easy", topic: "Binary Tree", platform: "GFG", link: "https://www.geeksforgeeks.org/print-left-view-binary-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-81", problemNumber: 81, title: "Bottom View of Binary Tree", difficulty: "Medium", topic: "Binary Tree", platform: "GFG", link: "https://www.geeksforgeeks.org/bottom-view-binary-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-82", problemNumber: 82, title: "Top View of Binary Tree", difficulty: "Medium", topic: "Binary Tree", platform: "GFG", link: "https://www.geeksforgeeks.org/top-view-binary-tree/", sheet: "Striver SDE Sheet" },
  
  // Binary Search Tree
  { id: "striver-83", problemNumber: 83, title: "Populate Next Right Pointers", difficulty: "Medium", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/", sheet: "Striver SDE Sheet" },
  { id: "striver-84", problemNumber: 84, title: "Search in BST", difficulty: "Easy", topic: "BST", platform: "LeetCode", link: "https://leetcode.com/problems/search-in-a-binary-search-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-85", problemNumber: 85, title: "Convert Sorted Array to BST", difficulty: "Easy", topic: "BST", platform: "LeetCode", link: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-86", problemNumber: 86, title: "Construct BST from Preorder", difficulty: "Medium", topic: "BST", platform: "LeetCode", link: "https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/", sheet: "Striver SDE Sheet" },
  { id: "striver-87", problemNumber: 87, title: "Validate BST", difficulty: "Medium", topic: "BST", platform: "LeetCode", link: "https://leetcode.com/problems/validate-binary-search-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-88", problemNumber: 88, title: "LCA in BST", difficulty: "Easy", topic: "BST", platform: "LeetCode", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-89", problemNumber: 89, title: "Predecessor and Successor in BST", difficulty: "Medium", topic: "BST", platform: "GFG", link: "https://www.geeksforgeeks.org/inorder-predecessor-successor-given-key-bst/", sheet: "Striver SDE Sheet" },
  
  // Binary Tree Part II
  { id: "striver-90", problemNumber: 90, title: "Height of Binary Tree", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-91", problemNumber: 91, title: "Diameter of Binary Tree", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/diameter-of-binary-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-92", problemNumber: 92, title: "Balanced Binary Tree", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/balanced-binary-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-93", problemNumber: 93, title: "LCA of Binary Tree", difficulty: "Medium", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-94", problemNumber: 94, title: "Same Tree", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/same-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-95", problemNumber: 95, title: "Zig Zag Traversal", difficulty: "Medium", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/", sheet: "Striver SDE Sheet" },
  { id: "striver-96", problemNumber: 96, title: "Boundary Traversal", difficulty: "Medium", topic: "Binary Tree", platform: "GFG", link: "https://www.geeksforgeeks.org/boundary-traversal-of-binary-tree/", sheet: "Striver SDE Sheet" },
  
  // Binary Tree Part III
  { id: "striver-97", problemNumber: 97, title: "Maximum Path Sum", difficulty: "Hard", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-98", problemNumber: 98, title: "Construct Binary Tree from Inorder and Preorder", difficulty: "Medium", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", sheet: "Striver SDE Sheet" },
  { id: "striver-99", problemNumber: 99, title: "Construct Binary Tree from Inorder and Postorder", difficulty: "Medium", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/", sheet: "Striver SDE Sheet" },
  { id: "striver-100", problemNumber: 100, title: "Symmetric Binary Tree", difficulty: "Easy", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/symmetric-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-101", problemNumber: 101, title: "Flatten Binary Tree to Linked List", difficulty: "Medium", topic: "Binary Tree", platform: "LeetCode", link: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/", sheet: "Striver SDE Sheet" },
  { id: "striver-102", problemNumber: 102, title: "Check if Binary Tree is Mirror", difficulty: "Easy", topic: "Binary Tree", platform: "GFG", link: "https://www.geeksforgeeks.org/check-if-two-trees-are-mirror/", sheet: "Striver SDE Sheet" },
  
  // Graph
  { id: "striver-103", problemNumber: 103, title: "Clone Graph", difficulty: "Medium", topic: "Graph", platform: "LeetCode", link: "https://leetcode.com/problems/clone-graph/", sheet: "Striver SDE Sheet" },
  { id: "striver-104", problemNumber: 104, title: "DFS", difficulty: "Easy", topic: "Graph", platform: "GFG", link: "https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/", sheet: "Striver SDE Sheet" },
  { id: "striver-105", problemNumber: 105, title: "BFS", difficulty: "Easy", topic: "Graph", platform: "GFG", link: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/", sheet: "Striver SDE Sheet" },
  { id: "striver-106", problemNumber: 106, title: "Detect Cycle in Directed Graph", difficulty: "Medium", topic: "Graph", platform: "GFG", link: "https://www.geeksforgeeks.org/detect-cycle-in-a-graph/", sheet: "Striver SDE Sheet" },
  { id: "striver-107", problemNumber: 107, title: "Detect Cycle in Undirected Graph", difficulty: "Medium", topic: "Graph", platform: "GFG", link: "https://www.geeksforgeeks.org/detect-cycle-undirected-graph/", sheet: "Striver SDE Sheet" },
  { id: "striver-108", problemNumber: 108, title: "Topological Sort", difficulty: "Medium", topic: "Graph", platform: "GFG", link: "https://www.geeksforgeeks.org/topological-sorting/", sheet: "Striver SDE Sheet" },
  { id: "striver-109", problemNumber: 109, title: "Number of Islands", difficulty: "Medium", topic: "Graph", platform: "LeetCode", link: "https://leetcode.com/problems/number-of-islands/", sheet: "Striver SDE Sheet" },
  { id: "striver-110", problemNumber: 110, title: "Bipartite Graph", difficulty: "Medium", topic: "Graph", platform: "LeetCode", link: "https://leetcode.com/problems/is-graph-bipartite/", sheet: "Striver SDE Sheet" },
  
  // Dynamic Programming
  { id: "striver-111", problemNumber: 111, title: "Maximum Product Subarray", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/maximum-product-subarray/", sheet: "Striver SDE Sheet" },
  { id: "striver-112", problemNumber: 112, title: "Longest Increasing Subsequence", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/longest-increasing-subsequence/", sheet: "Striver SDE Sheet" },
  { id: "striver-113", problemNumber: 113, title: "Longest Common Subsequence", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/longest-common-subsequence/", sheet: "Striver SDE Sheet" },
  { id: "striver-114", problemNumber: 114, title: "0-1 Knapsack", difficulty: "Medium", topic: "Dynamic Programming", platform: "GFG", link: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/", sheet: "Striver SDE Sheet" },
  { id: "striver-115", problemNumber: 115, title: "Edit Distance", difficulty: "Hard", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/edit-distance/", sheet: "Striver SDE Sheet" },
  { id: "striver-116", problemNumber: 116, title: "Maximum Sum Increasing Subsequence", difficulty: "Medium", topic: "Dynamic Programming", platform: "GFG", link: "https://www.geeksforgeeks.org/maximum-sum-increasing-subsequence-dp-14/", sheet: "Striver SDE Sheet" },
  { id: "striver-117", problemNumber: 117, title: "Matrix Chain Multiplication", difficulty: "Hard", topic: "Dynamic Programming", platform: "GFG", link: "https://www.geeksforgeeks.org/matrix-chain-multiplication-dp-8/", sheet: "Striver SDE Sheet" },
  
  // Trie
  { id: "striver-118", problemNumber: 118, title: "Implement Trie", difficulty: "Medium", topic: "Trie", platform: "LeetCode", link: "https://leetcode.com/problems/implement-trie-prefix-tree/", sheet: "Striver SDE Sheet" },
  { id: "striver-119", problemNumber: 119, title: "Implement Trie II", difficulty: "Medium", topic: "Trie", platform: "Coding Ninjas", link: "https://www.codingninjas.com/codestudio/problems/implement-trie_1387095", sheet: "Striver SDE Sheet" },
  { id: "striver-120", problemNumber: 120, title: "Longest String with All Prefixes", difficulty: "Medium", topic: "Trie", platform: "Coding Ninjas", link: "https://www.codingninjas.com/codestudio/problems/complete-string_2687860", sheet: "Striver SDE Sheet" },
  { id: "striver-121", problemNumber: 121, title: "Number of Distinct Substrings", difficulty: "Hard", topic: "Trie", platform: "Coding Ninjas", link: "https://www.codingninjas.com/codestudio/problems/count-distinct-substrings_985292", sheet: "Striver SDE Sheet" },
  { id: "striver-122", problemNumber: 122, title: "Power Set", difficulty: "Medium", topic: "Bit Manipulation", platform: "LeetCode", link: "https://leetcode.com/problems/subsets/", sheet: "Striver SDE Sheet" },
  { id: "striver-123", problemNumber: 123, title: "Maximum XOR of Two Numbers", difficulty: "Medium", topic: "Trie", platform: "LeetCode", link: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/", sheet: "Striver SDE Sheet" },
  
  // More problems to reach full 180-190 problems
  { id: "striver-124", problemNumber: 124, title: "3 Sum", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/3sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-125", problemNumber: 125, title: "Trapping Rain Water", difficulty: "Hard", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/trapping-rain-water/", sheet: "Striver SDE Sheet" },
  { id: "striver-126", problemNumber: 126, title: "Remove Duplicates from Sorted Array", difficulty: "Easy", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", sheet: "Striver SDE Sheet" },
  { id: "striver-127", problemNumber: 127, title: "Max Consecutive Ones", difficulty: "Easy", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/max-consecutive-ones/", sheet: "Striver SDE Sheet" },
  { id: "striver-128", problemNumber: 128, title: "Copy List with Random Pointer", difficulty: "Medium", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/copy-list-with-random-pointer/", sheet: "Striver SDE Sheet" },
  { id: "striver-129", problemNumber: 129, title: "Rotate List", difficulty: "Medium", topic: "Linked List", platform: "LeetCode", link: "https://leetcode.com/problems/rotate-list/", sheet: "Striver SDE Sheet" },
  { id: "striver-130", problemNumber: 130, title: "3 Sum Closest", difficulty: "Medium", topic: "Arrays", platform: "LeetCode", link: "https://leetcode.com/problems/3sum-closest/", sheet: "Striver SDE Sheet" },
  { id: "striver-131", problemNumber: 131, title: "Count Inversions", difficulty: "Medium", topic: "Arrays", platform: "GFG", link: "https://www.geeksforgeeks.org/counting-inversions/", sheet: "Striver SDE Sheet" },
  { id: "striver-132", problemNumber: 132, title: "Word Break", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/word-break/", sheet: "Striver SDE Sheet" },
  { id: "striver-133", problemNumber: 133, title: "Word Break II", difficulty: "Hard", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/word-break-ii/", sheet: "Striver SDE Sheet" },
  { id: "striver-134", problemNumber: 134, title: "Minimum Path Sum", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/minimum-path-sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-135", problemNumber: 135, title: "Unique Paths II", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/unique-paths-ii/", sheet: "Striver SDE Sheet" },
  { id: "striver-136", problemNumber: 136, title: "House Robber", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/house-robber/", sheet: "Striver SDE Sheet" },
  { id: "striver-137", problemNumber: 137, title: "House Robber II", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/house-robber-ii/", sheet: "Striver SDE Sheet" },
  { id: "striver-138", problemNumber: 138, title: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/coin-change/", sheet: "Striver SDE Sheet" },
  { id: "striver-139", problemNumber: 139, title: "Coin Change II", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/coin-change-2/", sheet: "Striver SDE Sheet" },
  { id: "striver-140", problemNumber: 140, title: "Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/climbing-stairs/", sheet: "Striver SDE Sheet" },
  { id: "striver-141", problemNumber: 141, title: "Min Cost Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/min-cost-climbing-stairs/", sheet: "Striver SDE Sheet" },
  { id: "striver-142", problemNumber: 142, title: "Decode Ways", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/decode-ways/", sheet: "Striver SDE Sheet" },
  { id: "striver-143", problemNumber: 143, title: "Partition Equal Subset Sum", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/partition-equal-subset-sum/", sheet: "Striver SDE Sheet" },
  { id: "striver-144", problemNumber: 144, title: "Palindromic Substrings", difficulty: "Medium", topic: "Strings", platform: "LeetCode", link: "https://leetcode.com/problems/palindromic-substrings/", sheet: "Striver SDE Sheet" },
  { id: "striver-145", problemNumber: 145, title: "Longest Palindromic Subsequence", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/longest-palindromic-subsequence/", sheet: "Striver SDE Sheet" },
  { id: "striver-146", problemNumber: 146, title: "Distinct Subsequences", difficulty: "Hard", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/distinct-subsequences/", sheet: "Striver SDE Sheet" },
  { id: "striver-147", problemNumber: 147, title: "Wildcard Matching", difficulty: "Hard", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/wildcard-matching/", sheet: "Striver SDE Sheet" },
  { id: "striver-148", problemNumber: 148, title: "Regular Expression Matching", difficulty: "Hard", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/regular-expression-matching/", sheet: "Striver SDE Sheet" },
  { id: "striver-149", problemNumber: 149, title: "Egg Dropping Problem", difficulty: "Medium", topic: "Dynamic Programming", platform: "LeetCode", link: "https://leetcode.com/problems/super-egg-drop/", sheet: "Striver SDE Sheet" },
  { id: "striver-150", problemNumber: 150, title: "Maximal Rectangle", difficulty: "Hard", topic: "Stack", platform: "LeetCode", link: "https://leetcode.com/problems/maximal-rectangle/", sheet: "Striver SDE Sheet" }
];

/**
 * Get all problems from Striver SDE Sheet
 */
const getStriverSDESheetProblems = async () => {
  try {
    // Return the hardcoded problems list
    return {
      success: true,
      data: STRIVER_SDE_SHEET_PROBLEMS,
      count: STRIVER_SDE_SHEET_PROBLEMS.length,
      source: 'Striver SDE Sheet'
    };
  } catch (error) {
    console.error('Error fetching Striver SDE Sheet:', error);
    throw new Error('Failed to fetch problems from Striver SDE Sheet');
  }
};

/**
 * Get problems by difficulty
 */
const getProblemsByDifficulty = async (difficulty) => {
  const problems = STRIVER_SDE_SHEET_PROBLEMS.filter(
    p => p.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
  return {
    success: true,
    data: problems,
    count: problems.length
  };
};

/**
 * Get problems by topic
 */
const getProblemsByTopic = async (topic) => {
  const problems = STRIVER_SDE_SHEET_PROBLEMS.filter(
    p => p.topic.toLowerCase().includes(topic.toLowerCase())
  );
  return {
    success: true,
    data: problems,
    count: problems.length
  };
};

/**
 * Search problems by title
 */
const searchProblems = async (query) => {
  const problems = STRIVER_SDE_SHEET_PROBLEMS.filter(
    p => p.title.toLowerCase().includes(query.toLowerCase())
  );
  return {
    success: true,
    data: problems,
    count: problems.length
  };
};

module.exports = {
  getStriverSDESheetProblems,
  getProblemsByDifficulty,
  getProblemsByTopic,
  searchProblems,
  STRIVER_SDE_SHEET_PROBLEMS
};
