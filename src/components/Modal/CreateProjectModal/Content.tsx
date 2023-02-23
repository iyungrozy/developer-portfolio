/* eslint-disable @typescript-eslint/no-floating-promises */
import Carousel from "@components/Carousel";
import type { LoadedImg } from "@components/FileUploader";
import FileUploader from "@components/FileUploader";
import {
  ArrowPathRoundedSquareIcon,
  ArrowUpTrayIcon,
  CodeBracketIcon,
  LinkIcon,
  ViewColumnsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { api } from "@utils/api";
import { uploader } from "@utils/uploader";
import Image from "next/image";
import type { FormEvent, ChangeEvent } from "react";
import { useCallback, useState } from "react";
import type {
  CategoriesGetAll,
  CreateProjectInput,
  ProjectType,
  TagsGetAll,
} from "src/types/infer";
import Select from "./Select";
export interface SelectOption {
  id: string;
  name: string;
}
type WhichSelect = "tags" | "categs";
export interface CreateProjectProps {
  categories: {
    data?: CategoriesGetAll;
    isFetching: boolean;
  };
  tags: { data?: TagsGetAll; isFetching: boolean };
}
interface Props extends CreateProjectProps {
  close: () => void;
  edit?: ProjectType;
}

const Content: React.FC<Props> = ({ categories, tags, edit, close }) => {
  const utils = api.useContext();
  const onSuccess = useCallback(() => {
    utils.project.invalidate();
    utils.category.getAll.invalidate();
    utils.tags.getAll.invalidate();
  }, [utils]);
  const add = api.project.create.useMutation({ onSuccess });
  const update = api.project.update.useMutation({ onSuccess });
  const gallery = api.images.getAll.useQuery(undefined, { enabled: false });

  const [showGallery, setShowGallery] = useState<string | boolean>(false);
  const [oldImage, setOldImage] = useState<string | null>(edit?.image || null);
  const [images, setImages] = useState<LoadedImg[]>([]);
  const [selectedCategs, setCategs] = useState<SelectOption[]>(
    edit?.categories || []
  );
  const [selectedTags, setTags] = useState<SelectOption[]>(edit?.tags || []);
  const [form, setForm] = useState<
    Pick<CreateProjectInput, "title" | "demo_link" | "source_link">
  >({
    title: edit?.title || "",
    demo_link: (edit?.demo_link as string) || undefined,
    source_link: (edit?.source_link as string) || undefined,
  });

  const handleForm = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const handleShowGallery = (val: string | boolean) => {
    if (val) gallery?.refetch();
    setShowGallery(val);
  };

  const removeSelected = useCallback((id: string, type: WhichSelect) => {
    if (type === "tags") setTags((prev) => prev.filter((p) => p.id !== id));
    else if (type === "categs")
      setCategs((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const onSelect = useCallback((option: SelectOption, type: WhichSelect) => {
    if (!option.id || !option.name) return;
    if (type === "tags") setTags((prev) => [option, ...prev]);
    else if (type === "categs") setCategs((prev) => [option, ...prev]);
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let image: string | undefined = oldImage || undefined;
    if (images.length && typeof images[0]?.size === "number") {
      const imgRes = await uploader(images);
      image = imgRes.data?.files[0];
    }

    const obj: CreateProjectInput = {
      ...form,
      image,
      categoryIds: selectedCategs.map(({ id }) => id),
      tagIds: selectedTags.map(({ id }) => id),
    };
    console.log(obj);
    try {
      if (edit?.id) await update.mutateAsync({ ...obj, id: edit.id });
      else await add.mutateAsync(obj);
      close();
    } catch (error) {}
  };

  return (
    <div>
      <h3 className="mb-6 text-lg font-medium">
        {edit?.id ? "Update" : "Create"} project
      </h3>
      <div className="flex items-stretch gap-4">
        {images.length || oldImage ? (
          <div className="relative isolate flex aspect-video w-full items-end justify-end p-3">
            <Image
              fill
              src={oldImage || images[0]?.preview || ""}
              alt=""
              className="bb -z-[1] rounded-lg object-cover"
              onLoad={() => {
                !oldImage && URL.revokeObjectURL(images[0]?.preview || "");
              }}
            />
          </div>
        ) : showGallery ? (
          <div className="relative w-full overflow-hidden rounded-lg">
            {gallery?.isRefetching ? (
              <div className="flex h-36 w-full items-center justify-center rounded-lg p-5 sm:h-48">
                <span className="c-secondary text-center">Fetching...</span>
              </div>
            ) : (
              gallery.data && (
                <Carousel className="h-36 gap-4 sm:h-48">
                  <>
                    {gallery.data.map((img) => (
                      <button
                        onDoubleClick={() => setOldImage(img)}
                        key={img}
                        className="embla__slide bb relative flex-[85%] flex-shrink-0 rounded-lg"
                      >
                        <Image
                          src={img}
                          fill
                          className="rounded-[inherit] object-cover"
                          alt=""
                          sizes="400px"
                        />
                      </button>
                    ))}
                  </>
                </Carousel>
              )
            )}
          </div>
        ) : (
          <FileUploader
            images={images}
            setImages={setImages}
            className="bb c-secondary flex w-full flex-col items-center justify-between rounded-lg py-6 px-4"
          >
            <ArrowUpTrayIcon className="w-7" strokeWidth={1} />
            <span className="mt-3 text-sm">Drag & Drop or Click</span>
          </FileUploader>
        )}
        <div className="flex w-[42px] flex-shrink-0 flex-col justify-end gap-4">
          {edit?.image && !oldImage && !images.length && !showGallery && (
            <button
              onClick={() => {
                setOldImage(edit.image);
              }}
              className="flex h-[42px] w-[42px] items-center justify-center bg-orange-500/10 text-orange-500 dark:bg-orange-500/20"
            >
              <ArrowPathRoundedSquareIcon className="w-5" />
            </button>
          )}
          {images.length || oldImage || showGallery ? (
            <button
              onClick={() => {
                setOldImage(null);
                setShowGallery(false);
                setImages([]);
              }}
              className="flex h-[42px] w-[42px] items-center justify-center bg-red-500/10 text-red-500 dark:bg-red-500/20"
            >
              <XMarkIcon className="w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleShowGallery(true)}
              className="flex h-[42px] w-[42px] items-center justify-center bg-blue-500/10 text-blue-500 dark:bg-blue-500/20"
            >
              <ViewColumnsIcon className="w-5" />
            </button>
          )}
        </div>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
        <input
          placeholder="Project title"
          type="text"
          className="bb rounded-md"
          name="title"
          value={form.title}
          onChange={handleForm}
        />
        <div className="flex gap-4">
          <input
            placeholder="Project demo link"
            type="text"
            className="bb w-full rounded-md"
            name="demo_link"
            value={form.demo_link || ""}
            onChange={handleForm}
          />
          <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center">
            <LinkIcon className="h-5 w-5 flex-shrink-0" />
          </div>
        </div>
        <div className="flex gap-4">
          <input
            placeholder="Project source code (optional)"
            type="text"
            className="bb w-full rounded-md"
            name="source_link"
            value={form.source_link || ""}
            onChange={handleForm}
          />
          <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center">
            <CodeBracketIcon className="h-5 w-5 flex-shrink-0" />
          </div>
        </div>
        <Select
          title="Categories"
          data={categories.data}
          selected={selectedCategs}
          remove={(id) => removeSelected(id, "categs")}
          onSelect={(values) => onSelect(values, "categs")}
        />
        <Select
          title="Tags"
          data={tags.data}
          selected={selectedTags}
          remove={(id) => removeSelected(id, "tags")}
          onSelect={(values) => onSelect(values, "tags")}
        />

        <div className="flex justify-end gap-4 pt-6">
          <button
            disabled={add.isLoading || update.isLoading}
            className="btn px-4"
            type="button"
            onClick={close}
          >
            Cancel
          </button>
          <button
            disabled={add.isLoading || update.isLoading}
            className="btn btn-darker w-40 px-4"
            type="submit"
          >
            {edit?.id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Content;
