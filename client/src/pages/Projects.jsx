import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, Users, Trash2, Crown, UserCheck, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../layout/DashboardLayout'
import CreateProjectModal from '../components/CreateProjectModal'
import { createProject, getMyProjects, deleteProject } from '../services/projectService'
import ConfirmDialog from '../components/ConfirmDialog'

function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin'

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const result = await getMyProjects()
      setProjects(result.data || [])
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (data) => {
    try {
      await createProject(data)
      fetchProjects()
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  }

  const handleDeleteClick = (e, projectId) => {
    e.stopPropagation()
    setDeleteTargetId(projectId)
  }

  const confirmDelete = async () => {
    try {
      await deleteProject(deleteTargetId)
      setDeleteTargetId(null)
      fetchProjects()
      toast.success('Project deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <Sparkles size={12} />
              <span>Project Directory</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Projects</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage all team projects, members, and task workflows ({projects.length} total)
            </p>
          </div>

          {/* Only managers can create projects */}
          {isManager ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={16} /> New Project
            </button>
          ) : (
            <span className="text-xs text-slate-400 bg-surface px-3 py-1.5 rounded-xl border border-line font-medium">
              👷 Member View Only
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading project workspace...
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-surface border border-dashed border-line rounded-3xl p-14 text-center">
            <FolderKanban className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={44} />
            <h3 className="font-display font-bold text-lg text-ink">
              {isManager ? 'No Projects Created Yet' : 'No Projects Assigned to You'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {isManager
                ? 'Get started by creating your first project to organize team tasks and timelines.'
                : 'Ask your project manager to add you to a project.'
              }
            </p>
            {isManager && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Plus size={15} /> Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project, index) => {
              const userIsOwner = project.owner?._id === currentUser.id || project.owner === currentUser.id
              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-surface border border-line border-l-4 border-l-indigo-500 rounded-3xl p-6 hover:shadow-xl transition-all cursor-pointer group glow-card relative overflow-hidden"
                >
                  {/* Project Name + Role Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display font-extrabold text-xl text-ink leading-snug group-hover:text-indigo-500 transition-colors">
                      {project.name}
                    </h3>
                    {userIsOwner ? (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Crown size={10} /> Manager
                      </span>
                    ) : (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <UserCheck size={10} /> Member
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {project.description || 'No description provided for this project.'}
                  </p>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-line">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={14} />
                      <span className="text-xs font-semibold">
                        {project.members?.length || 1} team member{project.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {userIsOwner && (
                        <button
                          onClick={(e) => handleDeleteClick(e, project._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <div className="p-1.5 text-indigo-500 group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Project"
        message="Are you sure you want to delete this project? Members will lose access to its tasks."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </DashboardLayout>
  )
}

export default Projects