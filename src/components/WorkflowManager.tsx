import React, { useState } from 'react';
import { Department, TaskItem, User, WorkflowDefinition } from '../types/erp';
import {
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Plus,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface WorkflowManagerProps {
  workflows: WorkflowDefinition[];
  tasks: TaskItem[];
  departments: Department[];
  users: User[];
  tenantId: string;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskItem['status']) => void;
  onCreateTask: (newTask: TaskItem) => void;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  workflows,
  tasks,
  departments,
  users,
  tenantId,
  onUpdateTaskStatus,
  onCreateTask,
}) => {
  const { t, isRtl } = useLanguage();
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDeptId, setTaskDeptId] = useState(departments[0]?.id || '');
  const [taskUserId, setTaskUserId] = useState(users[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<TaskItem['priority']>('medium');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-15');

  const filteredTasks = tasks.filter((item) => {
    if (selectedDeptFilter !== 'all' && item.departmentId !== selectedDeptFilter) return false;
    if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const dept = departments.find((d) => d.id === taskDeptId);
    const assignedUser = users.find((u) => u.id === taskUserId);

    const newTask: TaskItem = {
      id: `task-${Date.now().toString(36)}`,
      tenantId,
      title: taskTitle,
      description: taskDesc,
      module: 'tasks',
      departmentId: taskDeptId,
      departmentName: dept?.name || (isRtl ? 'العمليات العامة' : 'General Operations'),
      assignedToUserId: taskUserId,
      assignedToUserName: assignedUser?.name || (isRtl ? 'عضو الفريق' : 'Staff Member'),
      priority: taskPriority,
      status: 'pending',
      dueDate: taskDueDate,
      createdAt: new Date().toISOString(),
    };

    onCreateTask(newTask);
    setShowNewTaskModal(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-lg">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t.workflowTitle}</h1>
            <p className="text-xs text-slate-500">{t.workflowSub}</p>
          </div>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          {t.createTaskBtn}
        </button>
      </div>

      {/* Visual Multi-Step Workflow Templates Pipeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>{t.activeWorkflowsTitle}</span>
          <span className="text-xs font-normal text-slate-500">
            {t.linkedDynamicEntities}
          </span>
        </h2>

        <div className="space-y-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-violet-100 text-violet-800 rounded">
                    {wf.module}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800">{wf.name}</h3>
                  <span className="text-xs text-slate-500 font-mono dir-ltr">
                    <code>{wf.entityType}</code>
                  </span>
                </div>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isRtl ? 'محرك القواعد نشط' : 'Active Rule Engine'}
                </span>
              </div>

              {/* Step Sequence Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {wf.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs relative flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        {st.stepNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {t.slaHours} {st.slaHours}h
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-slate-800">{st.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      <span>{t.roleRequired}</span> <span className="font-medium text-slate-700">{st.roleRequired}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task & Approval Queue */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {t.deptTasksQueue} ({filteredTasks.length})
            </h2>
            <p className="text-xs text-slate-500">{t.deptTasksQueueSub}</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-slate-50"
            >
              <option value="all">{t.allDepts}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-slate-50"
            >
              <option value="all">{t.allStatuses}</option>
              <option value="pending">{t.statuses.pending}</option>
              <option value="in_progress">{t.statuses.in_progress}</option>
              <option value="approved">{t.statuses.approved}</option>
              <option value="completed">{t.statuses.completed}</option>
              <option value="rejected">{t.statuses.rejected}</option>
            </select>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {isRtl ? 'لا توجد مهام تطابق الفلتر المحدد.' : 'No tasks match the selected filter.'}
            </div>
          ) : (
            filteredTasks.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {t.priorities[item.priority] || item.priority.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border capitalize ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {t.statuses[item.status] || item.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {item.departmentName}
                    </span>
                    {item.currentStep && item.totalSteps && (
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {isRtl ? `المرحلة ${item.currentStep} من ${item.totalSteps}` : `Step ${item.currentStep} of ${item.totalSteps}`}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>{isRtl ? 'المعين له:' : 'Assigned to:'} <strong className="text-slate-700">{item.assignedToUserName}</strong></span>
                    <span>{t.dueDateLabel}: <strong className="text-slate-700">{item.dueDate}</strong></span>
                    {item.linkedEntityId && (
                      <span className="text-indigo-600 font-mono dir-ltr">
                        Ref: {item.linkedEntityId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onUpdateTaskStatus(item.id, 'approved')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t.approveBtn}
                      </button>
                      <button
                        onClick={() => onUpdateTaskStatus(item.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        {t.rejectBtn}
                      </button>
                    </>
                  )}

                  {item.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateTaskStatus(item.id, 'completed')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.markCompleteBtn}
                    </button>
                  )}

                  {(item.status === 'approved' || item.status === 'completed') && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.signedOffStatus}
                    </span>
                  )}

                  {item.status === 'rejected' && (
                    <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {t.declinedStatus}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t.modalCreateTitle}</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">{t.taskTitleInput}</label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'مثال: فحص تسريب مبرد التكييف في مركز البيانات' : 'e.g. Inspect Datacenter HVAC Refrigerant Leak'}
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">{t.descLabel}</label>
                <textarea
                  rows={2}
                  placeholder={isRtl ? 'تفاصيل المهمة والإرشادات التشغيلية...' : 'Operational details and instructions...'}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">{isRtl ? 'القسم المستهدف' : 'Target Department'}</label>
                  <select
                    value={taskDeptId}
                    onChange={(e) => setTaskDeptId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">{isRtl ? 'الموظف المعين' : 'Assignee'}</label>
                  <select
                    value={taskUserId}
                    onChange={(e) => setTaskUserId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">{t.priorityLevel}</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskItem['priority'])}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="low">{t.priorities.low}</option>
                    <option value="medium">{t.priorities.medium}</option>
                    <option value="high">{t.priorities.high}</option>
                    <option value="urgent">{t.priorities.urgent}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">{t.dueDateLabel}</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {t.saveTaskBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
