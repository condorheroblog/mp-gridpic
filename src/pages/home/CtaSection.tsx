/**
 * 底部行动召唤 - 引导用户进入编辑器。
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "../../components/shared/Button";

export function CtaSection() {
	const { t } = useTranslation();
	return (
		<section className="bg-white py-16 dark:bg-zinc-900 sm:py-20">
			<div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 text-center">
				<h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
					{t("home.cta.title")}
				</h2>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
					{t("home.cta.desc")}
				</p>
				<Link to="/editor">
					<Button variant="primary" className="px-6 py-3 text-base">
						<span>{t("home.cta.button")}</span>
						<span aria-hidden>→</span>
					</Button>
				</Link>
			</div>
		</section>
	);
}
