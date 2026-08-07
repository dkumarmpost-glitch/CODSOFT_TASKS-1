import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selected === cat
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  );
}
