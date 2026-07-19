import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Calendar, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import DashboardLayout from '../layout/DashboardLayout'
import CreateTaskModal from '../components/CreateTaskModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { getTasksByProject, createTask, updateTaskStatus, deleteTask } from '../services/taskService'

function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [viewMode, setViewMode] = useState('board')

  const fetchTasks = async () => {
    try {
      const filters = { sortBy, order: 'desc' }
      if (priorityFilter) filters.priority = priorityFilter


      console.log('Sending filters:', filters)


      const result = await getTasksByProject(id, filters)
      setTasks(result.data.tasks || [])


      console.log('Received tasks count:', result.data.tasks?.length)

      
    } catch (error) {
      console.error('Failed to fetch tasks', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [id, priorityFilter, sortBy])

  const handleCreateTask = async (data) => {
    try {
      await createTask(id, data)
      fetchTasks()
      toast.success('Task created!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task')
    }
  }

  const handleDeleteClick = (taskId) => {
    setDeleteTargetId(taskId)
  }

  const confirmDeleteTask = async () => {
    try {
      await deleteTask(deleteTargetId)
      setDeleteTargetId(null)
      fetchTasks()
      toast.success('Task deleted')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const newStatus = destination.droppableId

    setTasks((prev) =>
      prev.map((task) =>
        task._id === draggableId ? { ...task, status: newStatus } : task
      )
    )

    try {
      await updateTaskStatus(draggableId, newStatus)
    } catch (error) {
      console.error('Failed to update status', error)
      fetchTasks()
    }
  }

  const columns = [
    { key: 'To Do', color: 'border-t-gray-300' },
    { key: 'In Progress', color: 'border-t-primary' },
    { key: 'Done', color: 'border-t-mint' },
  ]

  const priorityColor = {
    High: 'bg-red-50 text-red-600',
    Medium: 'bg-brass/10 text-brass',
    Low: 'bg-gray-100 text-gray-500',
  }

  const getTimelineDates = () => {
    const dates = []
    const start = new Date()
    start.setDate(start.getDate() - 3)
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const timelineDates = getTimelineDates()

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">Project Board</h1>
            <p className="text-sm text-gray-500 mt-1">{tasks.length} tasks total — drag cards to update status</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-sm border border-line rounded-lg px-3 py-1.5 bg-surface focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-line rounded-lg px-3 py-1.5 bg-surface focus:outline-none"
          >
            <option value="createdAt">Sort: Newest First</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>

          <div className="flex items-center gap-1 bg-surface border border-line rounded-lg p-0.5 ml-auto">
            <button
              onClick={() => setViewMode('board')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'board' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-ink'
              }`}
            >
              Board View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'timeline' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-ink'
              }`}
            >
              Timeline View
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading tasks...</p>
        ) : viewMode === 'board' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-4">
              {columns.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.key)
                return (
                  <Droppable droppableId={col.key} key={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-surface border border-line border-t-4 ${col.color} rounded-xl p-4 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-primary-soft' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-display font-semibold text-sm">{col.key}</h3>
                          <span className="text-xs font-mono text-gray-400 bg-canvas px-2 py-0.5 rounded-full">
                            {columnTasks.length}
                          </span>
                        </div>

                        <div className="space-y-3 min-h-[80px]">
                          {columnTasks.map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={provided.draggableProps.style}
                                  className={`bg-canvas border rounded-lg p-3 transition-shadow cursor-pointer relative ${
                                    task.isOverdue || (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done')
                                      ? 'border-red-300 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10'
                                      : 'border-line'
                                  } ${
                                    snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-sm'
                                  }`}
                                  onClick={() => navigate(`/projects/${id}/tasks/${task._id}`)}
                                >
                                  <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(task._id);
                                      }}
                                      className="text-gray-300 hover:text-red-500 transition-colors shrink-0 ml-2"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {task.tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/10 tracking-wider uppercase"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mt-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>
                                      {task.priority}
                                    </span>
                                    {task.dueDate && (
                                      <div className={`flex items-center gap-1 ${
                                        task.isOverdue || (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done')
                                          ? 'text-red-500 font-semibold'
                                          : 'text-gray-400'
                                      }`}>
                                        <Calendar size={12} />
                                        <span className="text-xs font-mono">
                                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {columnTasks.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-6">Drop tasks here</p>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                )
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="bg-surface border border-line rounded-2xl p-6 overflow-x-auto shadow-sm">
            <div className="min-w-[800px]">
              {/* Header dates */}
              <div className="grid grid-cols-12 gap-2 pb-3 border-b border-line mb-4 text-xs font-semibold text-gray-400 uppercase">
                <div className="col-span-3">Task Title</div>
                <div className="col-span-9 grid grid-cols-14 gap-1 text-center font-mono">
                  {timelineDates.map((date) => {
                    const isToday = date.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={date.toISOString()}
                        className={`py-1 rounded ${isToday ? 'bg-primary text-white font-bold' : ''}`}
                      >
                        <p className="text-[9px]">{date.toLocaleDateString('en-US', { weekday: 'narrow' })}</p>
                        <p className="text-xs">{date.getDate()}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rows */}
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No tasks found</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const startDay = new Date(task.createdAt)
                    startDay.setHours(0,0,0,0)
                    
                    const endDay = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt)
                    endDay.setHours(23,59,59,999)

                    const dayMs = 24 * 60 * 60 * 1000
                    const timelineStartMs = timelineDates[0].getTime()
                    
                    let startCol = Math.floor((startDay.getTime() - timelineStartMs) / dayMs)
                    let endCol = Math.floor((endDay.getTime() - timelineStartMs) / dayMs)

                    if (startCol < 0) startCol = 0
                    if (startCol > 13) startCol = 13
                    if (endCol < 0) endCol = 0
                    if (endCol > 13) endCol = 13
                    if (endCol < startCol) endCol = startCol

                    const colSpan = endCol - startCol + 1
                    const isOverdue = task.isOverdue || (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done')

                    return (
                      <div
                        key={task._id}
                        onClick={() => navigate(`/projects/${id}/tasks/${task._id}`)}
                        className="grid grid-cols-12 gap-2 items-center py-2 border-b border-line hover:bg-canvas/50 rounded-lg px-2 cursor-pointer transition-colors"
                      >
                        <div className="col-span-3 truncate pr-2">
                          <p className="text-sm font-semibold truncate text-ink">{task.title}</p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                            task.status === 'Done'
                              ? 'bg-green-100 text-green-600'
                              : task.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {task.status}
                          </span>
                        </div>

                        <div className="col-span-9 grid grid-cols-14 gap-1 relative h-8 items-center">
                          <div
                            style={{
                              gridColumnStart: startCol + 1,
                              gridColumnEnd: `span ${colSpan}`,
                            }}
                            className={`h-6 rounded-md shadow-sm text-[10px] text-white flex items-center justify-between px-2 font-medium truncate transition-transform hover:scale-[1.01] ${
                              task.status === 'Done'
                                ? 'bg-mint'
                                : isOverdue
                                ? 'bg-red-500'
                                : 'bg-primary'
                            }`}
                          >
                            <span className="truncate">{task.title}</span>
                            {task.dueDate && (
                              <span className="text-[8px] opacity-90 font-mono shrink-0 ml-1">
                                {new Date(task.dueDate).getDate()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTask}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Task"
        message="This task will be removed from the board."
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteTargetId(null)}
      />
    </DashboardLayout>
  )
}

export default ProjectDetails