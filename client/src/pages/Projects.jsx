import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, Users, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../layout/DashboardLayout'
import CreateProjectModal from '../components/CreateProjectModal'
import { createProject, getMyProjects, deleteProject } from '../services/projectService'
import ConfirmDialog from '../components/ConfirmDialog'

function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const result = await getMyProjects()
      setProjects(result.data)
    } catch (error) {
      console.error('Failed to fetch projects', error)
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
    toast.error('Failed to delete project')
  }
}

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-gray-500 mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="bg-surface border border-line rounded-2xl p-10 text-center">
            <FolderKanban className="mx-auto text-gray-300" size={32} />
            <h3 className="font-display font-semibold mt-3">No projects yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first project to start organizing tasks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-surface border border-line border-l-4 border-l-primary rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-display font-semibold text-lg">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                  {project.description || 'No description provided.'}
                </p>

               <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
  <div className="flex items-center gap-1.5 text-gray-400">
    <Users size={14} />
    <span className="text-xs font-mono">
      {project.members?.length || 1} member{project.members?.length !== 1 ? 's' : ''}
    </span>
  </div>
  <div className="flex items-center gap-3">
    <span className="text-xs font-mono text-gray-400">
      {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
    <button
      onClick={(e) => handleDeleteClick(e, project._id)}
      className="text-gray-300 hover:text-red-500 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  </div>
</div>
              </motion.div>
            ))}
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
        message="This will remove the project and hide it from your workspace."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </DashboardLayout>
  )
}
      
      
      
      
   


export default Projects