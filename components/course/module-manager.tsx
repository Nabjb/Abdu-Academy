'use client';

import { useState } from 'react';
import { ModuleForm } from './module-form';
import { LessonManager } from './lesson-manager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, GripVertical, ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';

interface Module {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
}

interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
  onModulesChange: () => void;
}

export function ModuleManager({ courseId, modules, onModulesChange }: ModuleManagerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleAddModule = async (data: { title: string; description: string }) => {
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          ...data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create module');
      }

      setShowAddModule(false);
      onModulesChange();
    } catch (error: any) {
      alert(error.message || 'Failed to create module');
    }
  };

  const handleUpdateModule = async (moduleId: string, data: { title: string; description: string }) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update module');
      }

      setEditingModule(null);
      onModulesChange();
    } catch (error: any) {
      alert(error.message || 'Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? All lessons in this module will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete module');
      }

      onModulesChange();
    } catch (error: any) {
      alert(error.message || 'Failed to delete module');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modules</h2>
        {!showAddModule && (
          <Button onClick={() => setShowAddModule(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        )}
      </div>

      {showAddModule && (
        <Card className="p-4">
          <ModuleForm
            onSubmit={handleAddModule}
            onCancel={() => setShowAddModule(false)}
          />
        </Card>
      )}

      {modules.length === 0 && !showAddModule ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No modules yet. Create your first module to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => (
            <Card key={module.moduleId} className="overflow-hidden">
              {editingModule === module.moduleId ? (
                <div className="p-4">
                  <ModuleForm
                    initialData={module}
                    onSubmit={(data) => handleUpdateModule(module.moduleId, data)}
                    onCancel={() => setEditingModule(null)}
                  />
                </div>
              ) : (
                <>
                  <div className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <button
                      onClick={() => toggleModule(module.moduleId)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      {expandedModules.has(module.moduleId) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingModule(module.moduleId)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteModule(module.moduleId)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {expandedModules.has(module.moduleId) && (
                    <div className="border-t bg-gray-50 p-4">
                      <LessonManager
                        moduleId={module.moduleId}
                        courseId={courseId}
                        onLessonsChange={onModulesChange}
                      />
                    </div>
                  )}
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
