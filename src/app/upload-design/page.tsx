'use client'
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import axios from 'axios'
import { AuthProvider } from '@/context/authContext'
import { Page } from '@/types/pageSchema'
import { ImageUpload } from '@/components/image-upload'
import { VisualBuilderForm } from '@/components/visual-builder-form'

const DesignUpload = () => {
	const [loading, setLoading] = useState<boolean>(false)
	const [generatedContent, setGeneratedContent] = useState<Page | null>(null)
	const [loadingImages, setLoadingImages] = useState<boolean>(false)
	const [generatedImage, setGeneratedImage] = useState<File | null>()

	const analyzeImage = async (formData: FormData) => {
		try {
			setLoading(true)
			setGeneratedContent(null)

			if (!formData) {
				throw new Error('No image data provided')
			}

			const response = await axios.post('/api/generate-content', formData)

			if (!response.data) {
				throw new Error('No data returned from API')
			}

			setGeneratedContent(response.data)
		} catch (error) {
			console.error('Error processing image', error)
		} finally {
			setLoading(false)
		}
	}

	const generateImages = async (prompt: string) => {
		try {
			setLoadingImages(true)
			const response = await axios.post('/api/generate-images', { prompt })

			if (!response.data || !response.data.imageUrl) {
				throw new Error('Unable to generate image')
			}

			// Fetch the file based on URL from OpenAI:
			const blob: any = await axios.get('/api/load-open-ai-image', {
				params: {
					url: response.data.imageUrl,
				},
				responseType: 'blob',
			})

			const file = new File([blob.data], 'generated-image.png', {
				type: blob.type,
				lastModified: Date.now(),
			})
			setGeneratedImage(file)
		} catch (error) {
			console.error('Error generating images', error)
		} finally {
			setLoadingImages(false)
		}
	}

	useEffect(() => {
		if (generatedContent && generatedContent.has_image && generatedContent.image_description) {
			generateImages(generatedContent.image_description)
		} else {
			setGeneratedImage(null)
		}
	}, [generatedContent])

	return (
		<div>
			<h1 className="text-[25px] font-semibold">Visual Design Importer</h1>
			<ImageUpload onUpload={analyzeImage} />
			{generatedContent ? (
				<VisualBuilderForm
					pageContent={generatedContent}
					generatedImage={generatedImage}
					loadingImages={loadingImages}
				/>
			) : null}
		</div>
	)
}

export default function DesignUploadPage() {
	return (
		<div>
			<Head>
				<title>Upload Design</title>
			</Head>
			<main className="max-w-screen-xl mx-auto my-20">
				<AuthProvider>
					<DesignUpload />
				</AuthProvider>
			</main>
		</div>
	)
}

