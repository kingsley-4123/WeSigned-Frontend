// A list of beautiful Tailwind CSS gradient classes
const gradients = [
  "from-indigo-500 to-sky-400",
  "from-purple-500 to-pink-400",
  "from-emerald-500 to-lime-400",
  "from-rose-500 to-orange-400",
  "from-blue-600 to-cyan-400",
  "from-amber-500 to-yellow-400",
  "from-fuchsia-500 to-purple-400",
  "from-teal-500 to-emerald-400",
  "from-sky-500 to-indigo-400",
  "from-red-500 to-pink-400",
  "from-violet-500 to-indigo-400",
  "from-orange-500 to-amber-400",
  "from-cyan-500 to-teal-400",
  "from-green-500 to-lime-400",
  "from-pink-500 to-rose-400",
  "from-slate-500 to-gray-400",
  "from-yellow-500 to-orange-400",
  "from-lime-500 to-green-400",
  "from-blue-500 to-purple-400",
  "from-rose-400 to-fuchsia-500"
];

// Function to return a random gradient
export function getRandomGradient() {
  const randomIndex = Math.floor(Math.random() * gradients.length);
  return gradients[randomIndex];
}

export default gradients;
