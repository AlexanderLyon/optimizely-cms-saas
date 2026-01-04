import React, { useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { LinkIcon } from '@heroicons/react/24/solid'
import useOptimizelyCms from '@/components/shared/CmsContext'
import { Page } from '@/types/pageSchema'
import { CmsContentLink } from '@remkoj/optimizely-cms-nextjs/components'
import { Button } from '@/components/shared/button'
import { Card } from '@/components/shared/Card'
import { ImageSelection } from './ImageSelection'

interface VisualBuilderFormProps {
	pageContent: Page
	generatedImage?: File | null
	loadingImages?: boolean
}

export const VisualBuilderForm: React.FC<VisualBuilderFormProps> = ({
	pageContent,
	generatedImage,
	loadingImages,
}) => {
	const [loading, setLoading] = useState<boolean>(false)
	const [pageTitle, setPageTitle] = useState<string>(pageContent.page_title)
	const [textContent, setTextContent] = useState<string>(pageContent.text_content)
	const [pageTags, setPageTags] = useState<string[]>(pageContent.page_tags)
	const [heroImageFiles, setHeroImageFiles] = useState<File[] | []>([])
	const [publishedUrls, setPublishedUrls] = useState<string[]>([])
	const [imagePosition, setImagePosition] = useState<string>(pageContent.image_position || 'top')

	const createPage = async (images?: File[]): Promise<string | undefined> => {
		try {
			const formData = new FormData()
			formData.append('title', pageTitle)
			formData.append('text', textContent)
			formData.append('imagePosition', imagePosition)

			if (images) {
				images.forEach((image, index) => {
					formData.append('imageFiles', image)
				})
			}

			const response = await axios.post('/api/build-page', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			if (response.data) {
				return response.data.routeSegment
			}
		} catch (error) {
			console.error('Error creating page', error)
		}
	}

	const handleCreateNewPages = async () => {
		setLoading(true)
		if (!heroImageFiles.length) {
			// Create a single page with no hero banner image
			const url = await createPage()
			if (url) {
				setPublishedUrls([url])
			}
		} else {
			// Create a page using the specified hero banner images
			const url = await createPage(heroImageFiles)

			if (url) {
				setPublishedUrls([url])
			}
		}

		setLoading(false)
	}

	const updateHeroImages = (images: File[]) => {
		if (images?.length) {
			setHeroImageFiles(images)
		} else {
			setHeroImageFiles([])
		}
	}

	const FieldWrapper: React.FC<{ children; label }> = ({ children, label }) => (
		<div className="flex flex-col my-4">
			<label>{label}</label>
			{children}
		</div>
	)

	return (
		<Card cardColor="white" className="w-full h-full my-8">
			{publishedUrls && publishedUrls.length > 0 ? (
				<>
					<p>Page{publishedUrls.length > 1 && 's'} created successfully!</p>
					{publishedUrls.map((publishedUrl, i) => (
						<p key={i}>
							<div className="flex items-center gap-2">
								<LinkIcon className="h-8 w-8" />
								<CmsContentLink href={`/pages/${publishedUrl}`}>
									View the page here
								</CmsContentLink>
							</div>
						</p>
					))}
				</>
			) : (
				<>
					<h3>Step 02: Review</h3>
					<p>
						Re-read the generated information below and make any necessary edits. When
						you&apos;re finished, click &apos;Create Page&apos; to create the new
						article page!
					</p>
					<div className="flex flex-col my-8">
						<FieldWrapper label="Article Title">
							<input
								type="text"
								placeholder="Page Title"
								className="p-4 border-[2px] border-vulcan"
								defaultValue={pageTitle || ''}
								onBlur={(e) => setPageTitle(e.target.value)}
							/>
						</FieldWrapper>
						<FieldWrapper label="Body Text">
							<textarea
								placeholder="Text Content"
								defaultValue={textContent || ''}
								onBlur={(e) => setTextContent(e.target.value)}
								className="min-h-[200px] p-4 border-[2px] border-vulcan"
							/>
						</FieldWrapper>
						{pageContent.has_image && pageContent.image_description ? (
							<ImageSelection
								loading={loadingImages}
								generatedImage={generatedImage}
								imagePrompt={pageContent.image_description}
								updateImages={(images) => updateHeroImages(images)}
							/>
						) : null}
						{pageTags?.length && (
							<FieldWrapper label="Tags">
								<div className="flex">
									{pageTags.map((tag, index) => (
										<span key={`tag-${index}`} className="border-[2px] p-3 m-3">
											{tag}
										</span>
									))}
								</div>
							</FieldWrapper>
						)}
						<Button
							type="submit"
							onClick={handleCreateNewPages}
							className={`text-center my-8 ${
								loading && 'pointer-events-none disabled:bg-slate-50'
							}`}
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
									<span className="m-0">Creating page...</span>
								</div>
							) : (
								'Create Page'
							)}
						</Button>
					</div>
				</>
			)}
		</Card>
	)
}

