import React, { useState, ChangeEvent } from 'react'
import Image from 'next/image'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/shared/button'
import { Card } from '@/components/shared/Card'

interface ImageUploadProps {
	onUpload: (data: any) => void
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [image, setImage] = useState<File | null>(null)

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return
		setImage(e.target.files[0])
	}

	const handleUpload = async () => {
		if (!image) return

		setLoading(true)
		const formData = new FormData()
		formData.append('image', image)
		await onUpload(formData)
		setLoading(false)
	}

	return (
		<Card cardColor="white" className="w-full h-full my-8">
			<h3>Step 01: Import a design</h3>
			<p>
				Upload an image (in either jpg or png format) of your desired article page content.
			</p>
			<input type="file" onChange={handleImageChange} />
			{image && (
				<div className="flex flex-col">
					<Image
						src={URL.createObjectURL(image)}
						height="200"
						width="200"
						alt="Uploaded image"
					/>
					<Button
						onClick={handleUpload}
						className={loading ? 'pointer-events-none disabled:bg-slate-50' : ''}
					>
						{loading ? (
							<div className="flex gap-5 items-center justify-center">
								<Image
									src="/loading-dots.svg"
									width={40}
									height={40}
									className="w-9 m-0"
									alt="Processing image..."
								/>
								<span className="m-0">Processing...</span>
							</div>
						) : (
							<div className="flex gap-5 items-center justify-center">
								<SparklesIcon className="h-8 w-8" />
								Process Design
							</div>
						)}
					</Button>
				</div>
			)}
		</Card>
	)
}

