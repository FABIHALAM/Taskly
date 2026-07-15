import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full border rounded px-3 py-2"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register('email', { required: 'Email is required' })}
            className="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            className="w-full border rounded px-3 py-2"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  )
}

export default Register