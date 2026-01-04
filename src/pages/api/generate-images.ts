import OpenAI from 'openai'

const openai = new OpenAI({
	timeout: 60000, // 60 seconds
})

export const config = {
	api: {
		bodyParser: true,
	},
}

const generateImage = async (prompt) => {
	try {
		console.log('🖼️ Generating image...' + prompt)
		const response = await openai.images.generate({
			model: 'dall-e-3',
			size: '1792x1024',
			n: 1,
			prompt,
		})

		return response.data[0].url
	} catch (error) {
		console.error('Error generating image:', error)
	}
}

const handler = async (req, res) => {
	const { prompt } = req.body

	if (!prompt) {
		res.status(400).json({ error: 'No image prompt provided' })
		return
	}

	const imageUrl = await generateImage("Generate a photo of " + prompt)

	if (!imageUrl) {
		res.status(500).json({ error: 'Failed to generate image' })
		return
	}

	res.status(200).json({ imageUrl })
}

export default handler

