"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { slugify } from '@/lib/utils'

export function OrganizationSetupForm() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      name,
      slug: slugify(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: 'Organization created successfully!',
        })
        router.push(`/${data.organization.slug}`)
      } else {
        const data = await response.json()
        toast({
          title: 'Error',
          description: data.message || 'Something went wrong.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">
            Organization Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Enter organization name"
            value={formData.name}
            onChange={handleNameChange}
          />
        </div>
        
        <div>
          <Label htmlFor="slug">
            Organization URL (Slug)
          </Label>
          <Input
            id="slug"
            name="slug"
            type="text"
            required
            placeholder="organization-url"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            This will be used in your organization URL: yourdomain.com/{formData.slug || 'organization-url'}
          </p>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating organization...' : 'Create Organization'}
        </Button>
      </div>
    </form>
  )
}