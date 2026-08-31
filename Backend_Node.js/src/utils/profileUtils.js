const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const calculateExperienceDuration = (startDate, endDate) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
};

const calculateCompleteness = (profile) => {
  const weights = {
    fatherName: 8,
    motherName: 8,
    dateOfBirth: 10,
    gender: 8,
    bloodGroup: 5,
    profession: 8,
    category: 8,
    income: 8,
    disability: 5
  };

  let totalWeight = 0;
  let filledWeight = 0;

  for (const [field, weight] of Object.entries(weights)) {
    totalWeight += weight;
    const value = field === 'disability' ? profile.disability?.hasDisability : profile[field];
    if (value !== null && value !== undefined && value !== '' && value !== false) {
      filledWeight += weight;
    }
  }

  return Math.round((filledWeight / totalWeight) * 100);
};

module.exports = {
  calculateAge,
  calculateExperienceDuration,
  calculateCompleteness
};
