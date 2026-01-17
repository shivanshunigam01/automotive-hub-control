import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface TCOItem {
  key: string;
  label: string;
  value: number;
  unit: 'monthly' | 'yearly' | 'one-time';
}

interface TCOSectionProps {
  tcoItems: TCOItem[];
  onChange: (items: TCOItem[]) => void;
}

const defaultTCOFields = [
  { key: 'fuel_cost', label: 'Fuel / Energy Cost', unit: 'monthly' as const },
  { key: 'maintenance_cost', label: 'Maintenance Cost', unit: 'yearly' as const },
  { key: 'service_cost', label: 'Service Interval Cost', unit: 'yearly' as const },
  { key: 'insurance', label: 'Insurance Estimate', unit: 'yearly' as const },
  { key: 'depreciation', label: 'Depreciation', unit: 'yearly' as const },
];

export function TCOSection({ tcoItems, onChange }: TCOSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState<'monthly' | 'yearly' | 'one-time'>('yearly');

  function updateItemValue(key: string, value: number) {
    const newItems = tcoItems.map((item) =>
      item.key === key ? { ...item, value } : item
    );
    onChange(newItems);
  }

  function addDefaultField(field: typeof defaultTCOFields[0]) {
    if (tcoItems.some((item) => item.key === field.key)) return;
    onChange([...tcoItems, { ...field, value: 0 }]);
  }

  function addCustomField() {
    if (!newFieldLabel.trim()) return;
    const key = `custom_${Date.now()}`;
    onChange([
      ...tcoItems,
      { key, label: newFieldLabel, value: parseFloat(newFieldValue) || 0, unit: newFieldUnit },
    ]);
    setNewFieldLabel('');
    setNewFieldValue('');
    setNewFieldUnit('yearly');
  }

  function removeField(key: string) {
    onChange(tcoItems.filter((item) => item.key !== key));
  }

  const totalYearlyCost = tcoItems.reduce((sum, item) => {
    if (item.unit === 'monthly') return sum + item.value * 12;
    if (item.unit === 'yearly') return sum + item.value;
    return sum;
  }, 0);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-accent" />
                  Total Cost of Ownership (TCO)
                </CardTitle>
                <CardDescription>
                  Add cost breakdown for customer transparency
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {tcoItems.length > 0 && (
                  <span className="text-sm font-medium text-muted-foreground">
                    Est. ₹{totalYearlyCost.toLocaleString('en-IN')}/year
                  </span>
                )}
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Quick Add Default Fields */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Quick Add</Label>
              <div className="flex flex-wrap gap-2">
                {defaultTCOFields.map((field) => {
                  const exists = tcoItems.some((item) => item.key === field.key);
                  return (
                    <Button
                      key={field.key}
                      type="button"
                      variant={exists ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => addDefaultField(field)}
                      disabled={exists}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {field.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Added Fields */}
            {tcoItems.length > 0 && (
              <div className="space-y-3">
                <Label>Cost Breakdown</Label>
                {tcoItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.unit === 'one-time' ? 'One-time' : `Per ${item.unit.replace('ly', '')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        value={item.value || ''}
                        onChange={(e) => updateItemValue(item.key, parseFloat(e.target.value) || 0)}
                        className="w-32"
                        placeholder="0"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(item.key)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Custom Field */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Add Custom Field</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="Field name"
                  className="flex-1 min-w-[150px]"
                />
                <Input
                  type="number"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="Value (₹)"
                  className="w-32"
                />
                <select
                  value={newFieldUnit}
                  onChange={(e) => setNewFieldUnit(e.target.value as typeof newFieldUnit)}
                  className="px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
                <Button type="button" variant="outline" onClick={addCustomField}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TCO Summary */}
            {tcoItems.length > 0 && (
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Estimated Annual TCO</p>
                    <p className="text-xs text-muted-foreground">Based on entered values</p>
                  </div>
                  <p className="text-xl font-bold text-accent">
                    ₹{totalYearlyCost.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
