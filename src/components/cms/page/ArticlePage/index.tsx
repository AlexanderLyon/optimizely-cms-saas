import { OptimizelyNextPage as CmsComponent } from '@remkoj/optimizely-cms-nextjs'
import { ArticlePageDataFragmentDoc, type ArticlePageDataFragment } from '@/gql/graphql'
import Image from 'next/image'
import { getSdk } from '@/sdk'
import { CmsEditable, getServerContext } from '@remkoj/optimizely-cms-react/rsc'
import { getLabel } from '@/labels'
import { RichText } from '@remkoj/optimizely-cms-react/components'

export const ArticlePagePage: CmsComponent<ArticlePageDataFragment> = async ({
	data,
	contentLink,
}) => {
	const { factory } = getServerContext()

	const ArticleTitle = () => (
		<CmsEditable as="h1" cmsFieldName="articleTitle">
			{data.articleTitle}
		</CmsEditable>
	)

	const ArticleBody = () => (
		<div className="mt-16">
			<CmsEditable
				as={RichText}
				cmsFieldName="articleBody"
				text={data.articleBody?.json}
				factory={factory}
			/>
		</div>
	)

	const ArticleHeroImages = () => (
		<>
			{/* {(data.heroImageUrl1 || data.heroImageUrl2) && (
				<div
					className="div-hero-image-default bg-light-grey"
					style={{
						height: '400px',
						width: '100%',
					}}
				></div>
			)} */}
			{data.heroImageUrl1 && (
				<div className="div-hero-image-1">
					<Image
						src={data.heroImageUrl1}
						alt={data.articleTitle || 'Hero Image'}
						layout="responsive"
						width={1200}
						height={800}
						style={{ objectFit: 'cover' }}
						className="hero-image-1 m-0 mb-10"
					/>
				</div>
			)}

			{data.heroImageUrl2 && (
				<div className="div-hero-image-2">
					<Image
						src={data.heroImageUrl2}
						alt={data.articleTitle || 'Hero Image'}
						layout="responsive"
						width={1200}
						height={800}
						style={{ objectFit: 'cover'}}
						className="hero-image-2 m-0 mb-10"
					/>
				</div>
			)}
		</>
	)

	return (
		<div className="type:article-page">
			<div className="outer-padding">
				<div className="container mb-8 mx-auto">
					<div className="mx-auto prose max-w-screen-xl bg-ghost-white lg:py-16 text-vulcan dark:bg-vulcan dark:text-ghost-white lg:rounded-t-[20px]">
						{data.imagePosition && data.imagePosition.toLowerCase() === 'left' ? (
							<div className="flex flex-col lg:flex-row lg:space-x-8">
								<div className="flex-shrink-0 lg:w-1/3">
									<ArticleHeroImages />
								</div>
								<div className="lg:w-2/3">
									<ArticleTitle />
									<ArticleBody />
								</div>
							</div>
						) : data.imagePosition && data.imagePosition.toLowerCase() === 'right' ? (
							<div className="flex flex-col lg:flex-row lg:space-x-8">
								<div className="lg:w-2/3">
									<ArticleTitle />
									<ArticleBody />
								</div>
								<div className="flex-shrink-0 lg:w-1/3">
									<ArticleHeroImages />
								</div>
							</div>
						) : (
							<>
								<ArticleHeroImages />
								<ArticleTitle />
								<ArticleBody />
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

/**
 * Bind the data fetching fragment
 *
 * @returns     The fragment to use to fetch data for an Article Page
 */
ArticlePagePage.getDataFragment = () => ['ArticlePageData', ArticlePageDataFragmentDoc]

/**
 * Resolve the metadata for a given instance of an Article Page
 *
 * @param       contentLink     The current Article Page
 * @returns     The Next.JS metadata for the page
 */
ArticlePagePage.getMetaData = async (contentLink) => {
	const sdk = getSdk()
	const response = await sdk.getArticlePageMetaData(contentLink)
	const experienceData = (response?.BlankExperience?.items || [])[0]
	const title =
		experienceData?.SeoSettings?.metaTitle ??
		experienceData?._metadata?.displayName ??
		'Mosey Bank - An Optimizely Demo'
	return {
		title: title,
	}
}

export default ArticlePagePage

