import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Note } from "../app/api";

const schema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  content: z.string().min(10, "Содержание слишком короткое"),
  date: z.string().date(),
  tags: z.array(z.string()),
});

type NoteFormData = z.infer<typeof schema>;

interface NoteFormProps {
  initialData?: Partial<Note>;
  onSubmit: (data: NoteFormData) => void;
}

import React, { useState } from "react";

export default function NoteForm({ initialData, onSubmit }: NoteFormProps) {
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags ? initialData.tags.join(", ") : ""
  );
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<NoteFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || { title: "", content: "", date: new Date().toISOString().split("T")[0], tags: [] },
  });

  // Обновляем поле tags в react-hook-form при изменении input
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    const value = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
    setValue("tags", value);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <form className="note-form" onSubmit={handleSubmit(onSubmit)} style={{ minWidth: 340 }}>
        <input {...register("title")} placeholder="Заголовок" />
        {errors.title && <p style={{ color: '#d16b8a', margin: 0 }}>{errors.title.message}</p>}
        <textarea {...register("content")} placeholder="Содержание" rows={3} />
        {errors.content && <p style={{ color: '#d16b8a', margin: 0 }}>{errors.content.message}</p>}
        <input type="date" {...register("date")} />
        {errors.date && <p style={{ color: '#d16b8a', margin: 0 }}>{errors.date.message}</p>}
        <input
          placeholder="Теги (через запятую)"
          value={tagsInput}
          onChange={handleTagsChange}
        />
        {errors.tags && <p style={{ color: '#d16b8a', margin: 0 }}>{errors.tags.message as string}</p>}
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}