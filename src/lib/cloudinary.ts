import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Helper function for uploading files
export async function uploadFile(
  file: File | Buffer,
  options?: {
    folder?: string
    public_id?: string
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
  }
) {
  try {
    const result = await cloudinary.uploader.upload(
      file instanceof File ? await fileToBase64(file) : `data:image/jpeg;base64,${file.toString('base64')}`,
      {
        folder: options?.folder || 'agiletrack',
        public_id: options?.public_id,
        resource_type: options?.resource_type || 'auto',
      }
    )

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file')
  }
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Delete file from Cloudinary
export async function deleteFile(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}