export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Solved" | "Attempted" | "Not Started";
export type Language = "cpp" | "java" | "python" | "javascript";

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: "Pass" | "Fail";
}

export interface Submission {
  id: number;
  challengeId: number | string;
  code: string;
  language: Language;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded";
  runtime: string;
  memory: string;
  submittedAt: string;
  testCases: TestCase[];
}

export const tags = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Binary Search",
  "Tree",
  "Graph",
  "Depth-First Search",
  "Breadth-First Search",
  "Two Pointers",
  "Stack",
  "Recursion",
];

export const challenges: Challenge[] = [
  {
    id: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",

    acceptanceRate: 49.2,
    status: "Solved",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    inputDescription: "`nums`: an array of integers, `target`: an integer",
    outputDescription: "An array of two indices",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    createAt: new Date(),
  },
  {
    id: 2,
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "Medium",

    acceptanceRate: 40.1,
    status: "Attempted",
    description: `You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
    inputDescription: "Two linked lists representing non-negative integers",
    outputDescription: "A linked list representing the sum",
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros.",
    ],
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807.",
      },
      {
        input: "l1 = [0], l2 = [0]",
        output: "[0]",
      },
    ],
    createAt: new Date(),
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",

    acceptanceRate: 33.8,
    status: "Not Started",
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    inputDescription: "`s`: a string",
    outputDescription:
      "An integer representing the length of the longest substring",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
    ],
    createAt: new Date(),
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "Hard",

    acceptanceRate: 35.4,
    status: "Not Started",
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.`,
    inputDescription: "`nums1`: sorted array, `nums2`: sorted array",
    outputDescription: "A double representing the median",
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2.",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation:
          "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
      },
    ],
    createAt: new Date(),
  },
  {
    id: 5,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",

    acceptanceRate: 40.5,
    status: "Solved",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputDescription: "`s`: a string containing only parentheses characters",
    outputDescription: "A boolean indicating if the string is valid",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    createAt: new Date(),
  },
  {
    id: 6,
    title: "Merge K Sorted Lists",
    slug: "merge-k-sorted-lists",
    difficulty: "Hard",

    acceptanceRate: 48.9,
    status: "Not Started",
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
    inputDescription: "`lists`: an array of k sorted linked lists",
    outputDescription: "A single merged sorted linked list",
    constraints: [
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4",
      "lists[i] is sorted in ascending order.",
      "The sum of lists[i].length will not exceed 10^4.",
    ],
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
      },
      {
        input: "lists = []",
        output: "[]",
      },
    ],
    createAt: new Date(),
  },
  {
    id: 7,
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Medium",

    acceptanceRate: 50.1,
    status: "Solved",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    inputDescription: "`nums`: an array of integers",
    outputDescription: "An integer representing the maximum subarray sum",
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
    ],
    createAt: new Date(),
  },
  {
    id: 8,
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "Easy",

    acceptanceRate: 51.2,
    status: "Attempted",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    inputDescription: "`n`: number of steps",
    outputDescription: "Number of distinct ways to climb",
    constraints: ["1 <= n <= 45"],
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation:
          "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps",
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways to climb to the top.",
      },
    ],
    createAt: new Date(),
  },
];

export const sampleSubmission: Submission = {
  id: 1,
  challengeId: 1,
  code: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}`,
  language: "javascript",
  status: "Accepted",
  runtime: "56 ms",
  memory: "42.8 MB",
  submittedAt: "2024-01-15T10:30:00Z",
  testCases: [
    {
      id: 1,
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      status: "Pass",
    },
    {
      id: 2,
      input: "nums = [3,2,4], target = 6",
      expectedOutput: "[1,2]",
      actualOutput: "[1,2]",
      status: "Pass",
    },
    {
      id: 3,
      input: "nums = [3,3], target = 6",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      status: "Pass",
    },
  ],
};

export const languageLabels: Record<Language, string> = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
};

export const defaultCode: Record<Language, string> = {
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
  python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
}`,
};
