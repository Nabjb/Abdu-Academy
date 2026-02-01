'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CourseFiltersProps {
  filters: {
    category: string;
    level: string;
    priceRange: [number, number];
  };
  onFilterChange: (filters: Partial<CourseFiltersProps['filters']>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'business', label: 'Business' },
];

const levels = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function CourseFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: CourseFiltersProps) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <Label htmlFor="category" className="mb-2 block text-sm font-medium">
            Category
          </Label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <Label htmlFor="level" className="mb-2 block text-sm font-medium">
            Level
          </Label>
          <select
            id="level"
            value={filters.level}
            onChange={(e) => onFilterChange({ level: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="1000"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  onFilterChange({
                    priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]],
                  })
                }
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="Min"
              />
              <input
                type="number"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  onFilterChange({
                    priceRange: [filters.priceRange[0], parseInt(e.target.value) || 1000],
                  })
                }
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              value={filters.priceRange[1]}
              onChange={(e) =>
                onFilterChange({
                  priceRange: [filters.priceRange[0], parseInt(e.target.value)],
                })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
