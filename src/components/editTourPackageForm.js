import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EditTourPackageForm = (params) => {
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    locationCovered: "",
    packageCost: "",
    metaTitle: "",
    metaDescription: "",
    featured_image: [],
    itinerary: [],
  });

  const [itineraryDay, setItineraryDay] = useState({
    title: "",
    tags: "",
    benefits: "",
    description: "",
  });

  const [editorValue, setEditorValue] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const fileInput = useRef(null);
  
  useEffect(() => {

    setIsBrowser(true);
  }, []);


  const fetchImages=async (imageUrls)=> {
    const images = await Promise.all(imageUrls.map(url =>
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/tour_packages/${url}`).then(res => res.blob())
    ));
    
    return images;
  }
  

  const getTourPackage = async (id) => {
    if(!id) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-tour-package/${params.id}`,
        {
          method: "GET",
          headers: {
            authorization: localStorage.getItem("access_token"),
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      
     // console.log("Backend Response:", result);
  
      if (result.success) {
      //  console.log('Fetched package result:', result);

        let images=await fetchImages(JSON.parse(result.data.featured_image));
        setFormData({
          title: result.data.title,
          metaTitle: result.data.metaTitle,
          metaDescription: result.data.metaDescription,
          duration: result.data.duration,
          locationCovered: result.data.location_covered,
          packageCost: result.data.package_cost,
          featured_image: [...images],
          itinerary: [...JSON.parse(result.itineraries[0].itinerary_details)],
        });
        setEditorValue(result.data.location_covered);
        let previewImages = JSON.parse(result.data.featured_image);
        previewImages=previewImages.map((image) => {
          return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/tour_packages/${image}`;
        });

        setImagePreviews([...previewImages]);
        
      }
    } catch (error) {
      alert("Error fetching package details : " + error.message);   
    }
  };
  useEffect(() => {
    getTourPackage(params.id);
   
  }, [params.id]);

  const handleInputChange = (e) => {
    
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (event) => {
    
    const files = Array.from(event.target.files);
    setFormData({ ...formData, featured_image: files });
    
    const previewImages = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewImages);
  };
  
  const handleEditorChange = (value) => {
    setEditorValue(value);
  };
  
  const handleItineraryChange = (e) => {
    
    const { name, value } = e.target;
    setItineraryDay({
      ...itineraryDay,
      [name]: value,
    });
  };
  
  const addItineraryDay = () => {
    setFormData({
      ...formData,
      itinerary: [...formData.itinerary, { ...itineraryDay }],
    });
    setItineraryDay({ title: "", tags: "", benefits: "", description: "" });
  };

  const removeItineraryDay = (index) => {
    
    const updatedItinerary = formData.itinerary.filter((_, i) => i !== index);
    setFormData({ ...formData, itinerary: updatedItinerary });
  };

  //edit itenanry day
  const [editingIndex, setEditingIndex] = useState(null);
 
  const editItineraryDay = (index) => {
    const selectedDay = formData.itinerary[index];

    if (!selectedDay) {
        console.error("Selected day is undefined or null");
        
        return;
    }

    setItineraryDay({
      title: selectedDay.title || "",  // Ensure title is not undefined
      tags: Array.isArray(selectedDay.tags) 
            ? selectedDay.tags.join(", ") 
            : (typeof selectedDay.tags === "string" ? selectedDay.tags : ""), // Handle both array and string cases
      benefits: selectedDay.benefits || "",
      description: selectedDay.description || "",
    });

    setEditingIndex(index); // Set index for updating
};

    
  const saveItineraryDay = () => {
    if (editingIndex !== null) {
      // Update existing itinerary entry
      const updatedItinerary = [...formData.itinerary];
      updatedItinerary[editingIndex] = { 
        ...itineraryDay, 
        tags: itineraryDay.tags.split(", ")  // Ensure tags are stored as an array
      };
  
      setFormData({ ...formData, itinerary: updatedItinerary });
      setEditingIndex(null); // Reset after updating
    } else {
      // Add new day to itinerary
      setFormData({ 
        ...formData, 
        itinerary: [...formData.itinerary, { 
          ...itineraryDay, 
          tags: itineraryDay.tags.split(", ") 
        }] 
      });
    }
  
    // Clear form after saving
    setItineraryDay({ title: "", tags: "", benefits: "", description: "" });
  };
  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the form
    if (!formData.title || !formData.duration || !formData.packageCost) {      
      alert("Please fill all required fields.");      
      
      return;
    }
  
    const data = new FormData();
    data.append("title", formData.title);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
    data.append("duration", formData.duration);
    data.append("package_cost", formData.packageCost);
    data.append("location_covered", editorValue);
    data.append("itinerary", JSON.stringify(formData.itinerary));
  
    const files = formData.featured_image;

    if (files.length === 0) {
      alert("Please select at least one image.");
      
      return;
    }
  
    //append files
    for (let i = 0; i < files.length; i++) {
      data.append("featured_image[]", files[i]);
    }
  
    try {
      const endpoint = params.id === undefined  ? ''  : `${params.id}`;
      const fetchmethod = params.id === undefined  ? 'POST'  : `PUT`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/save-tour-package/${endpoint}`,
        {
          method: fetchmethod,
          body: data,
          headers: {
            authorization: localStorage.getItem("access_token"),
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (result.success) {
        const savedFilenames = result.data.featured_image;
        let uploadData = new FormData();
        
        if (savedFilenames) {

        for (let i = 0; i < files.length; i++) {
          uploadData.append("file[]", files[i]);
        }

            uploadData.append('featured_image', savedFilenames);
            uploadData.append('file', files);

        } else {
          console.error("savedFilenames is not an array:", savedFilenames);
        }

        try {
          const uploadResponse = await fetch('https://bookfast.in/uploadTour.php',
            {
              method: 'POST',
              body: uploadData,
            });

            // Check response
            if (uploadResponse.ok) {
              resetForm();
              window.location.href = `${window.location.origin}/tourPackages/view/`;
          } else {
              console.error('Upload failed');
          }
        } catch (error) {
          console.error('Error uploading files:', error);
        }
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert("Error during submission: " + error.message);
      }
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      duration: "",
      metaTitle: "",
      metaDescription: "",
      locationCovered: "",
      packageCost: "",
      featured_image: [],
      itinerary: [],
    });
    setImagePreviews([]);
    setEditorValue("");
    setItineraryDay({ title: "", tags: "", benefits: "", description: "" });
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: "600px", margin: "auto" }}
      encType="multipart/form-data"
    >
    <div style={{ marginBottom: "20px" }}>
        <label htmlFor="title" style={{ display: "block", fontWeight: "bold" }}>
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter the title"
          required
          style={{ width: "100%", padding: "10px", marginTop: "5px" }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="metaTitle" style={{ display: "block", fontWeight: "bold" }}>
          Meta Title
        </label>
        <input
          type="text"
          id="metaTitle"
          name="metaTitle"
          value={formData.metaTitle}
          onChange={handleInputChange}
          placeholder="Enter the meta title"
          style={{ width: "100%", padding: "10px", marginTop: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="metaDescription" style={{ display: "block", fontWeight: "bold" }}>
          Meta Description
        </label>
        <textarea
          id="metaDescription"
          name="metaDescription"
          value={formData.metaDescription}
          onChange={handleInputChange}
          placeholder="Enter the meta description"
          rows={4}
          style={{ width: "100%", padding: "10px", marginTop: "5px", resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="duration" style={{ display: "block", fontWeight: "bold" }}>
          Duration
        </label>
        <input
          type="text"
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
          placeholder="Enter the duration (e.g., 3D/2N)"
          required
          style={{ width: "100%", padding: "10px", marginTop: "5px" }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="packageCost" style={{ display: "block", fontWeight: "bold" }}>
          Package Cost
        </label>
        <input
          type="text"
          id="packageCost"
          name="packageCost"
          value={formData.packageCost}
          onChange={handleInputChange}
          placeholder="Enter the package cost"
          required
          style={{ width: "100%", padding: "10px", marginTop: "5px" }}
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="featured_image" style={{ display: "block", fontWeight: "bold" }}>
          Featured Images
        </label>
        <input
  type="file"
  id="featured_image"
  ref={fileInput}
  name="featured_image[]"
  accept="image/*"
  onChange={handleFileChange}
  multiple
  required={ params.id === undefined ? true : false }
/>
</div>

      <div style={{ marginBottom: "20px" }}>
        {imagePreviews.length > 0 && (
          <div>
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`preview-${index}`}
                style={{ width: "100px", margin: "5px" }}
              />
            ))}
          </div>
        )}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="content" style={{ display: "block", fontWeight: "bold" }}>
          Location covered
        </label>
        {isBrowser && (
          <ReactQuill
            value={editorValue}
            onChange={handleEditorChange}
            modules={{
              toolbar: [
                [{ header: "1" }, { header: "2" }, { font: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["bold", "italic", "underline"],
                ["link", "image", "blockquote", "code-block"],
                ["clean"],
                ["table"],
              ],
            }}
          />
        )}
      </div>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Add Itinerary</h2>
<div style={{ maxWidth: "600px", margin: "auto", padding: "15px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
  <div style={{ marginBottom: "20px" }}>
    <label htmlFor="dayTitle" style={{ display: "block", fontWeight: "bold" }}>Day Title:</label>
    <input
      type="text"
      id="dayTitle"
      name="title"
      value={itineraryDay.title}
      onChange={handleItineraryChange}
      style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
    />
  </div>
  <div style={{ marginBottom: "20px" }}>
    <label htmlFor="tags" style={{ display: "block", fontWeight: "bold" }}>Tags (comma-separated):</label>
    <input
      type="text"
      id="tags"
      name="tags"
      value={itineraryDay.tags}
      onChange={handleItineraryChange}
      style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
    />
  </div>
  <div style={{ marginBottom: "20px" }}>
    <label htmlFor="benefits" style={{ display: "block", fontWeight: "bold" }}>Benefits (comma-separated):</label>
    <input
      type="text"
      id="benefits"
      name="benefits"
      value={itineraryDay.benefits}
      onChange={handleItineraryChange}
      style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
    />
  </div>
  <div style={{ marginBottom: "20px" }}>
    <label htmlFor="description" style={{ display: "block", fontWeight: "bold" }}>Description:</label>
    <textarea
      id="description"
      name="description"
      value={itineraryDay.description}
      onChange={handleItineraryChange}
      style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", height: "100px" }}
    ></textarea>
  </div>
  {/* <button
    type="button"
    onClick={addItineraryDay}
    style={{ display: "block", width: "100%", padding: "10px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
  >
    Add Day
  </button> */}
  <button type="button" onClick={saveItineraryDay}>
  {editingIndex !== null ? "Update" : "Add"}
</button>


</div>
      <h3>Current Itinerary:</h3>
      <ul>
        {formData.itinerary.map((day, index) => (
          <li key={index}>
            <strong>Day {index + 1}:</strong> {day.title} <br />
            <em>Tags:</em> {day.tags} <br />
            <em>Benefits:</em> {day.benefits} <br />
            <em>Description:</em> {day.description} <br />
            <button
              type="button"
              onClick={() => removeItineraryDay(index)}
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Remove Day
            </button>  &nbsp;
            <button
              type="button"
              onClick={() => editItineraryDay(index)}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
      <button
        type="submit"
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          margin: "50px",
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default EditTourPackageForm;