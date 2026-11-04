export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-emerald-700 px-4 py-6 text-white sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">CleanUp Map</h1>
        <p className="mt-1 text-emerald-100 sm:text-lg">See it. Map it. Clean it. Together.</p>
      </header>
      <main className="flex flex-1 items-center justify-center p-4 text-center text-zinc-600 dark:text-zinc-400">
        <p>The litter map is coming soon.</p>
      </main>
    </div>
  );
}
