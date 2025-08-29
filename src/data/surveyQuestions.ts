export const surveyQuestions = [
  {
    id: "sleep",
    question: "When do you usually go to bed? 🌙",
    description: "Your sleep schedule helps us match you with compatible roommates",
    options: [
      { label: "Early bird - asleep by 10 PM 🦉", value: "Early" },
      { label: "Balanced - around 11 PM-12 AM ⏰", value: "On-time" },
      { label: "Night owl - up past midnight 🦉", value: "Night owl" },
    ],
    mlField: "sleep"
  },
  {
    id: "eating",
    question: "What's your dietary preference? 🍽️",
    description: "Helps us match food compatibility",
    options: [
      { label: "Vegetarian 🌱", value: "Vegetarian" },
      { label: "Vegan 🌿", value: "Vegan" },
      { label: "Flexitarian (mostly veg) 🥗", value: "Flexitarian" },
      { label: "Non-vegetarian 🍗", value: "Non-vegetarian" },
      { label: "Eggetarian (veg + eggs) 🥚", value: "Eggetarian" },
    ],
    mlField: "eating"
  },
  {
    id: "cleanliness",
    question: "How tidy are you? 🧹",
    description: "Be honest - this helps avoid conflicts!",
    options: [
      { label: "Very tidy - everything in its place ✨", value: 5 },
      { label: "Mostly organized 🧼", value: 4 },
      { label: "Moderately tidy 👍", value: 3 },
      { label: "A bit messy but functional 🌀", value: 2 },
      { label: "Creative chaos - I know where everything is 😅", value: 1 },
    ],
    mlField: "cleanliness"
  },
  {
    id: "sociability",
    question: "How social are you at home? 🗣️",
    description: "Do you prefer quiet time or hanging out together?",
    options: [
      { label: "Quiet & private - need my space 🤫", value: "Quiet" },
      { label: "Balanced - some alone time, some social 🧘", value: "Balanced" },
      { label: "Social butterfly - love hanging out 🎉", value: "Social/Chill" },
    ],
    mlField: "sociability"
  },
  {
    id: "sharing",
    question: "How do you feel about sharing food? 🍕",
    description: "This helps us match sharing preferences",
    options: [
      { label: "Prefer keeping things separate 🙅‍♂️", value: "Not comfortable" },
      { label: "Okay with some sharing 🤝", value: "Somewhat okay" },
      { label: "Love sharing food! 🥡", value: "Very open" },
    ],
    mlField: "sharing"
  },
];