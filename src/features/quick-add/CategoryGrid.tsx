import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryFormSheet } from "@/features/settings/CategoryFormSheet";
import type { BudgetCategory } from "@/types";

interface CategoryGridProps {
  categories: BudgetCategory[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  showAdd?: boolean;
  className?: string;
}

export function CategoryGrid({
  categories,
  selectedId,
  onSelect,
  showAdd,
  className,
}: CategoryGridProps) {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  if (categories.length === 0) {
    return (
      <div className="text-text-muted py-4 text-center text-sm">
        Chưa có danh mục nào
      </div>
    );
  }

  return (
    <div className={`${className} max-h-[160px] overflow-y-auto`}>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => category.id != null && onSelect(category.id)}
              className={`flex h-11 items-center gap-2 rounded-sm border px-3 text-left transition-all ${
                isSelected
                  ? "border-accent bg-accent-bg"
                  : "border-border bg-white active:bg-surface"
              }`}
            >
              <span className="text-xl leading-none shrink-0">
                {category.icon}
              </span>
              <span
                className={`truncate text-[13px] font-medium ${
                  isSelected ? "text-accent-dark" : "text-text"
                }`}
              >
                {category.name}
              </span>
            </button>
          );
        })}

        {/* Add new category tile - if showAdd is enabled */}
        {showAdd && (
          <button
            type="button"
            onClick={() => setAddCategoryOpen(true)}
            className="flex h-11 items-center justify-center gap-1.5 rounded-sm border-[1.5px] border-dashed border-border bg-transparent text-text-hint text-[12px] font-medium transition-colors active:bg-surface"
          >
            <Plus size={14} />
            Thêm mục
          </button>
        )}
      </div>

      {/* Add new category sheet */}
      <CategoryFormSheet
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSave={async (data) => {
          const count = await db.categories.count();
          const id = await db.categories.add({
            ...data,
            sortOrder: count,
            color: "#F5C043", // default color since it is required
          });
          await useCategoryStore.getState().loadCategories();
          onSelect(id as number);
          setAddCategoryOpen(false);
        }}
      />
    </div>
  );
}
