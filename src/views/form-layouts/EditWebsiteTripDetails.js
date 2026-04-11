import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false, loading: () => <p>Loading editor...</p> });

const EditWebsiteTripDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Get trip ID from URL
  const [formData, setFormData] = useState({ title: "", featuredImage: null });
  const [editorValue, setEditorValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInput = useRef(null);

  // Fetch existing trip data when component loads
  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/website-trips/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({ title: data.title, featuredImage: data.featuredImage });
          setEditorValue(data.content);
        })
        .catch(() => setErrorMessage("Error fetching trip details."));
    }
  }, [id]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024;
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Only JPG, PNG, and GIF files are allowed.");
        return;
      }
      if (file.size > maxSize) {
        setErrorMessage("File size should not exceed 5MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, featuredImage: file }));
      setErrorMessage("");
    }
  };

  const handleEditorChange = (value) => setEditorValue(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !editorValue.trim()) {
      setErrorMessage("Title and content are required.");
      return;
    }
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", editorValue);
    if (formData.featuredImage instanceof File) {
      data.append("featuredImage", formData.featuredImage);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-website-trip/${id}`, {
        method: "PUT",
        body: data,
        headers: { authorization: localStorage.getItem("access_token") },
      });

      if (!response.ok) throw new Error("Failed to update trip.");
      setSuccessMessage("Trip updated successfully!");
    } catch (error) {
      setErrorMessage("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "auto" }}>
      <label>Title</label>
      <input type="text" name="title" value={formData.title} onChange={handleInputChange} />

      <label>Featured Image</label>
      <input type="file" ref={fileInput} onChange={handleFileChange} />

      <label>Content</label>
      <ReactQuill value={editorValue} onChange={handleEditorChange} />

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <button type="submit">Update</button>
    </form>
  );
};

export default EditWebsiteTripDetails;
