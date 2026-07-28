import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, Users, Trash2, Crown, UserCheck, ArrowRight, Sparkles, ShieldAlert, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../layout/DashboardLayout'
import CreateProjectModal from '../components/CreateProjectModal'
import { createProject, getMyProjects, deleteProject } from '../services/projectService'
import ConfirmDialog from '../components/ConfirmDialog'
import AppLoader from '../components/AppLoader'
import api from '../services/api'

function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = currentUser.role === 'admin'
  const isManager = currentUser.role === 'manager'
  const canCreateProject = isManager

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      let data = []
      if (isAdmin) {
        // Admin sees ALL workspace projects
        const res = await api.get('/projects/admin/all').catch(() => api.get('/projects'))
        data = res.data.data || []
      } else {
        const result = await getMyProjects()
        data = result.data || []
      }
      setProjects(data)
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
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isAdmin
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
            }`}>
              {isAdmin ? <ShieldAlert size={12} /> : <Sparkles size={12} />}
              <span>{isAdmin ? 'Workspace Oversight — All Projects' : 'Project Directory'}</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              {isAdmin ? 'All Workspace Projects' : 'Projects'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isAdmin
                ? `Monitoring ${projects.length} project${projects.length !== 1 ? 's' : ''} across the workspace — supervisory access only`
                : `Manage your team projects, members, and task workflows (${projects.length} total)`}
            </p>
          </div>

          {/* Role-based action button */}
          {canCreateProject ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={16} /> New Project
            </button>
          ) : isAdmin ? (
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 font-semibold flex items-center gap-1.5">
                <Eye size={13} /> Supervisory View
              </span>
              <span className="text-[10px] text-slate-500">Read-only access</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 bg-surface px-3 py-1.5 rounded-xl border border-line font-medium">
              👷 Member View Only
            </span>
          )}
        </div>

        {/* Admin info banner */}
        {isAdmin && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs font-semibold"
          >
            <ShieldAlert size={16} className="shrink-0" />
            <span>
              You are viewing all <strong>{projects.length}</strong> workspace projects as Super Admin. Project creation is managed by Project Managers only.
            </span>
          </motion.div>
        )}

        {isLoading ? (
          <AppLoader message={isAdmin ? 'Loading all workspace projects...' : 'Fetching project workspace...'} />
        ) : projects.length === 0 ? (
          <div className="bg-surface border border-dashed border-line rounded-3xl p-14 text-center">
            <FolderKanban className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={44} />
            <h3 className="font-display font-bold text-lg text-ink">
              {isAdmin ? 'No Projects in Workspace Yet' : isManager ? 'No Projects Created Yet' : 'No Projects Assigned to You'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {isAdmin
                ? 'No projects exist in the workspace. Ask a Project Manager to create one.'
                : isManager
                ? 'Get started by creating your first project to organize team tasks and timelines.'
                : 'Ask your project manager to add you to a project.'}
            </p>
            {canCreateProject && (
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
              const ownerName = project.owner?.name || 'Unknown'
              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className={`bg-surface border border-line rounded-3xl p-6 hover:shadow-xl transition-all cursor-pointer group glow-card relative overflow-hidden border-l-4 ${
                    isAdmin ? 'border-l-amber-500' : 'border-l-indigo-500'
                  }`}
                >
                  {/* Project Name + Role Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display font-extrabold text-xl text-ink leading-snug group-hover:text-indigo-500 transition-colors">
                      {project.name}
                    </h3>
                    {isAdmin ? (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Eye size={9} /> Monitoring
                      </span>
                    ) : userIsOwner ? (
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

                  {/* Admin sees who owns the project */}
                  {isAdmin && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400/80">
                      <Crown size={11} />
                      <span>Manager: <strong>{ownerName}</strong></span>
                    </div>
                  )}

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
                      {/* Admin cannot delete projects — only managers can */}
                      {!isAdmin && userIsOwner && (
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