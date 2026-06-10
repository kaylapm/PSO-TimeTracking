'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'urql';
import { useAuth, useCanAccessInvoices } from '@/lib/auth-context';
import { gql } from '@/lib/gql';
import { formatDuration } from '@/lib/time-utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Timer } from '@/components/timer';
import {
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  Settings,
} from 'lucide-react';

const DASHBOARD_QUERY = gql(`
  query Dashboard($teamId: ID!, $thisWeekStart: DateTime!, $thisMonthStart: DateTime!) {
    thisWeekEntries: timeEntries(teamId: $teamId, from: $thisWeekStart, limit: 1000) {
      nodes {
        id
        durationSeconds
        startedAt
        stoppedAt
        note
        billable
        user {
          id
          name
          displayName
        }
        project {
          id
          name
          code
        }
        task {
          id
          name
        }
      }
    }
    thisMonthEntries: timeEntries(teamId: $teamId, from: $thisMonthStart, limit: 1000) {
      nodes {
        id
        durationSeconds
        billable
      }
    }
    unbilledEntries: timeEntries(teamId: $teamId, uninvoicedOnly: true, billable: true, limit: 1000) {
      nodes {
        id
        durationSeconds
        amountCents
      }
    }
    recentEntries: timeEntries(teamId: $teamId, limit: 10, orderBy: "started_at", order: "desc") {
      nodes {
        id
        startedAt
        stoppedAt
        durationSeconds
        note
        user {
          id
          name
          displayName
        }
        project {
          id
          name
          code
          color
        }
        task {
          id
          name
        }
      }
    }
  }
`);

const LIST_PROJECTS_FOR_TIMER_QUERY = gql(`
  query ListProjectsForTimer($args: ListArgs!) {
    projects(args: $args) {
      nodes {
        id
        name
        code
        client {
          id
          name
        }
      }
    }
  }
`);

const LIST_TASKS_FOR_TIMER_QUERY = gql(`
  query ListTasksForTimer($projectId: ID!, $status: Status) {
    project(id: $projectId) {
      id
      tasks(status: $status, limit: 100) {
        nodes {
          id
          name
        }
      }
    }
  }
`);

const START_TIMER_MUTATION = gql(`
  mutation StartTimerFromDashboard(
    $projectId: ID!
    $taskId: ID
    $note: String
    $billable: Boolean = true
  ) {
    startTimer(
      projectId: $projectId
      taskId: $taskId
      note: $note
      billable: $billable
    ) {
      id
      startedAt
      note
      billable
    }
  }
`);

const DASHBOARD_INVOICES_QUERY = gql(`
  query DashboardInvoices($teamId: ID!, $thisMonthStart: DateTime!, $lastMonthStart: DateTime!, $lastMonthEnd: DateTime!) {
    sentInvoices: invoices(teamId: $teamId, status: "sent", limit: 100) {
      nodes {
        id
        invoiceNumber
        totalCents
        dueDate
        client {
          id
          name
        }
      }
      total
    }
    thisMonthInvoices: invoices(teamId: $teamId, from: $thisMonthStart, limit: 100) {
      nodes {
        id
        totalCents
        status
      }
    }
    lastMonthInvoices: invoices(teamId: $teamId, from: $lastMonthStart, to: $lastMonthEnd, limit: 100) {
      nodes {
        id
        totalCents
        status
      }
    }
    recentInvoices: invoices(teamId: $teamId, limit: 5, orderBy: "created_at", order: "desc") {
      nodes {
        id
        invoiceNumber
        status
        totalCents
        issuedDate
        client {
          id
          name
        }
      }
    }
  }
`);

