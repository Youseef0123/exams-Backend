// Quiz categories constants
export const QUIZ_CATEGORIES = [
  'Mathematics',
  'Science',
  'History',
  'Geography',
  'Literature',
  'Computer Science',
  'General Knowledge'
];

export const isValidCategory = (category) => {
  return QUIZ_CATEGORIES.includes(category);
};