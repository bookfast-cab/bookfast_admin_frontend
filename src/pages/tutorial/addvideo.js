import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';

const AddVideo = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    thumbnail: null,
    old_thumbnail: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInput = useRef(null);

  // Get Video Detail if ID exists (Edit Mode)
  const getVideoData = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-tutorial-detail/${id}`,
        {
          method: "GET",
          headers: {
            authorization: localStorage.getItem("access_token"),
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setFormData({
          title: result.data.title,
          videoUrl: result.data.video_url,
          old_thumbnail: result.data.thumbnail,
          thumbnail: null
        });
        setImagePreview(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/tutorials/${result.data.thumbnail}`);
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
    }
  };

  useEffect(() => {
    if (id) getVideoData(id);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("video_url", formData.videoUrl);
    data.append("old_thumbnail", formData.old_thumbnail);
    if (formData.thumbnail) {
      data.append("thumbnail", formData.thumbnail);
    }

    try {
      const endpoint = id ? `${id}` : '';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/save-tutorial/${endpoint}`,
        {
          method: method,
          body: data,
          headers: {
            authorization: localStorage.getItem("access_token"),
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Tutorial saved successfully!");
        router.push('/tutorials');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h2>{id ? "Edit Tutorial Video" : "Add Tutorial Video"}</h2>
      
      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        
        {/* Title Field */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Video Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. How to book a cab"
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            required
          />
        </div>

        {/* Video URL Field */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>YouTube / Video URL</label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            placeholder="https://youtube.com/watch?v=..."
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            required
          />
        </div>

        {/* Thumbnail Upload */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Thumbnail Image</label>
          <input
            type="file"
            ref={fileInput}
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginBottom: "10px" }}
            required={!id} 
          />
          
          {imagePreview && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "12px", color: "#666" }}>Preview:</p>
              <img
                src={imagePreview}
                alt="Thumbnail Preview"
                style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          {isSubmitting ? "Saving..." : "Submit Tutorial"}
        </button>
      </form>
    </div>
  );
};

export default AddVideo;