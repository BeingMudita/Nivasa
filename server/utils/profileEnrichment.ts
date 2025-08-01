const eatingHabits = ["Omnivore", "Vegetarian", "Vegan", "Pescatarian"];
const cleanlinessScores = [1, 2, 3, 4, 5];
const sociabilityLevels = ["Quiet", "Balanced", "Outgoing"];
const sharingComfort = ["Low", "Medium", "High"];

function enrichProfile(user: any) {
  // For random selection, use a helper:
  function weightedRandom(arr: any[], weights: number[]) {
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    let i = 0;
    while (r >= 0 && i < arr.length) {
      r -= weights[i] ?? 0;
      if (r < 0) return arr[i];
      i++;
    }
    return arr[arr.length - 1];
  }

  const sleep = user.sleep;

  let eating: string;
  if (sleep === "Early") {
    eating = weightedRandom(eatingHabits, [40, 30, 20, 10]);
  } else if (sleep === "On-time") {
    eating = weightedRandom(eatingHabits, [30, 25, 25, 20]);
  } else {
    eating = weightedRandom(eatingHabits, [10, 15, 25, 50]);
  }
  user.eating = eating;

  if (["Vegetarian", "Vegan"].includes(eating)) {
    user.cleanliness = weightedRandom(cleanlinessScores, [5, 10, 20, 35, 30]);
  } else {
    user.cleanliness = weightedRandom(cleanlinessScores, [15, 25, 30, 20, 10]);
  }

  if (sleep === "Early") {
    user.sociability = weightedRandom(sociabilityLevels, [40, 40, 20]);
  } else if (sleep === "On-time") {
    user.sociability = weightedRandom(sociabilityLevels, [20, 50, 30]);
  } else {
    user.sociability = weightedRandom(sociabilityLevels, [10, 30, 60]);
  }

  const sociability = user.sociability;
  if (sociability === "Quiet") {
    user.sharing = weightedRandom(sharingComfort, [50, 40, 10]);
  } else if (sociability === "Balanced") {
    user.sharing = weightedRandom(sharingComfort, [20, 60, 20]);
  } else {
    user.sharing = weightedRandom(sharingComfort, [5, 30, 65]);
  }

  return user;
}

module.exports = { enrichProfile };
