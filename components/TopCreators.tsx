export default function TopCreators() {
  const creators = [
    { id: 1, initial: 'B' },
    { id: 2, initial: 'h' },
    { id: 3, initial: 'B' },
    { id: 4, initial: 'a' },
    { id: 5, initial: '$' },
  ];

  return (
    <div className="flex justify-center items-center space-x-4">
      {creators.map((creator) => (
        <div
          key={creator.id}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
        >
          {creator.initial}
        </div>
      ))}
    </div>
  );
}