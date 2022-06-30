// https://dzone.com/articles/react-autosuggest-search-with-google-firestore

export const generateKeywords = (name) => {
  const wordArr = name.toLowerCase().split(' ');
  const searchableKeywords = [];
  let prevKey = '';
  for (const word of wordArr) {
    const charArr = word.toLowerCase().split('');
    for (const char of charArr) {
      const keyword = prevKey + char;
      searchableKeywords.push(keyword);
      prevKey = keyword;
    }
    prevKey = '';
  }
  return searchableKeywords;
};