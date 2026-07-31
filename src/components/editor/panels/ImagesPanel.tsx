/**
 * 图片面板 - 增删改、@dnd-kit 拖拽排序、图片说明
 */
import type { DragEndEvent } from "@dnd-kit/core";
import type { ImageItem } from "../../types";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

import { useTranslation } from "react-i18next";
import { useDocumentStore } from "../../stores/documentStore";
import { useToastStore } from "../../stores/toastStore";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/Field";

export function ImagesPanel() {
	const { t } = useTranslation();
	const images = useDocumentStore(state => state.images);
	const addImage = useDocumentStore(state => state.addImage);
	const removeImage = useDocumentStore(state => state.removeImage);
	const reorder = useDocumentStore(state => state.reorder);
	const updateImage = useDocumentStore(state => state.updateImage);
	const layout = useDocumentStore(state => state.layout());
	const pushToast = useToastStore(state => state.push);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id)
			return;
		const from = images.findIndex(item => item.id === active.id);
		const to = images.findIndex(item => item.id === over.id);
		if (from < 0 || to < 0)
			return;
		reorder(from, to);
	};

	const canAdd = images.length < layout.maxItems;
	const atMax = images.length >= layout.maxItems;

	return (
		<section className="flex flex-col gap-2">
			<header className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t("images.title")}</h2>
				<Button
					variant="primary"
					disabled={!canAdd}
					onClick={() => {
						if (!canAdd) {
							pushToast(t("images.maxReached", { count: layout.maxItems }), "info");
							return;
						}
						addImage();
					}}
				>
					{t("images.add")}
				</Button>
			</header>
			<p className="text-xs text-zinc-400 dark:text-zinc-500">{t("images.dragHint")}</p>
			{atMax && (
				<p className="text-xs text-amber-600 dark:text-amber-400">
					{t("images.maxReached", { count: layout.maxItems })}
				</p>
			)}
			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<SortableContext items={images.map(item => item.id)} strategy={verticalListSortingStrategy}>
					<ul className="flex flex-col gap-2">
						{images.map((image, index) => (
							<SortableImageRow
								key={image.id}
								image={image}
								index={index}
								canRemove={images.length > layout.minItems}
								onRemove={() => removeImage(image.id)}
								onUpdate={patch => updateImage(image.id, patch)}
							/>
						))}
					</ul>
				</SortableContext>
			</DndContext>
			{images.length < layout.minItems && (
				<p className="text-xs text-rose-600 dark:text-rose-400">
					{t("images.empty", { count: layout.minItems })}
				</p>
			)}
		</section>
	);
}

interface SortableImageRowProps {
	image: ImageItem
	index: number
	canRemove: boolean
	onRemove: () => void
	onUpdate: (patch: Partial<ImageItem>) => void
}

function SortableImageRow({ image, index, canRemove, onRemove, onUpdate }: SortableImageRowProps) {
	const { t } = useTranslation();
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	return (
		<li
			ref={setNodeRef}
			style={style}
			className={clsx(
				"rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900",
				isDragging && "ring-2 ring-indigo-400",
			)}
		>
			<div className="flex items-center gap-2">
				<button
					type="button"
					{...attributes}
					{...listeners}
					className="cursor-grab touch-none rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-500 active:cursor-grabbing dark:bg-zinc-800 dark:text-zinc-300"
					aria-label="drag"
				>
					≡
				</button>
				<span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
					#
					{index + 1}
				</span>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="danger" onClick={onRemove} disabled={!canRemove}>{t("images.remove")}</Button>
				</div>
			</div>
			<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
				<TextInput label={t("images.srcLabel")} value={image.src} onChange={src => onUpdate({ src })} />
				<TextInput
					label={t("images.captionLabel")}
					value={image.caption ?? ""}
					placeholder={t("images.captionPlaceholder")}
					onChange={caption => onUpdate({ caption })}
				/>
			</div>
		</li>
	);
}
