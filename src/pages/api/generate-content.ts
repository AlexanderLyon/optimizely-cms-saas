import { IncomingForm } from 'formidable-serverless'
import OpenAI from 'openai'
const fs = require('fs')
import { Page } from '@/types/pageSchema'

const openai = new OpenAI()

export const config = {
	api: {
		bodyParser: false,
	},
}

const encodeImage = (imagePath) => {
	const imageBuffer = fs.readFileSync(imagePath)
	return imageBuffer.toString('base64')
}

const handler = async (req, res) => {
	const form = new IncomingForm()

	form.parse(req, async (err, fields, files) => {
		if (err) {
			res.status(500).json({ error: 'Error parsing form data' })
			return
		}

		const file = files.image
		const filePath = file.path
		const base64Image = encodeImage(filePath)

		try {
			const response = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				max_tokens: 1000,
				messages: [
					{
						role: 'system',
						content:
							'You are a content author responsible for building a website page. Interpret the supplied design image and extract relevant data to build the page.',
					},
					{
						role: 'user',
						content: [
							{
								type: 'image_url',
								image_url: {
									url: `data:image/jpeg;base64,${base64Image}`,
									detail: 'low',
								},
							},
						],
					},
				],
				response_format: {
					type: 'json_schema',
					json_schema: {
						name: 'reasoning_schema',
						strict: true,
						schema: {
							type: 'object',
							properties: {
								page_title: {
									type: 'string',
									description: 'The title of the page.',
								},
								text_content: {
									type: 'string',
									description:
										'Body text content (excluding the title text) found on the page in HTML format. Use tailwind classes for text and layout styling.',
								},
								has_image: {
									type: 'boolean',
									description:
										'true if the provided design includes an image within its content, false if no clear image is visibile. Look for an image potentially being used as a hero banner or background.',
								},
								image_position: {
									type: 'string',
									enum: ['top', 'left', 'right'],
									description:
										'If provided design includes an image within its content, determine whether it is positioned on the top, left, or right side of the page.',
								},
								image_description: {
									type: 'string',
									description:
										'A descriptive sentence that accurately represents the content of an image if any exists on the page. If there are people in the image, pay special attention to matching their visual features. Structure this as a prompt to be used in re-creating the image.',
								},
								page_tags: {
									type: 'array',
									items: {
										type: 'string',
									},
									description:
										'A short list of individual 1 to 2 word topics that accurately describe the text on this page.',
								},
							},
							required: [
								'page_title',
								'text_content',
								'has_image',
								'image_position',
								'image_description',
								'page_tags',
							],
							additionalProperties: false,
						},
					},
				},
			})

			console.log(
				'OpenAI tokens used in this request:',
				response?.usage?.total_tokens || 'unknown'
			)

			if (response.choices[0].message.content) {
				const generatedContent: Page = JSON.parse(response.choices[0].message.content)
				res.status(200).json(generatedContent)
			}
		} catch (error) {
			console.error(error)
			res.status(500).json({ error: 'Error generating content' })
		}
	})
}

export default handler

