"use client";
import {useForm} from "react-hook-form";
import axios from "axios";
import {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";

import styles from "../ImageUploader.module.css";

export default function AddUpdateCarForm() {
  const [files, setFiles] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const {register, handleSubmit} = useForm();
  const [subCategories, setSubCategories] = useState([]);
  const [newSubCategory, setNewSubCategory] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [details, setDetails] = useState([]);
  const [stock, setStock] = useState(false);

  const handleAddSubCategory = () => {
    if (newSubCategory.trim() !== "") {
      setSubCategories([...subCategories, newSubCategory]);
      setNewSubCategory("");
      console.log(subCategories);
    }
  };
  const handleAddNewDetails = () => {
    if (newDetails.trim() !== "") {
      setDetails([...details, newDetails]);
      setNewDetails("");
      console.log(details);
    }
  };
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    // Guarda los archivos aceptados para previsualizarlos
    if (acceptedFiles?.length) {
      setFiles((previousFiles) => [
        ...previousFiles,
        ...acceptedFiles.map((file) => Object.assign(file, {preview: URL.createObjectURL(file)})),
      ]);
    }

    if (fileRejections?.length) {
      setRejectedFiles((previousFiles) => [...previousFiles, ...fileRejections]);
    }
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
  });

  const removeFile = (name) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const removeRejectedFile = (name) => {
    setRejectedFiles((rejected) => rejected.filter(({file}) => file.name !== name));
  };

  async function onSubmit(data) {
    try {
      const fd = new FormData();

      // Obligatorios
      fd.append("title", data.title);
      fd.append("price", String(parseFloat(data.price)));
      fd.append("category", data.category);
      fd.append("sub_category_main", data.sub_category_main);

      // 👇 OJO: cada array a su key correcta
      (details || []).forEach((v) => fd.append("details_items", String(v)));

      (subCategories || []).forEach((v) => fd.append("sub_category", String(v)));

      // Opcionales numéricos
      if (data.height) fd.append("height", String(parseFloat(data.height)));
      if (data.width) fd.append("width", String(parseFloat(data.width)));
      if (data.depth) fd.append("depth", String(parseFloat(data.depth)));

      // Boolean en texto ("true"/"false")
      const stockBool = !!data.stock; // checkbox, switch, etc.

      fd.append("stock", stockBool); // "true" o "false"
      // Archivos
      // main_image: un archivo
      if (files?.[0]) fd.append("main_image", files[0]);
      // images: varios con la misma key
      (files || []).forEach((f) => fd.append("images", f));

      const res = await axios.post(
        "https://mdpuf8ksxirarnlhtl6pxo2xylsjmtq8-barelectro-api.bargiuelectro.com/products/products/create_product",
        fd, // <- importante
      );

      console.log(res.data);
      alert("Producto creado con éxito");
    } catch (err) {
      console.error("Error al agregar producto:", err.response?.data || err);
    }
  }

  return (
    <form
      className="mx-auto grid grid-cols-3 gap-4 rounded-xl p-6 text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="col-span-3 mb-4 text-center text-2xl font-bold">Agregar producto</h2>

      <input className="border-1 px-2" placeholder="title" {...register("title")} />
      <input className="border-1 px-2" placeholder="category" {...register("category")} />
      <input className="border-1 px-2" placeholder="price (number)" {...register("price")} />
      <input className="border-1 px-2" type="file" {...register("main_image")} />
      <input className="border-1 px-2" placeholder="width (float)" {...register("width")} />
      <input
        className="border-1 px-2"
        placeholder="subcategory_main"
        {...register("sub_category_main")}
      />
      <input className="border-1 px-2" placeholder="height (float)" {...register("height")} />
      <input className="border-1 px-2" placeholder="depth (float)" {...register("depth")} />
      <div>
        <input
          name="sub_category"
          placeholder="Agregar subcategoría"
          value={newSubCategory}
          onChange={(e) => setNewSubCategory(e.target.value)}
        />
        <button type="button" onClick={handleAddSubCategory}>
          Añadir
        </button>
        <ul>
          {subCategories.map((subCategory) => (
            <li key={subCategory}>{subCategory}</li>
          ))}
        </ul>
      </div>
      <div>
        <input
          name="details_items"
          placeholder="Agregar detalles"
          value={newDetails}
          onChange={(e) => setNewDetails(e.target.value)}
        />
        <button type="button" onClick={handleAddNewDetails}>
          Añadir
        </button>
        <ul>
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2">
        <input
          placeholder="stock"
          type="checkbox"
          onChange={(e) => setStock(e.target.checked)}
          {...register("stock")}
        />
        <p>Stock</p>
      </div>
      {/* <ImagesUpload /> */}
      <div {...getRootProps({className: styles.dropzone})}>
        <input {...register("images")} {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta las imágenes aquí...</p>
        ) : (
          <p>Arrastra y suelta hasta 20 imágenes aquí, o haz clic para seleccionarlas</p>
        )}
      </div>
      {files && files.length > 0 && <button onClick={() => setFiles([])}>Limpiar</button>}
      {/* Previsualización de imágenes aceptadas */}
      {files && files.length > 0 && <h4 className={styles.previewTitle}>Imágenes aceptadas:</h4>}
      <ul className={styles.fileList}>
        {files.map((file) => (
          <li key={file.name} className={styles.fileItem}>
            <img
              alt={file.name}
              src={file.preview}
              onLoad={() => URL.revokeObjectURL(file.preview)}
            />
            <span>{file.name}</span>
            <button type="button" onClick={() => removeFile(file.name)}>
              &times;
            </button>
          </li>
        ))}
      </ul>

      {/* Lista de archivos rechazados */}
      {rejectedFiles.length > 0 && (
        <>
          <h4 className={styles.previewTitleError}>Archivos rechazados:</h4>
          <ul className={styles.fileList}>
            {rejectedFiles.map(({file, errors}) => (
              <li key={file.name} className={styles.fileItemError}>
                <span>{file.name}</span>
                <span className={styles.errorMessage}>
                  {errors.map((e) => e.message).join(", ")}
                </span>
                <button type="button" onClick={() => removeRejectedFile(file.name)}>
                  {/* &times; */}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="col-span-3 mt-6 text-center">
        <button
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          type="submit"
        >
          Agregar
        </button>
      </div>
    </form>
  );
}
