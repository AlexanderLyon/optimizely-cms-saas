import React, { useState, useEffect, ChangeEvent } from 'react'
import Image from 'next/image'
import { Button } from '@/components/shared/button'

interface ImageSelectionProps {
	loading?: boolean
	generatedImage?: File | null
	imagePrompt?: string
	updateImages: (paths: File[]) => void
}

interface ImageCardProps {
	src: string
	alt: string
	isSelected: boolean
	onSelect: (src: string) => void
	children?: React.ReactNode
}

const ImageCard: React.FC<ImageCardProps> = ({ src, alt, isSelected, onSelect, children }) => {
	return (
		<div className="border">
			<div
				className="cursor-pointer p-4"
				onClick={() => {
					onSelect(src)
				}}
			>
				<input
					type="checkbox"
					checked={isSelected}
					readOnly
					id="image"
					name="image"
					value={src}
				/>
				<Image src={src} width={300} height={300} alt={alt} />
			</div>
			{children}
		</div>
	)
}

export const ImageSelection: React.FC<ImageSelectionProps> = ({
	loading = false,
	generatedImage,
	imagePrompt,
	updateImages,
}) => {
	const [userImageSelected, setUserImageSelected] = useState(false)
	const [generatedImageSelected, setGeneratedImageSelected] = useState(false)
	const [userImage, setUserImage] = useState<File | null>(null)

	const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) {
			setUserImage(null)
		} else {
			setUserImage(e.target.files[0])
		}
	}

	useEffect(() => {
		const imageFiles: File[] = []
		if (userImageSelected && userImage) {
			imageFiles.push(userImage)
		}
		if (generatedImageSelected && generatedImage) {
			imageFiles.push(generatedImage)
		}

		updateImages(imageFiles)
	}, [userImageSelected, generatedImageSelected, userImage, generatedImage])

	return (
		<div>
			<p>
				Choose whether to experiment with an AI-generated image, and/or upload the original
				image from your design. Each selection made here will create a new article page
				using the chosen hero image.
			</p>
			<em>{imagePrompt}</em>
			<div className="flex gap-4">
				{loading ? (
					<div className="h-80 w-80 bg-ghost-white border flex align-center justify-center">
						<Image
							src="/loading-dots.svg"
							width={50}
							height={50}
							className="w-12 m-auto"
							alt="Creating images..."
						/>
					</div>
				) : generatedImage ? (
					<ImageCard
						isSelected={generatedImageSelected}
						onSelect={() => setGeneratedImageSelected(!generatedImageSelected)}
						src={URL.createObjectURL(generatedImage)}
						alt={imagePrompt || 'Generated Image'}
					/>
				) : null}
				{userImage ? (
					<>
						<ImageCard
							isSelected={userImageSelected}
							onSelect={() => setUserImageSelected(!userImageSelected)}
							src={URL.createObjectURL(userImage)}
							alt="User Image"
						>
							<Button
								className="mb-4"
								buttonType="secondary"
								onClick={() => {
									setUserImage(null)
									if (userImageSelected) {
										setUserImageSelected(false)
									}
								}}
							>
								Remove image
							</Button>
						</ImageCard>
					</>
				) : (
					<div className="border p-4">
						<p>Upload original image</p>
						<input type="file" onChange={handleImageUpload} />
					</div>
				)}
			</div>
		</div>
	)
}

