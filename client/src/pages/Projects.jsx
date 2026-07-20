import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, Users, Trash2, Crown, UserCheck } from 'lucide-react'
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
      toast.success('Project created!')
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
      <div className="max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-gray-500 mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
              {!isManager && (
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  👷 Member View
                </span>
              )}
            </p>
          </div>

          {/* Only managers can create projects */}
          {isManager ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> New Project
            </button>
          ) : (
            <div className="text-xs text-gray-400 italic">
              Contact a manager to create projects
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl p-12 text-center">
            <FolderKanban className="mx-auto text-gray-300 mb-3" size={36} />
            <h3 className="font-display font-semibold text-lg">
              {isManager ? 'No projects yet' : 'No projects assigned to you yet'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isManager
                ? 'Create your first project to start organizing tasks.'
                : 'Ask your manager to add you to a project.'
              }
            </p>
            {isManager && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus size={15} /> Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project, index) => {
              const userIsOwner = project.owner?._id === currentUser.id || project.owner === currentUser.id
              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-surface border border-line border-l-4 border-l-primary rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Project Name + Role Badge */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display font-semibold text-lg leading-snug">{project.name}</h3>
                    {userIsOwner ? (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                        <Crown size={9} /> Manager
                      </span>
                    ) : (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        <UserCheck size={9} /> Member
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Users size={13} />
                      <span className="text-xs">
                        {project.members?.length || 1} member{project.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {/* Delete — only owner can delete */}
                      {userIsOwner && (
                        <button
                          onClick={(e) => handleDeleteClick(e, project._id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
        message="This will remove the project from your workspace. Members will lose access."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </DashboardLayout>
  )
}

export default Projects