'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import useAuthStore from '../../store/auth.store';

const registerSchema = Yup.object().shape({
  full_name: Yup.string().min(2, 'Too short').max(80, 'Too long').required('Full name is required'),
  username: Yup.string().min(3, 'Too short').max(32, 'Too long').required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone_number: Yup.string().optional(),
  password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .required('Confirm your password'),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary">Al Ghadeer Events</h1>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">Sign in</Link>
          </p>
        </div>

        <Formik
          initialValues={{ full_name: '', username: '', email: '', phone_number: '', password: '', confirm_password: '' }}
          validationSchema={registerSchema}
          onSubmit={async (values) => {
            clearError();
            try {
              await register({
                full_name: values.full_name,
                username: values.username,
                email: values.email,
                phone_number: values.phone_number || undefined,
                password: values.password,
                role: 'staff',
              });
              router.push('/login');
            } catch (_) {
              // handled by store
            }
          }}
        >
          {({ handleSubmit }) => (
            <Form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="sr-only">Full name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      id="full_name"
                      name="full_name"
                      type="text"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Full name"
                    />
                  </div>
                  <ErrorMessage name="full_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="username" className="sr-only">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      id="username"
                      name="username"
                      type="text"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Username"
                    />
                  </div>
                  <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="phone_number" className="sr-only">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Phone (optional)"
                    />
                  </div>
                  <ErrorMessage name="phone_number" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Password"
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="confirm_password" className="sr-only">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Confirm Password"
                    />
                  </div>
                  <ErrorMessage name="confirm_password" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                  Create account
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}