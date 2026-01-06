Frontend (React/TypeScript) - Client-Side Cropping

1. React Easy Crop ⭐ BEST FOR AVATAR
   bashnpm install react-easy-crop
   Features:

✅ Drag to reposition
✅ Zoom in/out
✅ Circular crop (perfect untuk avatar)
✅ Touch-friendly (mobile support)
✅ TypeScript support
✅ Small bundle size (~10KB)

Example:
tsximport { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from './cropImage' // Helper function

export default function AvatarUploader() {
const [imageSrc, setImageSrc] = useState<string | null>(null)
const [crop, setCrop] = useState({ x: 0, y: 0 })
const [zoom, setZoom] = useState(1)
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
if (e.target.files && e.target.files.length > 0) {
const file = e.target.files[0]
const reader = new FileReader()
reader.addEventListener('load', () => {
setImageSrc(reader.result as string)
})
reader.readAsDataURL(file)
}
}

const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
setCroppedAreaPixels(croppedAreaPixels)
}, [])

const handleUpload = async () => {
try {
const croppedImage = await getCroppedImg(imageSrc!, croppedAreaPixels)

      // Upload to backend
      const formData = new FormData()
      formData.append('avatar', croppedImage)

      const response = await fetch('http://localhost:3000/api/user/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const data = await response.json()
      console.log('Avatar uploaded:', data)
    } catch (e) {
      console.error(e)
    }

}

return (

<div>
<input type="file" accept="image/*" onChange={onFileChange} />

      {imageSrc && (
        <div style={{ position: 'relative', width: '100%', height: 400 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square crop for avatar
            cropShape="round" // Circular crop
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
      )}

      <div>
        <label>Zoom</label>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
      </div>

      <button onClick={handleUpload}>Upload Avatar</button>
    </div>

)
}
Helper Function (cropImage.ts):
typescriptexport const getCroppedImg = async (
imageSrc: string,
pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
const image = await createImage(imageSrc)
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

canvas.width = pixelCrop.width
canvas.height = pixelCrop.height

ctx?.drawImage(
image,
pixelCrop.x,
pixelCrop.y,
pixelCrop.width,
pixelCrop.height,
0,
0,
pixelCrop.width,
pixelCrop.height
)

return new Promise((resolve) => {
canvas.toBlob((blob) => {
resolve(blob!)
}, 'image/jpeg', 0.9)
})
}

const createImage = (url: string): Promise<HTMLImageElement> =>
new Promise((resolve, reject) => {
const image = new Image()
image.addEventListener('load', () => resolve(image))
image.addEventListener('error', (error) => reject(error))
image.src = url
})
