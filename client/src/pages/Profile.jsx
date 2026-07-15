import DashboardLayout from '../layout/DashboardLayout'

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold mb-6">Profile</h1>
        <div className="bg-surface border border-line rounded-2xl p-6">
          <div className="mb-4">
            <label className="text-xs text-gray-500">Name</label>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500">Email</label>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile