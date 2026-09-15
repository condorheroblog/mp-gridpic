import type { DragEndEvent } from "@dnd-kit/core";
import type { PicItem } from "../../lib/types";
import {
	closestCenter,
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { LAYOUT_MAP, LIMITS } from "../../lib/constants";
import { isValidImageUrl } from "../../lib/picsum";
import { useEditorStore } from "../../store/editor";
import { toast } from "../../store/toast";
import {
	GripIcon,
	LinkIcon,
	PlusIcon,
	RefreshIcon,
	ShuffleIcon,
	TrashIcon,
} from "../icons";
import { Button, Field, IconButton, TextInput } from "../ui";

/* ------------------------------ 缩略图加载 ------------------------------ */

function Thumb({ src }: { src: string }) {
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		setLoaded(false);
	}, [src]);

	return (
		<div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
			{!loaded && <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />}
			<img
				src={src}
				alt=""
				loading="lazy"
				onLoad={() => setLoaded(true)}
				onError={() => setLoaded(false)}
				className={cn(
					"size-full object-cover transition-opacity duration-300",
					loaded ? "opacity-100" : "opacity-0",
				)}
			/>
		</div>
	);
}

/* ------------------------------ 链接编辑器 ------------------------------ */

function UrlEditor({ item }: { item: PicItem }) {
	const { t } = useTranslation();
	const setImageSrc = useEditorStore(state => state.setImageSrc);
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(item.src);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!open) {
			setDraft(item.src);
			setError("");
		}
	}, [item.src, open]);

	const save = () => {
		if (!isValidImageUrl(draft)) {
			setError(t("editor.urlInvalid"));
			return;
		}
		setImageSrc(item.id, draft);
		setOpen(false);
		toast(t("editor.urlSaved"), "success");
	};

	if (!open) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="block w-full truncate rounded-md bg-zinc-50 px-2 py-1 text-left text-[11px] text-zinc-400 transition-colors hover:text-indigo-600 dark:bg-zinc-800/70 dark:hover:text-indigo-400"
				title={item.src}
			>
				{item.src}
			</button>
		);
	}

	return (
		<div className="space-y-1.5">
			<TextInput
				value={draft}
				invalid={Boolean(error)}
				autoFocus
				inputMode="url"
				placeholder="https://…"
				className="h-8 text-xs"
				onChange={event => setDraft(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						save();
					}
					if (event.key === "Escape") {
						setOpen(false);
					}
				}}
			/>
			{error && <p className="text-[11px] text-red-500">{error}</p>}
			<div className="flex gap-1.5">
				<Button size="sm" variant="primary" onClick={save}>
					{t("common.save")}
				</Button>
				<Button size="sm" onClick={() => setOpen(false)}>
					{t("common.cancel")}
				</Button>
			</div>
		</div>
	);
}

/* ------------------------------ 可排序卡片 ------------------------------ */

interface SortableCardProps {
	item: PicItem
	index: number
	hiddenInLayout: boolean
}

function SortableCard({ item, index, hiddenInLayout }: SortableCardProps) {
	const { t } = useTranslation();
	const setCaption = useEditorStore(state => state.setCaption);
	const shuffleOne = useEditorStore(state => state.shuffleOne);
	const removeImage = useEditorStore(state => state.removeImage);
	const imageCount = useEditorStore(state => state.images.length);
	const layout = useEditorStore(state => state.layout);
	const countLocked = Boolean(LAYOUT_MAP[layout].exactImages);

	const { attributes, listeners, setNodeRef, transform, transition, isDragging }
		= useSortable({ id: item.id });

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			className={cn(
				"rounded-xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900",
				isDragging && "z-10 shadow-lg ring-2 ring-indigo-400/50",
				hiddenInLayout && "opacity-50",
			)}
		>
			<div className="flex gap-2">
				<button
					type="button"
					title={t("editor.dragToSort")}
					aria-label={t("editor.dragToSort")}
					className="flex cursor-grab touch-none items-center text-zinc-300 hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-600"
					{...attributes}
					{...listeners}
				>
					<GripIcon className="text-lg" />
				</button>

				<Thumb src={item.src} />

				<div className="min-w-0 flex-1 space-y-1.5">
					<div className="flex items-center gap-1.5">
						<TextInput
							value={item.caption}
							maxLength={LIMITS.captionMaxLength}
							aria-label={t("editor.captionLabel")}
							placeholder={t("editor.captionPlaceholder")}
							className="h-8 text-xs"
							onChange={event => setCaption(item.id, event.target.value)}
						/>
						<IconButton
							label={t("editor.shuffleOne")}
							className="size-8 shrink-0 text-sm"
							onClick={() => shuffleOne(item.id)}
						>
							<RefreshIcon />
						</IconButton>
						<IconButton
							label={t("editor.delete")}
							className="size-8 shrink-0 text-sm hover:text-red-500"
							disabled={countLocked || imageCount <= LIMITS.minImages}
							onClick={() => removeImage(item.id)}
						>
							<TrashIcon />
						</IconButton>
					</div>
					<UrlEditor item={item} />
				</div>
			</div>
			{hiddenInLayout && (
				<span className="mt-1.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:bg-zinc-800">
					{t("editor.notInLayout")}
				</span>
			)}
			<span className="sr-only">{t("editor.imageIndex", { n: index + 1 })}</span>
		</div>
	);
}

/* ---------------------------- 批量替换图片链接 ---------------------------- */

