import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import FontSize from 'tiptap-extension-font-size';

const PageForm = () => {
  const Router = useRouter();
  const { id } = Router.query;


  const [formData, setFormData] = useState({
    title: "",
    featuredImage: null,
    metaTitle: "",
    metaDescription: "",
  });

  let initialContent = `<p><strong>Chandigarh to Delhi Cab Service – Book a One-Way Taxi at Best Price</strong></p>

<p><strong>Book a One-Way Taxi from Chandigarh to Delhi</strong></p>

<p>
    Looking for a safe ride from <strong>Chandigarh to Delhi</strong>? Bookfast provides comfortable one-way taxi, 
    round trip, and outstation cab service from <strong>Chandigarh to Delhi</strong> with instant booking and 24*7 customer care. 
    Whether you're travelling for business meetings, vacation or medical issues, we provide a smooth journey with trained drivers and neat and clean cabs.
</p>

<p>
    We offer <strong>instant booking confirmation</strong> and <strong>24x7 availability</strong>, ensuring a seamless travel experience.
</p>

<p><strong>Why Choose One-Way Cab from Chandigarh to Delhi?</strong></p>

<p>
    <p>✅ <strong>No Return Fare:</strong> One way trip, pay for one way trip only.</p>
    <p>✅ <strong>Doorstep Pickup & Drop:</strong> Chandigarh to any location in Delhi.</p>
    <p>✅ <strong>Instant Confirmation:</strong> Book online from Website, via App, Call & WhatsApp.</p>
    <p>✅ <strong>24/7 Customer Support:</strong> Always here to assist you.</p>
    <p>✅ <strong>Save 40%:</strong> No return fare policy with wide range of vehicles.</p>
</p>

<p><strong>Popular Vehicle Options</strong></p>

<p>
    <p>🚗 <strong>Sedan (Dzire/Aura):</strong> Perfect for 3-4 passengers</p>
    <p>🚙 <strong>SUV (Ertiga/Innova Crysta):</strong> Perfect for family travelling</p>
    <p>🚌 <strong>Tempo Traveller:</strong> Perfect for group tours</p>
</p>

<p><strong>Route Information</strong></p>

<p>
    <strong>Distance:</strong> 250 km<br>
    <strong>Travel Time:</strong> 4.5 to 5.5 hours (depending on traffic condition)<br>
    <strong>Highway Route:</strong> NH 44 (via Ambala, Karnal, Panipat)
</p>

<p><strong>Round Trip Cabs from Chandigarh to Delhi</strong></p>

<p>
    Need to return on the same day or after some days? Chandigarh to Delhi round trip cab service is ideal for:
</p>

<ul>
    <li>Business meetings</li>
    <li>Family functions and events</li>
    <li>Hospital visits (AIIMS, Fortis, Medanta etc.)</li>
    <li>Airport transfers (IGI Airport)</li>
</ul>

<p>Get customized packages with driver charges included and flexible return dates.</p>

<p><strong>Popular Drop Destinations in Delhi</strong></p>

<p>We cover all popular locations in Delhi, including:</p>

<ul>
    <li>Delhi IGI Airport (T1-T2-T3)</li>
    <li>Delhi Connaught Place (CP)</li>
    <li>Delhi Karol Bagh</li>
    <li>South Delhi (Saket, Vasant Kunj)</li>
    <li>New Delhi Railway Station</li>
    <li>Noida, Gurgaon, Dwarka Extension</li>
</ul>

<p><em>No hidden charges and transparent billing with GST invoice.</em></p>

<p><strong>Why Choose Chandigarh to Delhi with Bookfast Cabs?</strong></p>

<p>
    <p>✅ <strong>5000+ Fleets:</strong> Variety of cars at reasonable costs</p>
    <p>✅ <strong>Trained Drivers:</strong> Courteous, well-trained drivers, police-verified</p>
    <p>✅ <strong>Real-time Tracking:</strong> Stay informed and safe with route tracking</p>
    <p>✅ <strong>Affordable Rates:</strong> Best price, no surge guaranteed</p>
    <p>✅ <strong>2,00,000+ Customers:</strong> Satisfied customers in 200+ Indian cities</p>
    <p>✅ <strong>Easy Booking:</strong> Via website, app, phone call, or WhatsApp</p>
</p>

<p><strong>Chandigarh to Delhi Cab Fare</strong></p>

<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
    <thead>
        <tr>
            <th style="padding: 10px; background-color: #f5f5f5; text-align: left;">Vehicle Type</th>
            <th style="padding: 10px; background-color: #f5f5f5; text-align: center;">One Way Fare</th>
            <th style="padding: 10px; background-color: #f5f5f5; text-align: center;">Round Trip Fare</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 10px;"><strong>Sedan (Dzire/Etios)</strong></td>
            <td style="padding: 10px; text-align: center;">₹3,299 - ₹3,499</td>
            <td style="padding: 10px; text-align: center;">₹6,000 - ₹6,500</td>
        </tr>
        <tr>
            <td style="padding: 10px;"><strong>SUV (Ertiga)</strong></td>
            <td style="padding: 10px; text-align: center;">₹4,299 - ₹4,499</td>
            <td style="padding: 10px; text-align: center;">₹8,000 - ₹8,500</td>
        </tr>
        <tr>
            <td style="padding: 10px;"><strong>Innova Crysta</strong></td>
            <td style="padding: 10px; text-align: center;">₹5,499 - ₹6,999</td>
            <td style="padding: 10px; text-align: center;">₹9,000 - ₹10,000</td>
        </tr>
        <tr>
            <td style="padding: 10px;"><strong>Tempo Traveller</strong></td>
            <td style="padding: 10px; text-align: center;">₹8,499 - ₹9,499</td>
            <td style="padding: 10px; text-align: center;">₹14,500 - ₹15,500</td>
        </tr>
    </tbody>
</table>

<p><em><strong>Note:</strong> Toll, parking, and state taxes are included.</em></p>

<p><strong>Route Highlights: Optional Stops</strong></p>

<p>During the ride you can request optional halts at:</p>

<ul>
    <li><strong>Ambala</strong> - Famous for its cloth market</li>
    <li><strong>Karnal</strong> - Known for Karna Lake</li>
    <li><strong>Panipat</strong> - Historic city for shopping & sightseeing</li>
    <li><strong>Murthal</strong> - Popular stop for dhaba food (Sukhdev Dhaba, Amrik Sukhdev)</li>
</ul>

<p>We also offer custom tour plans to include sightseeing on the way.</p>

<p><strong>Book Your Ride in Simple Steps</strong></p>

<ul>
    <li>Visit: www.bookfast.in</li>
    <li>Select Route: Chandigarh to Delhi</li>
    <li>Choose Car Type and Date</li>
    <li>Confirm Booking and Pay Securely</li>
</ul>

<p><strong>Frequently Asked Questions</strong></p>

<p>
    <strong>Q: What is the minimum cost for a one-way trip?</strong><br>
    A: The minimum cost is ₹2,799 for a Sedan, including toll tax, state tax, and parking charges.
</p>

<p>
    <strong>Q: Do I pay for both sides if I book one-way?</strong><br>
    A: No, you pay only for the one-side route. No return fare - save up to 40%.
</p>

<p>
    <strong>Q: Is night travel available?</strong><br>
    A: Absolutely. 24/7 service available with advance booking.
</p>

<p>
    <strong>Q: Can I customize stopovers?</strong><br>
    A: Yes, you can request stops for meals or breaks at Murthal, Karnal, or Panipat.
</p>

<p><strong>Our Special Services</strong></p>

<p>
    <p>✈️ <strong>Airport Pick and Drop:</strong> Guaranteed on-time arrival</p>
    <p>🏥 <strong>Medical Travel Assistance:</strong> Neat and clean cars with customer support</p>
    <p>🏨 <strong>Hotel & Travel Agent Tie-ups:</strong> B2B rates and commissions</p>
    <p>🎯 <strong>Customized Tour Packages:</strong> Add Agra, Mathura, Jaipur en route</p>
</p>

<p><strong>Why Wait? Book Your Chandigarh to Delhi Cab Now!</strong></p>

<p>
    Keep stress-free with BookFast's reliable, comfortable and affordable ride. Whether it's solo, family or business trips, 
    we ensure you're always on the safe side. <strong>Download the app and save ₹500 on your first ride!</strong>
</p>

<p><strong>🚖 Call Now:</strong> <a href="tel:+918817430000">+91 88174-30000</a> / <a href="tel:+918817030000">+91 88170-30000</a> | 
    <strong>Book Online:</strong> <a href="https://www.bookfast.in" target="_blank">www.bookfast.in</a></p>`;

  const [editorContent, setEditorContent] = useState(initialContent);


  const [isBrowser, setIsBrowser] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadedContent, setLoadedContent] = useState(null); // Track loaded content

  // File input reference
  const fileInput = useRef(null);
  const galleryFileInput = useRef(null);

  // AWS S3 Configuration (add these to your environment variables)
  const AWS_S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION;
  const AWS_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY;
  const AWS_SECRET_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_KEY;

  // Custom image upload function
  const uploadToS3 = async (file) => {
    try {
      // Step 1: Get pre-signed URL from your backend
      const presignRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/generate-presigned-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("access_token"),
          },
          body: JSON.stringify({
            filename: file.name,
          }),
        }
      );

      if (!presignRes.ok) {
        throw new Error("Failed to get presigned URL");
      }

      const { data } = await presignRes.json();
      const { presignedUrl, key } = data;

      // Step 2: Upload file to S3
      const s3UploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: file,
      });

      if (!s3UploadRes.ok) {
        throw new Error("Upload to S3 failed");
      }

      // Step 3: Construct public file URL
      const fileUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${key}`;

      return fileUrl;

    } catch (error) {
      console.error("S3 upload error:", error);
      throw error;
    }
  };

  // Custom image handler for Tiptap
  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        setIsUploading(true);
        try {
          const imageUrl = await uploadToS3(file);

          // Insert image into editor
          editor?.chain().focus().setImage({ src: imageUrl }).run();

          // Refresh gallery
          loadGalleryImages();
        } catch (error) {
          setErrorMessage("Failed to upload image: " + error.message);
        } finally {
          setIsUploading(false);
        }
      }
    };
  }, []);

  // Tiptap editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in table nodes so they don't conflict
        table: false,
      }),


      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlock,
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Underline,
      Superscript,
      Subscript,
      FontSize.configure({
        types: ['textStyle'],
      }),
    ],
    content: editorContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border border-gray-300 rounded-md',
      },
    },
    immediatelyRender: false,
  });

  // Ensuring the component is rendered only on the client side
  useEffect(() => {
    setIsBrowser(true);
    loadGalleryImages();
  }, []);

  useEffect(() => {
    if (id && editor) {
      getTripDetails(id);
    }
  }, [id, editor]); // Add editor as dependency

  // FIX 2: Set editor content when loaded content changes
  useEffect(() => {
    if (editor && loadedContent !== null) {
      editor.commands.setContent(loadedContent);
      setEditorContent(loadedContent);
    }
  }, [editor, loadedContent]);

  // FIX 3: Set initial content only for new forms (no id)
  useEffect(() => {
    if (editor && !id && !loadedContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, id, loadedContent, initialContent]);


  // Load gallery images from AWS S3
  const loadGalleryImages = async () => {
    setIsGalleryLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getWebGalleryRaw`,
        {
          method: "GET",
          headers: {
            authorization: localStorage.getItem("access_token"),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {

          const baseUrl = "https://bookfast-service.s3.ap-south-1.amazonaws.com/";

          const imageUrls = result.data
            .filter((item) => item !== "webImages/")
            .map((path) => ({
              url: baseUrl + path,
            }));
          setGalleryImages(imageUrls);
        }
      }
    } catch (error) {
      console.error("Error loading gallery images:", error);
    } finally {
      setIsGalleryLoading(false);
    }
  };

  // Insert image from gallery into editor
  const insertImageFromGallery = (imageUrl) => {
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  };

  // Handle gallery image upload
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => uploadToS3(file));
      await Promise.all(uploadPromises);

      await loadGalleryImages();
      setSuccessMessage("Images uploaded successfully!");
    } catch (error) {
      setErrorMessage("Failed to upload images: " + error.message);
    } finally {
      setIsUploading(false);
      if (galleryFileInput.current) {
        galleryFileInput.current.value = '';
      }
    }
  };

  const fetchImages = async (imageUrls) => {
    const images = await Promise.all(imageUrls.map(url =>
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/website_trips/${url}`).then(res => res.blob())
    ));

    return images;
  };

  const getTripDetails = async (tripId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/website-trip/${tripId}`,
        {
          method: "GET",
          headers: {
            authorization: localStorage.getItem("access_token"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch form data.");
      }

      const result = await response.json();
      if (result.success) {
        setFormData({
          title: result.data.title,
          featuredImage: result.data.featuredImage,
          metaTitle: result.data.metaTitle || "",
          metaDescription: result.data.metaDescription || "",
        });

        setLoadedContent(result.data.content);

      } else {
        setErrorMessage("Error fetching form data: " + result.message);
      }
    } catch (error) {
      console.error("Error details:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };



  // Handle input change for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

      setFormData((prevData) => ({
        ...prevData,
        featuredImage: file,
      }));

      setErrorMessage("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      setErrorMessage("Title is required.");
      setLoading(false);

      return;
    }

    const editorContent = editor?.getHTML() || '';
    if (!editorContent.trim() || editorContent === '<p></p>') {
      setErrorMessage("Content cannot be empty.");
      setLoading(false);

      return;
    }

    if (!formData.featuredImage && !id) {
      setErrorMessage("Please select an image.");
      setLoading(false);

      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", editorContent);
    data.append("featuredImage", formData.featuredImage);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);

    try {
      const endpoint = id ? `website-trip/${id}` : "save-website-form";
      const formmethod = id ? "PUT" : "POST";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${endpoint}`,
        {
          method: formmethod,
          body: data,
          headers: {
            authorization: localStorage.getItem("access_token"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit form.");
      }

      const result = await response.json();

      if (result.success) {
        if (id && !formData.featuredImage) {
          setSuccessMessage("Form submitted and file uploaded successfully.");
          setErrorMessage("");
          setFormData({
            title: "",
            metaTitle: "",
            metaDescription: "",
            featuredImage: null,
          });
          editor?.commands.setContent('');
          Router.push("/websiteForm/view");

          return;
        }
        const newFileName = result.data.featuredImage;

        const uploadData = new FormData();
        uploadData.append("file", formData.featuredImage);
        uploadData.append("newFileName", newFileName);

        const uploadResponse = await fetch("https://bookfast.in/upload.php", {
          method: "POST",
          body: uploadData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success && !id) {
          setSuccessMessage("Form submitted and file uploaded successfully.");
          setErrorMessage("");
          setFormData({
            title: "",
            featuredImage: null,
            metaTitle: "",
            metaDescription: "",
          });
          editor?.commands.setContent('');
          if (fileInput.current) fileInput.current.value = "";
        } else {
          setErrorMessage("File upload error: " + uploadResult.message);
        }
      } else {
        setErrorMessage("Error saving form data: " + result.message);
      }
    } catch (error) {
      console.error("Error details:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const insertTable = () => {
    if (!editor) {
      console.log('Editor not available');

      return;
    }

    try {
      const result = editor.chain().focus().insertTable({
        rows: 3,
        cols: 3,
        withHeaderRow: true
      }).run();

      console.log('Insert table result:', result);

      if (!result) {
        console.log('Failed to insert table - trying alternative method');

        // Alternative method - insert HTML directly

        const tableHTML = `
        <table class="editor-table">
          <thead>
            <tr>
              <th>Header 1</th>
              <th>Header 2</th>
              <th>Header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
              <td>Cell 3</td>
            </tr>
            <tr>
              <td>Cell 4</td>
              <td>Cell 5</td>
              <td>Cell 6</td>
            </tr>
          </tbody>
        </table>
      `;
        editor.chain().focus().insertContent(tableHTML).run();
      }
    } catch (error) {
      console.error('Error inserting table:', error);
    }
  };


  // Toolbar component
  const EditorToolbar = () => {
    if (!editor) return null;

    // Helper function to set text color
    const setTextColor = (color) => {
      editor.chain().focus().setColor(color).run();
    };

    // Helper function to set background color
    const setHighlight = (color) => {
      editor.chain().focus().setHighlight({ color }).run();
    };

    // Helper function to set font size
    const setFontSize = (size) => {
      editor.chain().focus().setFontSize(size).run();
    };

    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderBottom: 'none',
        borderRadius: '6px 6px 0 0',
      }}>
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('bold') ? '#007BFF' : '#fff',
            color: editor.isActive('bold') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          title="Bold"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('italic') ? '#007BFF' : '#fff',
            color: editor.isActive('italic') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            fontStyle: 'italic',
          }}
          title="Italic"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('underline') ? '#007BFF' : '#fff',
            color: editor.isActive('underline') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          title="Underline"
        >
          U
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('strike') ? '#007BFF' : '#fff',
            color: editor.isActive('strike') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'line-through',
          }}
          title="Strikethrough"
        >
          S
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('superscript') ? '#007BFF' : '#fff',
            color: editor.isActive('superscript') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Superscript"
        >
          X²
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('subscript') ? '#007BFF' : '#fff',
            color: editor.isActive('subscript') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          title="Subscript"
        >
          X₂
        </button>

        {/* Font Size Selector */}
        <select
          onChange={(e) => setFontSize(e.target.value)}
          style={{
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#fff',
          }}
          title="Font Size"
        >
          <option value="">Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
          <option value="36px">36px</option>
          <option value="48px">48px</option>
        </select>

        {/* Text Color Palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #ccc', borderRadius: '4px', padding: '2px' }}>
          <span style={{ fontSize: '12px', padding: '0 4px' }}>A</span>
          {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00', '#00ffff', '#ffa500', '#800080', '#ffc0cb'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setTextColor(color)}
              style={{
                width: '20px',
                height: '20px',
                border: '1px solid #ccc',
                backgroundColor: color,
                borderRadius: '2px',
                cursor: 'pointer',
                margin: '1px',
              }}
              title={`Text Color: ${color}`}
            />
          ))}
        </div>

        {/* Highlight Color Palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #ccc', borderRadius: '4px', padding: '2px' }}>
          <span style={{ fontSize: '12px', padding: '0 4px', backgroundColor: '#ffff00' }}>H</span>
          {['#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ffa500', '#ffc0cb', '#98fb98', '#87ceeb', '#dda0dd', '#f0e68c'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setHighlight(color)}
              style={{
                width: '20px',
                height: '20px',
                border: '1px solid #ccc',
                backgroundColor: color,
                borderRadius: '2px',
                cursor: 'pointer',
                margin: '1px',
              }}
              title={`Highlight Color: ${color}`}
            />
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            style={{
              width: '20px',
              height: '20px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              borderRadius: '2px',
              cursor: 'pointer',
              margin: '1px',
              fontSize: '10px',
            }}
            title="Remove Highlight"
          >
            ✕
          </button>
        </div>

        {/* Headings */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level) {
              editor.chain().focus().toggleHeading({ level }).run();
            } else {
              editor.chain().focus().setParagraph().run();
            }
          }}
          style={{
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#fff',
          }}
          title="Heading Level"
        >
          <option value="">Normal</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
        </select>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('bulletList') ? '#007BFF' : '#fff',
            color: editor.isActive('bulletList') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Bullet List"
        >
          •
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('orderedList') ? '#007BFF' : '#fff',
            color: editor.isActive('orderedList') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Numbered List"
        >
          1.
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('taskList') ? '#007BFF' : '#fff',
            color: editor.isActive('taskList') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Task List"
        >
          ☑
        </button>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive({ textAlign: 'left' }) ? '#007BFF' : '#fff',
            color: editor.isActive({ textAlign: 'left' }) ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Align Left"
        >
          ⬅
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive({ textAlign: 'center' }) ? '#007BFF' : '#fff',
            color: editor.isActive({ textAlign: 'center' }) ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Align Center"
        >
          ↔
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive({ textAlign: 'right' }) ? '#007BFF' : '#fff',
            color: editor.isActive({ textAlign: 'right' }) ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Align Right"
        >
          ➡
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive({ textAlign: 'justify' }) ? '#007BFF' : '#fff',
            color: editor.isActive({ textAlign: 'justify' }) ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Justify"
        >
          ≡
        </button>

        {/* Indentation */}
        <button
          type="button"
          onClick={() => editor.chain().focus().indent().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Increase Indent"
        >
          →|
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().outdent().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Decrease Indent"
        >
          |←
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter the URL:');
            if (url) {
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('link') ? '#007BFF' : '#fff',
            color: editor.isActive('link') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Insert Link"
        >
          🔗
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: editor.isActive('link') ? '#000' : '#999',
            borderRadius: '4px',
            cursor: editor.isActive('link') ? 'pointer' : 'not-allowed',
          }}
          title="Remove Link"
        >
          🔗✕
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={addImage}
          disabled={isUploading}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '4px',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.6 : 1,
          }}
          title="Insert Image"
        >
          {isUploading ? '⏳' : '🖼️'}
        </button>

        {/* Table Buttons */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '10px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
          <button
            type="button"
            onClick={insertTable}
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: '#000',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            title="Insert Table"
          >
            📋
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().addColumnBefore() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().addColumnBefore() ? 'pointer' : 'not-allowed',
              fontSize: '11px',
            }}
            title="Add Column Before"
          >
            ⬅️➕
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().addColumnAfter() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().addColumnAfter() ? 'pointer' : 'not-allowed',
              fontSize: '11px',
            }}
            title="Add Column After"
          >
            ➕➡️
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().deleteColumn() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().deleteColumn() ? 'pointer' : 'not-allowed',
              fontSize: '11px',
            }}
            title="Delete Column"
          >
            🗑️📋
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().addRowBefore() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().addRowBefore() ? 'pointer' : 'not-allowed',
              fontSize: '11px',
            }}
            title="Add Row Before"
          >
            ⬆️➕
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().addRowAfter() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().addRowAfter() ? 'pointer' : 'not-allowed',
              fontSize: '11px',
            }}
            title="Add Row After"
          >
            ➕⬇️
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().deleteRow() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().deleteRow() ? 'pointer' : 'not-allowed',
              fontSize: '11px',
            }}
            title="Delete Row"
          >
            🗑️📄
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            style={{
              padding: '6px 8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().deleteTable() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().deleteTable() ? 'pointer' : 'not-allowed',
              fontSize: '11px',
            }}
            title="Delete Table"
          >
            🗑️📋
          </button>
        </div>

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('codeBlock') ? '#007BFF' : '#fff',
            color: editor.isActive('codeBlock') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Code Block"
        >
          &lt;/&gt;
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('code') ? '#007BFF' : '#fff',
            color: editor.isActive('code') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Inline Code"
        >
          &lt;&gt;
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('blockquote') ? '#007BFF' : '#fff',
            color: editor.isActive('blockquote') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Blockquote"
        >
          "
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Horizontal Rule"
        >
          ―
        </button>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          title="Clear Formatting"
        >
          🧹
        </button>

        {/* Undo/Redo */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '10px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().undo() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().undo() ? 'pointer' : 'not-allowed',
            }}
            title="Undo"
          >
            ↶
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              color: editor.can().redo() ? '#000' : '#999',
              borderRadius: '4px',
              cursor: editor.can().redo() ? 'pointer' : 'not-allowed',
            }}
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Add table styles */}


      <div style={{ display: "flex", gap: "20px", maxWidth: "1200px", margin: "auto" }}>
        {/* Main Form */}
        <div style={{ flex: "2" }}>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Title Field */}
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

            {/* Meta Title Field */}
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
                placeholder="Enter meta title"
                style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              />
            </div>

            {/* Meta Description Field */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="metaDescription" style={{ display: "block", fontWeight: "bold" }}>
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="Enter meta description"
                rows={3}
                style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              />
            </div>

            {/* Featured Image Field */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="featuredImage" style={{ display: "block", fontWeight: "bold" }}>
                Featured Image
              </label>
              <input
                type="file"
                id="featuredImage"
                ref={fileInput}
                name="featuredImage"
                accept="image/*"
                onChange={handleFileChange}
                required={!id}
                style={{ marginTop: "5px" }}
              />
            </div>

            {/* Content Editor */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="content" style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>
                Content
              </label>
              {isUploading && (
                <div style={{
                  padding: "10px",
                  backgroundColor: "#f0f8ff",
                  border: "1px solid #007BFF",
                  borderRadius: "4px",
                  marginBottom: "10px"
                }}>
                  Uploading image...
                </div>
              )}
              {isBrowser && editor && (
                <div>
                  <EditorToolbar />
                  <EditorContent
                    editor={editor}
                    style={{
                      border: '1px solid #dee2e6',
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      minHeight: '300px',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Display error or success message */}
            {errorMessage && (
              <div style={{ color: "red", marginBottom: "20px" }}>{errorMessage}</div>
            )}
            {successMessage && (
              <div style={{ color: "green", marginBottom: "20px" }}>
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                margin: "50px 0",
                borderRadius: "5px",
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Image Gallery Sidebar */}
        <div style={{
          flex: "1",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          maxHeight: "80vh",
          overflowY: "auto"
        }}>
          <h3 style={{ marginTop: "0", marginBottom: "20px" }}>Image Gallery</h3>

          {/* Upload new images */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="file"
              ref={galleryFileInput}
              multiple
              accept="image/*"
              onChange={handleGalleryUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => galleryFileInput.current?.click()}
              disabled={isUploading}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isUploading ? "Uploading..." : "Upload Images"}
            </button>
          </div>

          {/* Gallery Images */}
          {isGalleryLoading ? (
            <div>Loading gallery...</div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: "10px"
            }}>
             {galleryImages.map((image, index) => {
  // Extract file name from AWS URL
 let fileName = image.url.split("/").pop();

  // Remove numbers from file name
    fileName = fileName.replace(/[0-9]/g, "");
 fileName = fileName.replace(/^trip-web-/, "");

  return (
    <div key={index} style={{ position: "relative" }}>
      <img
        src={image.url}
        alt={`Gallery ${index}`}
        style={{
          width: "100%",
          height: "80px",
          objectFit: "cover",
          borderRadius: "4px",
          cursor: "pointer",
          border: "2px solid transparent",
        }}
        onClick={() => insertImageFromGallery(image.url)}
        onMouseEnter={(e) => {
          e.target.style.border = "2px solid #007BFF";
        }}
        onMouseLeave={(e) => {
          e.target.style.border = "2px solid transparent";
        }}
      />
      {/* File name */}
      <div style={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
        padding: "2px 4px",
        fontSize: "10px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
      }}>
      
      </div>

      {/* Footer label */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "2px 4px",
        fontSize: "10px",
        borderBottomLeftRadius: "4px",
        borderBottomRightRadius: "4px",
      }}>
          {fileName}
      </div>
    </div>
  );
})}

            </div>
          )}

          {galleryImages.length === 0 && !isGalleryLoading && (
            <div style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
              No images in gallery
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PageForm;