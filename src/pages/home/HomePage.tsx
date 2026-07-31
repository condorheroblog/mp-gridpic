/**
 * 首页外壳 - 串起 Hero / Showcase / Features / CTA / Footer。
 * 完全是纯组件树,不读取任何 store,避免污染编辑器的 localStorage 持久化。
 */
import { SiteHeader } from "../../components/shared/SiteHeader";
import { CtaSection } from "./CtaSection";
import { FeaturesSection } from "./FeaturesSection";
import { HeroSection } from "./HeroSection";
import { HomeFooter } from "./HomeFooter";
import { ShowcaseSection } from "./ShowcaseSection";

export function HomePage() {
	return (
		<div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
			<SiteHeader />
			<main>
				<HeroSection />
				<ShowcaseSection />
				<FeaturesSection />
				<CtaSection />
			</main>
			<HomeFooter />
		</div>
	);
}
