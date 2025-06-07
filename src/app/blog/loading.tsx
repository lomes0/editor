export default function BlogIndexLoading() {
  return (
    <main className="prose mx-auto py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      
      <ul className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </li>
        ))}
      </ul>
    </main>
  );
}
