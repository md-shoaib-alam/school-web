'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ToggleLeft, ToggleRight, Blocks, Plus, Edit, Zap, Star, Rocket, Eye, EyeOff,
  Check, X, Power, PowerOff, Shield, FlaskConical, Gem, Crown,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetedPlans: string[];
  category: 'core' | 'premium' | 'enterprise' | 'beta';
  icon: React.ElementType;
}

type Plan = 'All' | 'Basic' | 'Standard+' | 'Premium+' | 'Enterprise';

// ── Initial Data ───────────────────────────────────────────────

const initialFlags: FeatureFlag[] = [
  {
    id: 'ai-grading',
    name: 'AI-Powered Grading',
    description: 'Automated essay and assignment grading using machine learning models with teacher review.',
    enabled: true,
    rolloutPercentage: 100,
    targetedPlans: ['Premium+'],
    category: 'premium',
    icon: Zap,
  },
  {
    id: 'bus-tracking',
    name: 'Live Bus Tracking',
    description: 'Real-time GPS tracking of school buses with parent notifications for arrivals and delays.',
    enabled: true,
    rolloutPercentage: 100,
    targetedPlans: ['Standard+'],
    category: 'core',
    icon: Eye,
  },
  {
    id: 'video-conferencing',
    name: 'Video Conferencing',
    description: 'Built-in video calling for virtual classes, parent-teacher meetings, and staff collaboration.',
    enabled: false,
    rolloutPercentage: 0,
    targetedPlans: ['All'],
    category: 'beta',
    icon: EyeOff,
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Deep-dive analytics dashboards with custom reports, cohort analysis, and predictive insights.',
    enabled: true,
    rolloutPercentage: 80,
    targetedPlans: ['Premium+'],
    category: 'premium',
    icon: Rocket,
  },
  {
    id: 'multi-language',
    name: 'Multi-Language Support',
    description: 'Platform interface available in 12+ languages with automatic locale detection.',
    enabled: true,
    rolloutPercentage: 100,
    targetedPlans: ['All'],
    category: 'core',
    icon: Blocks,
  },
  {
    id: 'parent-app',
    name: 'Parent Mobile App',
    description: 'Dedicated mobile app for parents with push notifications, fee payments, and real-time updates.',
    enabled: true,
    rolloutPercentage: 60,
    targetedPlans: ['Standard+'],
    category: 'core',
    icon: Star,
  },
  {
    id: 'online-exam',
    name: 'Online Exam System',
    description: 'Conduct secure online exams with plagiarism detection, time limits, and auto-grading.',
    enabled: true,
    rolloutPercentage: 50,
    targetedPlans: ['Premium+'],
    category: 'premium',
    icon: Edit,
  },
  {
    id: 'fee-reminder',
    name: 'Fee Auto-Reminder',
    description: 'Automated SMS, email, and push notification reminders for upcoming and overdue fee payments.',
    enabled: true,
    rolloutPercentage: 100,
    targetedPlans: ['All'],
    category: 'core',
    icon: ToggleRight,
  },
  {
    id: 'custom-reports',
    name: 'Custom Report Builder',
    description: 'Drag-and-drop report builder for creating custom academic and administrative reports.',
    enabled: false,
    rolloutPercentage: 0,
    targetedPlans: ['Enterprise'],
    category: 'enterprise',
    icon: Edit,
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Full REST API access with OAuth2 authentication for third-party integrations.',
    enabled: true,
    rolloutPercentage: 30,
    targetedPlans: ['Enterprise'],
    category: 'enterprise',
    icon: Shield,
  },
];

// ── Helpers ────────────────────────────────────────────────────

const planBadgeColors: Record<string, string> = {
  'All': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  'Basic': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  'Standard+': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
  'Premium+': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700',
  'Enterprise': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700',
};

const categoryIcons: Record<string, React.ElementType> = {
  core: Blocks,
  premium: Crown,
  enterprise: Gem,
  beta: FlaskConical,
};

const categoryColors: Record<string, string> = {
  core: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
  premium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
  enterprise: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30',
  beta: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
};

// ── New Flag Dialog ────────────────────────────────────────────

