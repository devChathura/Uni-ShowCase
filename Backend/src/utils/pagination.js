const getPaginationOptions = (page, limit, defaultLimit = 10, maxLimit = 100) => {
  let pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    pageNum = 1;
  }

  let limitNum = parseInt(limit, 10);
  if (isNaN(limitNum) || limitNum < 1) {
    limitNum = defaultLimit;
  } else if (limitNum > maxLimit) {
    limitNum = maxLimit;
  }

  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
};

module.exports = getPaginationOptions;