function ReplaceAllUrlsPanel({ onClose }: { onClose: () => void }) {
	const { t } = useTranslation();
	const replaceAllSrc = useEditorStore(state => state.replaceAllSrc);
	const [draft, setDraft] = useState("");
	const [error, setError] = useState("");

	const save = () => {
		if (!isValidImageUrl(draft)) {
			setError(t("editor.urlInvalid"));
			return;
		}
		replaceAllSrc(draft);
		onClose();
		toast(t("editor.replaceAllUrlsSaved"), "success");
	};

	return (
		<div className="space-y-1.5 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/40">
			<p className="text-[11px] text-zinc-500 dark:text-zinc-400">
				{t("editor.replaceAllUrlsDesc")}
			</p>
			<TextInput
				value={draft}
				invalid={Boolean(error)}
				autoFocus
				inputMode="url"
				placeholder="https://…"
				className="h-9 text-xs"
				onChange={event => setDraft(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						save();
					}
					if (event.key === "Escape") {
						onClose();
					}
				}}
			/>
			{error && <p className="text-[11px] text-red-500">{error}</p>}
			<div className="flex gap-1.5">
				<Button size="sm" variant="primary" onClick={save}>
					{t("common.confirm")}
				</Button>
				<Button size="sm" onClick={onClose}>
					{t("common.cancel")}
				</Button>
			</div>
		</div>
	);
}

/* ------------------------------ 数量控制 ------------------------------- */

function CountField() {
	const { t } = useTranslation();
	const count = useEditorStore(state => state.images.length);
	const setCount = useEditorStore(state => state.setCount);
	const addImage = useEditorStore(state => state.addImage);
	const [draft, setDraft] = useState(String(count));
	const [error, setError] = useState("");

	useEffect(() => {
		setDraft(String(count));
		setError("");
	}, [count]);

	const commit = (value: string) => {
		const n = Number(value);
		if (!/^\d+$/.test(value.trim()) || n < LIMITS.minImages || n > LIMITS.maxImages) {
			setError(t("editor.countInvalid", { min: LIMITS.minImages, max: LIMITS.maxImages }));
			return;
		}
		setError("");
		setCount(n);
	};

	return (
		<Field
			label={t("editor.imageCount")}
			error={error}
			hint={`${LIMITS.minImages}–${LIMITS.maxImages}`}
		>
			<div className="flex gap-2">
				<Button
					size="sm"
					className="h-9 w-9 px-0 text-base"
					disabled={count <= LIMITS.minImages}
					onClick={() => setCount(count - 1)}
					aria-label="−1"
				>
					−
				</Button>
				<TextInput
					type="number"
					inputMode="numeric"
					min={LIMITS.minImages}
					max={LIMITS.maxImages}
					value={draft}
					invalid={Boolean(error)}
					className="h-9 text-center"
					onChange={event => setDraft(event.target.value)}
					onBlur={event => commit(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							commit(draft);
						}
					}}
				/>
				<Button
					size="sm"
					className="h-9 w-9 px-0 text-base"
					disabled={count >= LIMITS.maxImages}
					onClick={() => {
						if (count >= LIMITS.maxImages) {
							toast(t("editor.maxImagesReached", { max: LIMITS.maxImages }), "error");
							return;
						}
						addImage();
					}}
					aria-label="+1"
				>
					+
				</Button>
			</div>
		</Field>
	);
}

/* -------------------------------- 主面板 -------------------------------- */

export function ImagePanel() {
	const { t } = useTranslation();
	const images = useEditorStore(state => state.images);
	const layout = useEditorStore(state => state.layout);
	const moveImage = useEditorStore(state => state.moveImage);
	const shuffleAll = useEditorStore(state => state.shuffleAll);
	const [replaceOpen, setReplaceOpen] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			moveImage(String(active.id), String(over.id));
		}
	};

	const layoutMeta = LAYOUT_MAP[layout];
	const maxVisible = layoutMeta.maxImages;
	const lockedCount = layoutMeta.exactImages;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-2">
				<h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
					{t("editor.sectionImages")}
				</h3>
				<div className="flex shrink-0 gap-1.5">
					<Button
						size="sm"
						aria-pressed={replaceOpen}
						onClick={() => setReplaceOpen(open => !open)}
					>
						<LinkIcon />
						{t("editor.replaceAllUrls")}
					</Button>
					<Button
						size="sm"
						variant="primary"
						onClick={() => {
							shuffleAll();
							toast(t("editor.shuffleAllDesc"), "success");
						}}
					>
						<ShuffleIcon />
						{t("editor.shuffleAll")}
					</Button>
				</div>
			</div>

			{replaceOpen && <ReplaceAllUrlsPanel onClose={() => setReplaceOpen(false)} />}

			{lockedCount
				? (
					<div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/40">
						<span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
							{t("editor.imageCount")}
						</span>
						<span className="text-[11px] text-zinc-400">
							{t("editor.fixedCount", { n: lockedCount })}
						</span>
					</div>
				)
				: (
					<CountField />
				)}

			<p className="flex items-center gap-1 text-[11px] text-zinc-400">
				<GripIcon />
				{t("editor.dragToSort")}
			</p>

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={images.map(i => i.id)} strategy={verticalListSortingStrategy}>
					<div className="space-y-2">
						{images.map((item, index) => (
							<SortableCard
								key={item.id}
								item={item}
								index={index}
								hiddenInLayout={Boolean(maxVisible && index >= maxVisible)}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{!lockedCount && (
				<Button
					className="w-full"
					disabled={images.length >= LIMITS.maxImages}
					onClick={() => {
						if (images.length >= LIMITS.maxImages) {
							toast(t("editor.maxImagesReached", { max: LIMITS.maxImages }), "error");
							return;
						}
						useEditorStore.getState().addImage();
					}}
				>
					<PlusIcon />
					{t("editor.addImage")}
				</Button>
			)}
		</div>
	);
}
