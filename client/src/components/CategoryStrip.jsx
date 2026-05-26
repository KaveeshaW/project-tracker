import CategoryCard from './CategoryCard';

export default function CategoryStrip({ categories, tasks, activeFilter, onFilterChange }) {
  if (categories.length === 0) return null;

  return (
    <div className="category-strip">
      {categories.map((c) => (
        <CategoryCard
          key={c.id}
          category={c}
          tasks={tasks}
          isActive={activeFilter === c.id}
          onClick={() => onFilterChange(c.id)}
        />
      ))}
    </div>
  );
}
