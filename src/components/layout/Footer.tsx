import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LogoIcon } from "../icons";

const SPEC_URL = "https://developers.weixin.qq.com/doc/service/guide/product/plugin_spec.html";

export function Footer() {
	const { t } = useTranslation();
	const [year] = useState(() => new Date().getFullYear());

	return (
		<footer className="border-t border-zinc-200/70 bg-white/60 dark:border-zinc-800/70 dark:bg-zinc-950">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
				<div className="flex items-center gap-2">
					<LogoIcon className="text-2xl" />
					<div>
						<p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
							{t("common.appName")}
						</p>
						<p className="text-xs text-zinc-500">{t("footer.desc")}</p>
					</div>
				</div>

				<div className="flex flex-col items-center gap-1 text-xs text-zinc-500 sm:items-end">
					<div className="flex gap-3">
						<Link to="/editor" className="hover:text-indigo-600 dark:hover:text-indigo-400">
							{t("nav.editor")}
						</Link>
						<a
							href={SPEC_URL}
							target="_blank"
							rel="noreferrer"
							className="hover:text-indigo-600 dark:hover:text-indigo-400"
						>
							{t("footer.spec")}
						</a>
					</div>
					<p>{t("footer.picsum")}</p>
					<p>
						©
						{year}
						{" "}
						Condor Hero ·
						{t("footer.license")}
					</p>
				</div>
			</div>
		</footer>
	);
}
