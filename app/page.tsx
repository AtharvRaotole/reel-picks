import MovieSearch from './components/MovieSearch';

export default function Home() {
  return (
    <div className="w-full">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          Discover Movies
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed font-light">
          Search for your favorite movies, explore new releases, and build your personal collection.
        </p>
      </div>
      <MovieSearch />
    </div>
  );
}
