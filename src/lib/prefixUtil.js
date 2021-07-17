import profile from '../../profile';

export const getPrefix = (customerPrefix) => {
  if (customerPrefix) return customerPrefix;
  return profile.prefix;
};
