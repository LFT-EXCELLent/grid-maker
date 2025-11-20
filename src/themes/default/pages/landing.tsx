import { Landing } from '@/shared/types/blocks/landing';
import {
  CTA,
  FAQ,
  Features,
  FeaturesAccordion,
  FeaturesList,
  FeaturesStep,
  Hero,
  PortraitRetouchEditor,
  Stats,
  Testimonials,
} from '@/themes/default/blocks';

export default async function LandingPage({
  locale,
  page,
}: {
  locale?: string;
  page: Landing;
}) {
  return (
    <>
      {page.hero && <Hero hero={page.hero} />}
      {page.portrait_retouch_editor && (
        <PortraitRetouchEditor portraitRetouch={page.portrait_retouch_editor} />
      )}
      {page.usage && <FeaturesStep features={page.usage} />}
      {page.introduce && <FeaturesList features={page.introduce} />}
      {page.benefits && <FeaturesAccordion features={page.benefits} />}
      {page.features && <Features features={page.features} />}
      {page.stats && <Stats stats={page.stats} className="bg-muted" />}
      {page.testimonials && <Testimonials testimonials={page.testimonials} />}
      {page.faq && <FAQ faq={page.faq} />}
      {page.cta && <CTA cta={page.cta} className="bg-muted" />}
    </>
  );
}
