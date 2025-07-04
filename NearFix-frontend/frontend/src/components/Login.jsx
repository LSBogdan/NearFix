import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';
import { ROUTES, UI } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTouched, setIsTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const { login } = useAuth();

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Check if form is valid
  const isFormValid = () => {
    return email.trim() !== '' && 
           validateEmail(email) && 
           password.trim() !== '';
  };

  const validateEmailInput = (value) => {
    if (!value.trim()) {
      return 'Email is required';
    } else if (!validateEmail(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePasswordInput = (value) => {
    if (!value.trim()) {
      return 'Password is required';
    }
    return '';
  };

  const handleBlur = (field) => {
    setIsTouched({ ...isTouched, [field]: true });
    
    if (field === 'email') {
      const error = validateEmailInput(email);
      setEmailError(error);
    } else if (field === 'password') {
      const error = validatePasswordInput(password);
      setPasswordError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const newTouched = { email: true, password: true };
    setIsTouched(newTouched);
    
    // Validate email
    const emailValidationError = validateEmailInput(email);
    setEmailError(emailValidationError);
    
    // Validate password
    const passwordValidationError = validatePasswordInput(password);
    setPasswordError(passwordValidationError);
    
    // Check if form is valid
    if (emailValidationError || passwordValidationError) {
      setError('');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(ROUTES.HOME);
      } else {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#f6f3e3] flex items-center justify-center py-8 overflow-x-hidden">
      <div className="w-full max-w-md px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
          <h2 className="text-4xl font-bold text-[#708eb3] mb-8 text-center">Welcome Back</h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[#819bb9] font-medium" htmlFor="email">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Clear error when user starts typing
                  if (emailError) {
                    const error = validateEmailInput(e.target.value);
                    setEmailError(error);
                  }
                }}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 border ${emailError && isTouched.email ? 'border-red-400' : 'border-[#a4b5c5]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300`}
                required
                disabled={isLoading}
                aria-invalid={!!emailError && isTouched.email}
                aria-describedby={emailError && isTouched.email ? 'email-error' : undefined}
              />
              {emailError && isTouched.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-[#819bb9] font-medium" htmlFor="password">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      // Clear error when user starts typing
                      if (passwordError) {
                        const error = validatePasswordInput(e.target.value);
                        setPasswordError(error);
                      }
                    }}
                    onBlur={() => handleBlur('password')}
                    className={`w-full px-4 py-3 pr-12 border ${passwordError && isTouched.password ? 'border-red-400' : 'border-[#a4b5c5]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300`}
                    required
                    disabled={isLoading}
                    aria-invalid={!!passwordError && isTouched.password}
                    aria-describedby={passwordError && isTouched.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#819bb9] transition-colors duration-300"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && isTouched.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#92a8bf] hover:bg-[#819bb9] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
              disabled={isLoading || !isFormValid()}
              title={!isFormValid() ? 'Please fill in all required fields' : ''}
            >
              {isLoading ? <Spinner /> : 'Login'}
            </button>
          </form>
          <p className="mt-6 text-center text-[#a4b5c5]">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-[#92a8bf] hover:text-[#819bb9] font-medium transition-colors duration-300">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 