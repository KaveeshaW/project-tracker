const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CategoryCard({ category, tasks, isActive, onClick }) {
  const total = tasks.filter((t) => t.category_id === category.id).length;
  const done = tasks.filter((t) => t.category_id === category.id && t.status === 'done').length;
  const pct = total === 0 ? 0 : (done / total) * 100;
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <button
      className={`category-card${isActive ? ' active' : ''}`}
      onClick={onClick}
      style={{ '--cat-color': category.color }}
    >
      <div className="ring-container">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="#ebecf0" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={RADIUS}
            fill="none"
            stroke={category.color}
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span className="ring-pct">{Math.round(pct)}%</span>
      </div>
      <span className="category-card-name">{category.name}</span>
      <span className="category-card-count">{done} / {total} done</span>
    </button>
  );
}
