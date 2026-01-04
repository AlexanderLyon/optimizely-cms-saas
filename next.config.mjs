const optimizelyCmsUrl = new URL(process.env.OPTIMIZELY_CMS_URL ?? 'http://localhost:3000')

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			// Allow images from the configured Optimizely CMS URL
			{
				protocol: optimizelyCmsUrl.protocol.replace(':', ''),
				hostname: optimizelyCmsUrl.hostname,
				port: optimizelyCmsUrl.port,
				pathname: '/globalassets/**',
			},
			{
				protocol: 'https',
				hostname: 'oaidalleapiprodscus.blob.core.windows.net',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'rightpoint-optimizely-hackathon.s3.us-east-2.amazonaws.com',
				port: '',
				pathname: '/uploads/**',
			},
		],
	},
}

/**
console.log(' 🚀 Site configuration')
nextConfig.images.remotePatterns.forEach(pattern => {
  console.log(`  - White-listing images matching: ${ pattern.protocol }://${ pattern.hostname }${ pattern.port ? ':' + pattern.port : '' }${ pattern.pathname }`)
})
console.log('')
*/

export default nextConfig

