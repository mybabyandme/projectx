import { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, ArrowLeft, CheckCircle, Star, Globe } from 'lucide-react'
import { SignUpForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your AgileTrack Pro account and start managing projects professionally',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="flex min-h-screen">
        {/* Left Panel - Sign Up Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AgileTrack Pro</h1>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">
                Start managing projects like a pro
              </p>
            </div>

            <SignUpForm />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Sign in instead
                </Link>
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-3">What you'll get:</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Free 30-day trial with all features</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Unlimited projects and team members</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Features & Social Proof */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            {/* Logo */}
            <div className="mb-12">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">AgileTrack Pro</h1>
                  <p className="text-indigo-100 text-sm">Enterprise Project Management</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Join thousands of teams already using AgileTrack Pro
                </h2>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  Transform your project management with our comprehensive platform 
                  designed for modern organizations.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">10K+</div>
                  <div className="text-indigo-200 text-sm">Projects Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">500+</div>
                  <div className="text-indigo-200 text-sm">Organizations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">99.9%</div>
                  <div className="text-indigo-200 text-sm">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">4.9/5</div>
                  <div className="text-indigo-200 text-sm flex items-center justify-center">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Rating
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Global NGO</div>
                    <div className="text-indigo-200 text-sm">Managing 50+ projects</div>
                  </div>
                </div>
                <p className="text-indigo-100 italic">
                  "AgileTrack Pro revolutionized how we manage our international development projects. 
                  The role-based access control is perfect for our donor reporting requirements."
                </p>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center space-x-4 text-indigo-200 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>SOC 2 Certified</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}