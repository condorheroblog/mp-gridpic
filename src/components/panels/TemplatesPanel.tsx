/**
 * 模板面板 - 保存/应用/重命名/删除
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getLayoutPreset } from "../../data/layouts";
import { getStylePreset } from "../../data/styles";
import { useDocumentStore } from "../../stores/documentStore";
import { useTemplateStore } from "../../stores/templateStore";
import { useToastStore } from "../../stores/toastStore";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/Field";

export function TemplatesPanel() {
	const { t } = useTranslation();
	const templates = useTemplateStore(state => state.templates);
	const save = useTemplateStore(state => state.save);
	const remove = useTemplateStore(state => state.remove);
	const rename = useTemplateStore(state => state.rename);
	const docLayout = useDocumentStore(state => state.layoutId);
	const docStyle = useDocumentStore(state => state.styleId);
	const docImages = useDocumentStore(state => state.images);
	const load = useDocumentStore(state => state.loadFromTemplate);
	const pushToast = useToastStore(state => state.push);
	const [name, setName] = useState("");

	const handleSave = () => {
		const finalName = name.trim() || `Template ${templates.length + 1}`;
		save(finalName, docLayout, docStyle, docImages);
		setName("");
		pushToast(t("templates.save"), "success");
	};

	return (
		<section className="flex flex-col gap-3">
			<header className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("templates.title")}</h2>
			</header>
			<div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
				<TextInput
					label={t("templates.namePlaceholder")}
					value={name}
					onChange={setName}
					placeholder={t("templates.namePlaceholder")}
				/>
				<Button variant="primary" onClick={handleSave}>{t("templates.save")}</Button>
			</div>
			{templates.length === 0
				? (
					<p className="text-xs text-zinc-400 dark:text-zinc-500">{t("templates.empty")}</p>
				)
				: (
					<ul className="flex flex-col gap-2">
						{templates.map(template => (
							<TemplateRow
								key={template.id}
								id={template.id}
								name={template.name}
								layoutId={template.layoutId}
								styleId={template.styleId}
								onApply={() => load(template.layoutId, template.styleId)}
								onRename={next => rename(template.id, next)}
								onDelete={() => remove(template.id)}
							/>
						))}
					</ul>
				)}
		</section>
	);
}

interface TemplateRowProps {
	id: string
	name: string
	layoutId: string
	styleId: string
	onApply: () => void
	onRename: (next: string) => void
	onDelete: () => void
}

function TemplateRow({ name, layoutId, styleId, onApply, onRename, onDelete }: TemplateRowProps) {
	const { t } = useTranslation();
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(name);
	const layout = getLayoutPreset(layoutId);
	const style = getStylePreset(styleId);
	const styleKey = style.nameKey.split(".").pop() ?? "standard";
	return (
		<li
			className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
		>
			<div className="flex items-center gap-2">
				{editing
					? (
						<TextInput
							value={draft}
							onChange={setDraft}
							placeholder={t("templates.namePlaceholder")}
						/>
					)
					: (
						<span className="font-medium text-zinc-800 dark:text-zinc-100">{name}</span>
					)}
				<span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
					{t(`layout.${layout.kind}`)}
					{" "}
					·
					{t(`style.${styleKey}`)}
				</span>
			</div>
			<div className="flex items-center gap-2">
				<Button onClick={onApply}>{t("templates.apply")}</Button>
				{editing
					? (
						<>
							<Button
								onClick={() => {
									onRename(draft);
									setEditing(false);
								}}
							>
								{t("common.confirm")}
							</Button>
							<Button
								variant="ghost"
								onClick={() => {
									setEditing(false);
									setDraft(name);
								}}
							>
								{t("common.cancel")}
							</Button>
						</>
					)
					: (
						<Button onClick={() => setEditing(true)}>{t("templates.rename")}</Button>
					)}
				<Button variant="danger" onClick={onDelete}>{t("templates.delete")}</Button>
			</div>
		</li>
	);
}