export default function DashboardPage() {
  const { user, currentTeam } = useAuth();
  const canAccessInvoices = useCanAccessInvoices();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [note, setNote] = useState('');
  const [runningSeconds, setRunningSeconds] = useState(0);
  const [targetTitle, setTargetTitle] = useState('Chase the Weekend Bonus!');
  const [targetDailyHours, setTargetDailyHours] = useState(8);
  const [targetOvertimePoints, setTargetOvertimePoints] = useState(10);
  const [targetWeeklyPoints, setTargetWeeklyPoints] = useState(100);
  const [targetBonusReward, setTargetBonusReward] = useState(50.0);

  const [showEditTargetDialog, setShowEditTargetDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(targetTitle);
  const [editDailyHours, setEditDailyHours] = useState(targetDailyHours);
  const [editOvertimePoints, setEditOvertimePoints] =
    useState(targetOvertimePoints);
  const [editWeeklyPoints, setEditWeeklyPoints] = useState(targetWeeklyPoints);
  const [editBonusReward, setEditBonusReward] = useState(targetBonusReward);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const title =
        localStorage.getItem('ardine_target_title') ||
        'Chase the Weekend Bonus!';
      const dailyHours = parseFloat(
        localStorage.getItem('ardine_target_daily_hours') || '8'
      );
      const overtimePoints = parseInt(
        localStorage.getItem('ardine_target_overtime_points') || '10',
        10
      );
      const weeklyPoints = parseInt(
        localStorage.getItem('ardine_target_weekly_points') || '100',
        10
      );
      const bonusReward = parseFloat(
        localStorage.getItem('ardine_target_bonus_reward') || '50.00'
      );

       
      setTargetTitle(title);
       
      setTargetDailyHours(dailyHours);
       
      setTargetOvertimePoints(overtimePoints);
       
      setTargetWeeklyPoints(weeklyPoints);
       
      setTargetBonusReward(bonusReward);

       
      setEditTitle(title);
       
      setEditDailyHours(dailyHours);
       
      setEditOvertimePoints(overtimePoints);
       
      setEditWeeklyPoints(weeklyPoints);
       
      setEditBonusReward(bonusReward);
    }
  }, []);

  const handleSaveTarget = () => {
    localStorage.setItem('ardine_target_title', editTitle);
    localStorage.setItem('ardine_target_daily_hours', String(editDailyHours));
    localStorage.setItem(
      'ardine_target_overtime_points',
      String(editOvertimePoints)
    );
    localStorage.setItem(
      'ardine_target_weekly_points',
      String(editWeeklyPoints)
    );
    localStorage.setItem('ardine_target_bonus_reward', String(editBonusReward));

    setTargetTitle(editTitle);
    setTargetDailyHours(editDailyHours);
    setTargetOvertimePoints(editOvertimePoints);
    setTargetWeeklyPoints(editWeeklyPoints);
    setTargetBonusReward(editBonusReward);

    setShowEditTargetDialog(false);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const latestPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const collapsed =
        localStorage.getItem('ardine_target_collapsed') === 'true';
       
      setIsCollapsed(collapsed);

      const savedX = localStorage.getItem('ardine_target_pos_x');
      const savedY = localStorage.getItem('ardine_target_pos_y');
      if (savedX !== null && savedY !== null) {
        const parsedX = parseFloat(savedX);
        const parsedY = parseFloat(savedY);
         
        setPosition({ x: parsedX, y: parsedY });
        latestPos.current = { x: parsedX, y: parsedY };
      }
    }
  }, []);

  const handleToggleCollapse = (val: boolean) => {
    setIsCollapsed(val);
    localStorage.setItem('ardine_target_collapsed', String(val));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only drag with left click

    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }

    setIsDragging(true);
    hasDraggedRef.current = false;

    const initialClientX = e.clientX;
    const initialClientY = e.clientY;
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - initialClientX);
      const deltaY = Math.abs(moveEvent.clientY - initialClientY);
      if (deltaX > 4 || deltaY > 4) {
        hasDraggedRef.current = true;
      }

      let newX = moveEvent.clientX - startX;
      let newY = moveEvent.clientY - startY;

      if (typeof window !== 'undefined') {
        const widgetWidth = isCollapsed ? 180 : 360;
        const minX = -window.innerWidth + widgetWidth + 10;
        const maxX = 10;

        const widgetHeight = isCollapsed ? 60 : 340;
        const minY = -window.innerHeight + widgetHeight + 10;
        const maxY = 10;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
      }

      setPosition({ x: newX, y: newY });
      latestPos.current = { x: newX, y: newY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('ardine_target_pos_x', String(latestPos.current.x));
      localStorage.setItem('ardine_target_pos_y', String(latestPos.current.y));
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }

    setIsDragging(true);
    hasDraggedRef.current = false;

    const touch = e.touches[0];
    const initialClientX = touch.clientX;
    const initialClientY = touch.clientY;
    const startX = touch.clientX - position.x;
    const startY = touch.clientY - position.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const moveTouch = moveEvent.touches[0];

      const deltaX = Math.abs(moveTouch.clientX - initialClientX);
      const deltaY = Math.abs(moveTouch.clientY - initialClientY);
      if (deltaX > 4 || deltaY > 4) {
        hasDraggedRef.current = true;
      }

      let newX = moveTouch.clientX - startX;
      let newY = moveTouch.clientY - startY;

      if (typeof window !== 'undefined') {
        const widgetWidth = isCollapsed ? 180 : 360;
        const minX = -window.innerWidth + widgetWidth + 10;
        const maxX = 10;

        const widgetHeight = isCollapsed ? 60 : 340;
        const minY = -window.innerHeight + widgetHeight + 10;
        const maxY = 10;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
      }

      setPosition({ x: newX, y: newY });
      latestPos.current = { x: newX, y: newY };
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem('ardine_target_pos_x', String(latestPos.current.x));
      localStorage.setItem('ardine_target_pos_y', String(latestPos.current.y));
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handlePillClick = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    handleToggleCollapse(false);
  };

  // Date calculations
  const now = new Date();

  // Start of this week (Monday)
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() + diff);
  thisWeekStart.setHours(0, 0, 0, 0);

  // Start of this month
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Start and end of last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59
  );

  // Query time entries (available to all users)
  const [dashboardResult] = useQuery({
    query: DASHBOARD_QUERY,
    variables: {
      teamId: currentTeam?.id || '',
      thisWeekStart: thisWeekStart.toISOString(),
      thisMonthStart: thisMonthStart.toISOString(),
    },
    pause: !currentTeam?.id,
  });

  // Query projects for timer dialog
  const [projectsResult] = useQuery({
    query: LIST_PROJECTS_FOR_TIMER_QUERY,
    variables: {
      args: {
        teamId: currentTeam?.id || '',
        limit: 100,
        offset: 0,
      },
    },
    pause: !currentTeam?.id,
  });

  // Query tasks for selected project in start timer dialog
  const [tasksResult] = useQuery({
    query: LIST_TASKS_FOR_TIMER_QUERY,
    variables: {
      projectId: selectedProjectId,
      status: 'active',
    },
    pause: !selectedProjectId || !showStartDialog,
  });

  // Query invoices (only for users with invoice access)
  const [invoicesResult] = useQuery({
    query: DASHBOARD_INVOICES_QUERY,
    variables: {
      teamId: currentTeam?.id || '',
      thisMonthStart: thisMonthStart.toISOString(),
      lastMonthStart: lastMonthStart.toISOString(),
      lastMonthEnd: lastMonthEnd.toISOString(),
    },
    pause: !currentTeam?.id || !canAccessInvoices,
  });

  const [, startTimerMutation] = useMutation(START_TIMER_MUTATION);

  const data = dashboardResult.data;
  const fetching = dashboardResult.fetching;
  const error = dashboardResult.error;

  const invoicesData = invoicesResult.data;
  const invoicesFetching = invoicesResult.fetching;

  const projects = projectsResult.data?.projects.nodes || [];
  const tasks = tasksResult.data?.project?.tasks.nodes || [];

  const handleStartTimer = async () => {
    if (!selectedProjectId) return;

    const result = await startTimerMutation({
      projectId: selectedProjectId,
      taskId: selectedTaskId || undefined,
      note: note || undefined,
      billable: true,
    });

    if (!result.error) {
      setShowStartDialog(false);
      setSelectedProjectId('');
      setSelectedTaskId('');
      setNote('');
    }
  };

  // Calculate metrics
  const thisWeekSeconds =
    data?.thisWeekEntries.nodes.reduce(
      (acc: number, entry: any) =>
        acc + (entry.stoppedAt ? entry.durationSeconds || 0 : 0),
      0
    ) || 0;
  const thisWeekHours = (thisWeekSeconds / 3600).toFixed(1);

  const thisMonthSeconds =
    data?.thisMonthEntries.nodes.reduce(
      (acc: number, entry: any) => acc + (entry.durationSeconds || 0),
      0
    ) || 0;
  const thisMonthHours = (thisMonthSeconds / 3600).toFixed(1);

  const unbilledSeconds =
    data?.unbilledEntries.nodes.reduce(
      (acc: number, entry: any) => acc + (entry.durationSeconds || 0),
      0
    ) || 0;
  const unbilledHours = (unbilledSeconds / 3600).toFixed(1);
  const unbilledAmount =
    data?.unbilledEntries.nodes.reduce(
      (acc: number, entry: any) => acc + (entry.amountCents || 0),
      0
    ) || 0;

  // Invoice metrics
  const outstandingAmount =
    invoicesData?.sentInvoices.nodes.reduce(
      (acc: number, invoice: any) => acc + (invoice.totalCents || 0),
      0
    ) || 0;

  const thisMonthRevenue =
    invoicesData?.thisMonthInvoices.nodes
      .filter((inv: any) => inv.status === 'paid')
      .reduce(
        (acc: number, invoice: any) => acc + (invoice.totalCents || 0),
        0
      ) || 0;

  const lastMonthRevenue =
    invoicesData?.lastMonthInvoices.nodes
      .filter((inv: any) => inv.status === 'paid')
      .reduce(
        (acc: number, invoice: any) => acc + (invoice.totalCents || 0),
        0
      ) || 0;

  const revenueChange =
    lastMonthRevenue > 0
      ? Number(
          (
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
            100
          ).toFixed(0)
        )
      : 0;

  // Group hours by project for this week
  const hoursByProject = data?.thisWeekEntries.nodes.reduce(
    (acc: any, entry: any) => {
      if (!entry.stoppedAt) return acc;
      const projectId = entry.project.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          project: entry.project,
          seconds: 0,
        };
      }
      acc[projectId].seconds += entry.durationSeconds || 0;
      return acc;
    },
    {} as Record<string, any>
  );

  const projectStats = Object.values(hoursByProject || {}).sort(
    (a: any, b: any) => b.seconds - a.seconds
  );

  // Group entries by day of week (Senin to Minggu)
  const userEntries =
    data?.thisWeekEntries?.nodes?.filter(
      (entry: any) => entry.user?.id === user?.id
    ) || [];

  const runningEntry = userEntries.find((entry: any) => !entry.stoppedAt);

  useEffect(() => {
    if (!runningEntry) {
       
      setRunningSeconds(0);
      return;
    }
    const updateElapsed = () => {
      const start = new Date(runningEntry.startedAt).getTime();
       
      setRunningSeconds(Math.floor((Date.now() - start) / 1000));
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningEntry?.id, runningEntry?.startedAt]);

  const weekDaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(thisWeekStart);
    d.setDate(thisWeekStart.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      dateStr,
      dayName: dayNames[i],
      seconds: 0,
      points: 0,
    };
  });

  userEntries.forEach((entry: any) => {
    if (!entry.startedAt || !entry.stoppedAt) return;
    const entryDate = new Date(entry.startedAt);
    const yyyy = entryDate.getFullYear();
    const mm = String(entryDate.getMonth() + 1).padStart(2, '0');
    const dd = String(entryDate.getDate()).padStart(2, '0');
    const entryDateStr = `${yyyy}-${mm}-${dd}`;

    const dayObj = weekDaysData.find((d) => d.dateStr === entryDateStr);
    if (dayObj) {
      dayObj.seconds += entry.durationSeconds || 0;
    }
  });

  if (runningEntry) {
    const entryDate = new Date(runningEntry.startedAt);
    const yyyy = entryDate.getFullYear();
    const mm = String(entryDate.getMonth() + 1).padStart(2, '0');
    const dd = String(entryDate.getDate()).padStart(2, '0');
    const entryDateStr = `${yyyy}-${mm}-${dd}`;

    const dayObj = weekDaysData.find((d) => d.dateStr === entryDateStr);
    if (dayObj) {
      dayObj.seconds += runningSeconds;
    }
  }

  const dailyTargetSeconds = targetDailyHours * 3600;

  weekDaysData.forEach((day) => {
    day.points =
      Math.floor(Math.max(0, day.seconds - dailyTargetSeconds) / 3600) *
      targetOvertimePoints;
  });

  const totalWeeklyPoints = weekDaysData.reduce(
    (sum, day) => sum + day.points,
    0
  );

  const todayDate = new Date();
  const yyyyToday = todayDate.getFullYear();
  const mmToday = String(todayDate.getMonth() + 1).padStart(2, '0');
  const ddToday = String(todayDate.getDate()).padStart(2, '0');
  const todayDateStr = `${yyyyToday}-${mmToday}-${ddToday}`;
  const todayData = weekDaysData.find((d) => d.dateStr === todayDateStr);

  const todaySeconds = todayData ? todayData.seconds : 0;
  const todayHours = todaySeconds / 3600;
  const isTodayTargetAchieved = todaySeconds >= dailyTargetSeconds;
  const todayOvertimePoints = todayData ? todayData.points : 0;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 dark:text-foreground">
          Dashboard
        </h1>
        <div className="border border-red-500 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">
            Error loading dashboard: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold dark:text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Timer variant="compact" onStart={() => setShowStartDialog(true)} />
          {canAccessInvoices && (
            <Link href="/invoices/new">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Start Timer Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Timer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="project">Project *</Label>
              <select
                id="project"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedTaskId('');
                }}
                className="w-full px-3 py-2 border dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="">Select a project...</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.code ? `[${project.code}] ` : ''}
                    {project.name}
                    {project.client ? ` - ${project.client.name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="task">Task (optional)</Label>
              <select
                id="task"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={!selectedProjectId}
                className="w-full px-3 py-2 border dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground disabled:opacity-50"
              >
                <option value="">No task</option>
                {tasks.map((task: any) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What are you working on?"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleStartTimer} disabled={!selectedProjectId}>
                Start Timer
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowStartDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Weekend Bonus Tracker Widget */}
      {isCollapsed ? (
        <div
          onClick={handlePillClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          role="button"
          tabIndex={0}
          className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-5 py-3 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border border-white/20 select-none hover:scale-105 active:scale-95 whitespace-nowrap min-w-max ${
            isDragging
              ? 'cursor-grabbing transition-none'
              : 'cursor-grab transition-all duration-300'
          }`}
        >
          <span className="text-xl">🎯</span>
          <span className="text-xs font-bold tracking-wide pr-1">
            Target: {totalWeeklyPoints}/{targetWeeklyPoints} pts
          </span>
        </div>
      ) : (
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          className={`fixed bottom-6 right-6 z-50 w-[360px] border dark:border-border rounded-xl p-5 bg-card dark:bg-card/95 shadow-2xl border-slate-200/80 animate-in slide-in-from-bottom-5 duration-300 select-none ${
            isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b dark:border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Weekly Target
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {(currentTeam?.role === 'OWNER' ||
                currentTeam?.role === 'ADMIN') && (
                <button
                  onClick={() => {
                    setEditTitle(targetTitle);
                    setEditDailyHours(targetDailyHours);
                    setEditOvertimePoints(targetOvertimePoints);
                    setEditWeeklyPoints(targetWeeklyPoints);
                    setEditBonusReward(targetBonusReward);
                    setShowEditTargetDialog(true);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit weekly target rules"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleToggleCollapse(true)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-3 space-y-3.5">
            {/* Target Title & Progress */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                &quot;{targetTitle}&quot;
              </h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-primary">
                  {totalWeeklyPoints} / {targetWeeklyPoints} Points
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                  style={{
                    width: `${Math.min(100, (totalWeeklyPoints / targetWeeklyPoints) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Quick Status */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 border dark:border-border/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-sm">
                  {isTodayTargetAchieved ? '✅' : '⏳'}
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {isTodayTargetAchieved
                      ? `Daily target achieved! (+${todayOvertimePoints} pts)`
                      : `Target not achieved. (${todayHours.toFixed(1)}h / ${targetDailyHours}h)`}
                  </p>
                  {!isTodayTargetAchieved && todayHours > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      Need {(targetDailyHours - todayHours).toFixed(1)} hrs for
                      overtime.
                    </p>
                  )}
                </div>
              </div>

              {/* Rules Summary Ticker or Bullet */}
              <div className="text-[10px] text-muted-foreground border-t dark:border-border/50 pt-2 flex justify-between items-center">
                <span>Target: {targetDailyHours}h/day</span>
                <span>+{targetOvertimePoints} pts/hr</span>
                <span>Reward: ${targetBonusReward.toFixed(2)}</span>
              </div>
            </div>

            {/* Week Calendar dot-grid or small blocks */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Mon - Sun Hours
              </h4>
              <div className="grid grid-cols-7 gap-1">
                {weekDaysData.map((day) => {
                  const hrs = day.seconds / 3600;
                  const isToday = day.dateStr === todayDateStr;
                  let bgClass = 'bg-slate-100 dark:bg-slate-800';
                  let borderClass = 'border-transparent';
                  let textClass = 'text-slate-500 dark:text-slate-400';

                  if (hrs >= targetDailyHours) {
                    bgClass = 'bg-emerald-500 text-white';
                  } else if (hrs > 0) {
                    bgClass = 'bg-amber-500 text-white';
                  }

                  if (isToday) {
                    borderClass =
                      'ring-2 ring-primary ring-offset-2 ring-offset-background';
                  }

                  return (
                    <div
                      key={day.dateStr}
                      className={`rounded p-1 text-center transition-all ${bgClass} ${borderClass} flex flex-col justify-between h-10`}
                      title={`${day.dayName}: ${hrs.toFixed(1)}h (+${day.points} pts)`}
                    >
                      <span className="text-[8px] font-bold block uppercase opacity-75">
                        {day.dayName.slice(0, 3)}
                      </span>
                      <span className="text-[9px] font-extrabold block">
                        {hrs.toFixed(0)}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Target Dialog */}
      <Dialog
        open={showEditTargetDialog}
        onOpenChange={setShowEditTargetDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Weekly Target & Rules</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="targetTitle">Target Title / Name</Label>
              <Input
                id="targetTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Chase the Weekend Bonus!"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetDailyHours">Daily Target Hours</Label>
                <Input
                  id="targetDailyHours"
                  type="number"
                  step="0.5"
                  value={editDailyHours}
                  onChange={(e) =>
                    setEditDailyHours(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <Label htmlFor="targetOvertimePoints">
                  Points per Extra Hour
                </Label>
                <Input
                  id="targetOvertimePoints"
                  type="number"
                  value={editOvertimePoints}
                  onChange={(e) =>
                    setEditOvertimePoints(parseInt(e.target.value, 10) || 0)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetWeeklyPoints">Weekly Target Points</Label>
                <Input
                  id="targetWeeklyPoints"
                  type="number"
                  value={editWeeklyPoints}
                  onChange={(e) =>
                    setEditWeeklyPoints(parseInt(e.target.value, 10) || 0)
                  }
                />
              </div>

              <div>
                <Label htmlFor="targetBonusReward">
                  Bonus Reward Amount ($)
                </Label>
                <Input
                  id="targetBonusReward"
                  type="number"
                  step="0.01"
                  value={editBonusReward}
                  onChange={(e) =>
                    setEditBonusReward(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveTarget}>Save Changes</Button>
              <Button
                variant="outline"
                onClick={() => setShowEditTargetDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Key Metrics */}
      <div
        className={`grid grid-cols-1 gap-4 mb-6 ${canAccessInvoices ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
      >
        {/* This Week */}
        <div className="border dark:border-border rounded-lg p-6 bg-card dark:bg-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              This Week
            </h2>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          {fetching ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div>
              <p className="text-2xl font-bold dark:text-foreground">
                {thisWeekHours}h
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data?.thisWeekEntries.nodes.filter((e: any) => e.stoppedAt)
                  .length || 0}{' '}
                entries
              </p>
            </div>
          )}
        </div>

        {/* This Month */}
        <div className="border dark:border-border rounded-lg p-6 bg-card dark:bg-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              This Month
            </h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          {fetching ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div>
              <p className="text-2xl font-bold dark:text-foreground">
                {thisMonthHours}h
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data?.thisMonthEntries.nodes.length || 0} entries
              </p>
            </div>
          )}
        </div>

        {/* Unbilled Time */}
        {canAccessInvoices && (
          <div className="border dark:border-border rounded-lg p-6 bg-card dark:bg-card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Unbilled
              </h2>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            {fetching ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div>
                <p className="text-2xl font-bold dark:text-foreground">
                  {formatCurrency(unbilledAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {unbilledHours}h unbilled
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Revenue Metrics (Billing users only) */}
      {canAccessInvoices && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border dark:border-border rounded-lg p-6 bg-card dark:bg-card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Outstanding Invoices
              </h2>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            {invoicesFetching ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrency(outstandingAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {invoicesData?.sentInvoices.nodes.length || 0} invoices
                  awaiting payment
                </p>
              </div>
            )}
          </div>

          <div className="border dark:border-border rounded-lg p-6 bg-card dark:bg-card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Revenue (This Month)
              </h2>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            {invoicesFetching ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div>
                <p className="text-2xl font-bold dark:text-foreground">
                  {formatCurrency(thisMonthRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {revenueChange > 0 && '+'}
                  {revenueChange}% vs last month
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Time Entries */}
        <div className="border dark:border-border rounded-lg bg-card dark:bg-card">
          <div className="p-6 border-b dark:border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Time Entries</h2>
              <Link href="/time">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {fetching ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : data?.recentEntries.nodes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No time entries yet
              </p>
            ) : (
              <div className="space-y-3">
                {data?.recentEntries.nodes.slice(0, 5).map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 pb-3 border-b dark:border-border last:border-0 last:pb-0"
                  >
                    <div
                      className="w-1 h-12 rounded-full mt-1"
                      style={{
                        backgroundColor: entry.project?.color || '#6B7280',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {entry.project?.code ? `[${entry.project.code}]` : ''}{' '}
                          {entry.project?.name}
                        </span>
                        {entry.task && (
                          <span className="text-xs text-muted-foreground">
                            • {entry.task.name}
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {entry.note}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(entry.startedAt)}</span>
                        <span>•</span>
                        <span>{formatTime(entry.startedAt)}</span>
                        {entry.stoppedAt && (
                          <>
                            <span>→</span>
                            <span>{formatTime(entry.stoppedAt)}</span>
                            <span>•</span>
                            <span className="font-medium">
                              {formatDuration(entry.durationSeconds)}
                            </span>
                          </>
                        )}
                        {!entry.stoppedAt && (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Running
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hours by Project or Recent Invoices */}
        {canAccessInvoices ? (
          <div className="border dark:border-border rounded-lg bg-card dark:bg-card">
            <div className="p-6 border-b dark:border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Invoices</h2>
                <Link href="/invoices">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {invoicesFetching ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : invoicesData?.recentInvoices.nodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No invoices yet
                </p>
              ) : (
                <div className="space-y-3">
                  {invoicesData?.recentInvoices.nodes.map((invoice: any) => (
                    <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border dark:border-border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              Invoice {invoice.invoiceNumber}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${getStatusColor(invoice.status)}`}
                            >
                              {invoice.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{invoice.client.name}</span>
                            <span>•</span>
                            <span>{formatDate(invoice.issuedDate)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(invoice.totalCents)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="border dark:border-border rounded-lg bg-card dark:bg-card">
            <div className="p-6 border-b dark:border-border">
              <h2 className="text-lg font-semibold">
                Hours by Project (This Week)
              </h2>
            </div>
            <div className="p-6">
              {fetching ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : projectStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No time tracked this week
                </p>
              ) : (
                <div className="space-y-3">
                  {projectStats.slice(0, 5).map((stat: any) => {
                    const hours = (stat.seconds / 3600).toFixed(1);
                    const percentage =
                      thisWeekSeconds > 0
                        ? ((stat.seconds / thisWeekSeconds) * 100).toFixed(0)
                        : 0;
                    return (
                      <div key={stat.project.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  stat.project.color || '#6B7280',
                              }}
                            />
                            <span className="text-sm font-medium">
                              {stat.project.code
                                ? `[${stat.project.code}]`
                                : ''}{' '}
                              {stat.project.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            {hours}h
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: stat.project.color || '#6B7280',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
