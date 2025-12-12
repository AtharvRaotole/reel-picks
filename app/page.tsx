import MovieSearch from './components/MovieSearch';

export default function Home() {
  return (
    <div className="w-full">
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          Discover Movies
        </h1>
        <p className="text-lg sm:text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Search for your favorite movies, explore new releases, and build your personal collection.
        </p>
      </div>
      <MovieSearch />
    </div>
  );
}
