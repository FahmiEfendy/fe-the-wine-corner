import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'The Wine Corner';
const DEFAULT_DESCRIPTION = "Discover The Wine Corner's curated collection of premium wines from the world's most renowned vineyards.";
const DEFAULT_IMAGE = 'https://wine.fahmiefendy.dev/src/assets/logo-wine-corner-min.webp';

const Seo = ({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, url, noIndex = false }) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Exquisite Wines for Every Moment`;
    const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : undefined);

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:site_name" content={SITE_NAME} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default Seo;