function NewFlagDialog({ onAdd }: { onAdd: (flag: FeatureFlag) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'core' | 'premium' | 'enterprise' | 'beta'>('core');
  const [plan, setPlan] = useState('All');

  const handleCreate = () => {
    if (!name.trim()) return;
    const newFlag: FeatureFlag = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      enabled: false,
      rolloutPercentage: 0,
      targetedPlans: [plan as Plan],
      category,
      icon: categoryIcons[category] || Blocks,
    };
    onAdd(newFlag);
    setName('');
    setDescription('');
    setCategory('core');
    setPlan('All');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-rose-500" />
            Create Feature Flag
          </DialogTitle>
          <DialogDescription>
            Add a new feature flag to control feature rollout across tenants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="flag-name">Flag Name</Label>
            <Input
              id="flag-name"
              placeholder="e.g., Dark Mode"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flag-desc">Description</Label>
            <Input
              id="flag-desc"
              placeholder="Brief description of the feature..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as FeatureFlag['category'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Plans</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Standard+">Standard+</SelectItem>
                  <SelectItem value="Premium+">Premium+</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Feature Flag Card ──────────────────────────────────────────

function FeatureFlagCard({
  flag,
  onToggle,
  onRolloutChange,
}: {
  flag: FeatureFlag;
  onToggle: (id: string) => void;
  onRolloutChange: (id: string, value: number) => void;
}) {
  const IconComp = flag.icon;

  return (
    <Card
      className={`relative overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md ${
        flag.enabled
          ? 'border-l-emerald-500 bg-white dark:bg-gray-900'
          : 'border-l-gray-300 bg-gray-50 dark:bg-gray-900/50'
      }`}
    >
      <CardContent className="p-5">
        {/* Header: Icon + Name + Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                flag.enabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              }`}
            >
              <IconComp className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">{flag.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{flag.description}</p>
            </div>
          </div>
          <Switch
            checked={flag.enabled}
            onCheckedChange={() => onToggle(flag.id)}
            className="shrink-0"
          />
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 mt-3">
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold px-2 py-0 ${
              flag.enabled
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            }`}
          >
            {flag.enabled ? (
              <><ToggleRight className="h-3 w-3 mr-1" /> Enabled</>
            ) : (
              <><ToggleLeft className="h-3 w-3 mr-1" /> Disabled</>
            )}
          </Badge>
          {flag.targetedPlans.map((plan) => (
            <Badge
              key={plan}
              variant="outline"
              className={`text-[10px] px-2 py-0 ${planBadgeColors[plan] || planBadgeColors['All']}`}
            >
              {plan}
            </Badge>
          ))}
        </div>

        {/* Rollout Slider */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Rollout</Label>
            <span className={`text-xs font-bold tabular-nums ${
              flag.enabled ? 'text-emerald-600' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {flag.rolloutPercentage}%
            </span>
          </div>
          <Slider
            value={[flag.rolloutPercentage]}
            onValueChange={([v]) => onRolloutChange(flag.id, v)}
            disabled={!flag.enabled}
            max={100}
            step={5}
            className={`w-full ${flag.enabled ? '[&_[data-slot=slider-range]]:bg-emerald-500' : '[&_[data-slot=slider-range]]:bg-gray-300 dark:bg-gray-600'}`}
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Category Panel ─────────────────────────────────────────────

function CategoryPanel({
  flags,
  category,
  onToggle,
  onRolloutChange,
  onBulkEnable,
  onBulkDisable,
}: {
  flags: FeatureFlag[];
  category: string;
  onToggle: (id: string) => void;
  onRolloutChange: (id: string, value: number) => void;
  onBulkEnable: (category: string) => void;
  onBulkDisable: (category: string) => void;
}) {
  const CategoryIcon = categoryIcons[category] || Blocks;
  const colorClass = categoryColors[category] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900';
  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-4">
      {/* Category Header with Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClass}`}>
            <CategoryIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold capitalize">{category}</h3>
            <p className="text-xs text-muted-foreground">
              {enabledCount}/{flags.length} enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 text-emerald-600 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/30"
            onClick={() => onBulkEnable(category)}
          >
            <Power className="h-3 w-3" />
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 text-red-600 border-red-200 dark:border-red-700 hover:bg-red-50 dark:bg-red-900/30"
            onClick={() => onBulkDisable(category)}
          >
            <PowerOff className="h-3 w-3" />
            Disable All
          </Button>
        </div>
      </div>

      {/* Flags Grid */}
      {flags.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Blocks className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">No feature flags in this category</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.map((flag) => (
            <FeatureFlagCard
              key={flag.id}
              flag={flag}
              onToggle={onToggle}
              onRolloutChange={onRolloutChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function SuperAdminFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);

  const handleToggle = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const enabled = !f.enabled;
        return {
          ...f,
          enabled,
          rolloutPercentage: enabled ? (f.rolloutPercentage === 0 ? 10 : f.rolloutPercentage) : 0,
        };
      })
    );
  };

  const handleRolloutChange = (id: string, value: number) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rolloutPercentage: value } : f))
    );
  };

  const handleBulkEnable = (category: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.category === category ? { ...f, enabled: true, rolloutPercentage: f.rolloutPercentage || 100 } : f
      )
    );
  };

  const handleBulkDisable = (category: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.category === category ? { ...f, enabled: false, rolloutPercentage: 0 } : f
      )
    );
  };

  const handleAddFlag = (flag: FeatureFlag) => {
    setFlags((prev) => [...prev, flag]);
  };

  const getFlagsByCategory = (cat: string) => flags.filter((f) => f.category === cat);

  const totalEnabled = flags.filter((f) => f.enabled).length;
  const totalCount = flags.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Blocks className="h-6 w-6 text-rose-500" />
            Feature Flags
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control feature rollouts and access across your platform tenants
          </p>
        </div>
        <NewFlagDialog onAdd={handleAddFlag} />
      </div>

      {/* Summary Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{totalEnabled}</p>
                <p className="text-[11px] text-muted-foreground">Enabled</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <X className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{totalCount - totalEnabled}</p>
                <p className="text-[11px] text-muted-foreground">Disabled</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
                <Blocks className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{totalCount}</p>
                <p className="text-[11px] text-muted-foreground">Total Flags</p>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Enabled
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" />
                Disabled
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs defaultValue="core" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="core" className="gap-1.5 text-xs sm:text-sm">
            <Blocks className="h-3.5 w-3.5" />
            Core
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px] px-1.5">
              {getFlagsByCategory('core').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="premium" className="gap-1.5 text-xs sm:text-sm">
            <Crown className="h-3.5 w-3.5" />
            Premium
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px] px-1.5">
              {getFlagsByCategory('premium').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="gap-1.5 text-xs sm:text-sm">
            <Gem className="h-3.5 w-3.5" />
            Enterprise
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px] px-1.5">
              {getFlagsByCategory('enterprise').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="beta" className="gap-1.5 text-xs sm:text-sm">
            <FlaskConical className="h-3.5 w-3.5" />
            Beta
            <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px] px-1.5">
              {getFlagsByCategory('beta').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="core">
          <CategoryPanel
            flags={getFlagsByCategory('core')}
            category="core"
            onToggle={handleToggle}
            onRolloutChange={handleRolloutChange}
            onBulkEnable={handleBulkEnable}
            onBulkDisable={handleBulkDisable}
          />
        </TabsContent>

        <TabsContent value="premium">
          <CategoryPanel
            flags={getFlagsByCategory('premium')}
            category="premium"
            onToggle={handleToggle}
            onRolloutChange={handleRolloutChange}
            onBulkEnable={handleBulkEnable}
            onBulkDisable={handleBulkDisable}
          />
        </TabsContent>

        <TabsContent value="enterprise">
          <CategoryPanel
            flags={getFlagsByCategory('enterprise')}
            category="enterprise"
            onToggle={handleToggle}
            onRolloutChange={handleRolloutChange}
            onBulkEnable={handleBulkEnable}
            onBulkDisable={handleBulkDisable}
          />
        </TabsContent>

        <TabsContent value="beta">
          <CategoryPanel
            flags={getFlagsByCategory('beta')}
            category="beta"
            onToggle={handleToggle}
            onRolloutChange={handleRolloutChange}
            onBulkEnable={handleBulkEnable}
            onBulkDisable={handleBulkDisable}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
