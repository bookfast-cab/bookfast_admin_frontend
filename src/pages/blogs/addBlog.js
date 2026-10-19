import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useRouter } from 'next/router';
import axios from 'axios';
import getFingerprint from 'src/utils/Fingerprint';




const AddBlog = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    title: "",
    metaTitle: "",
    metaDescription: "",
    featured_image: [],
    old_files:[]
  });

  const [editorValue, setEditorValue] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loadedContent, setLoadedContent] = useState(null);
  
  const fileInput = useRef(null);
  const galleryFileInput = useRef(null);

  // Custom image upload function to S3
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

  // TipTap editor configuration
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
    content: "",
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border border-gray-300 rounded-md',
      },
    },
    immediatelyRender: false,
  });

  // Custom image handler for TipTap (compressed to WebP via backend)
  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds 5MB limit. Please select an image under 5MB.`);

          return;
        }
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append('images', file);

          const device_id = await getFingerprint();

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/upload-blog-image`,
            formData,
            {
              headers: {
                authorization: localStorage.getItem("access_token"),
                'x-device-id': device_id,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const result = response.data;
          if (result.success && result.data && result.data[0]) {
            const uploaded = result.data[0];
            editor?.chain().focus().setImage({ src: uploaded.url }).run();
            setUploadedImages((prev) => [
              {
                url: uploaded.url,
                name: uploaded.originalName || file.name,
                format: uploaded.format || "webp",
                size: uploaded.size,
              },
              ...prev,
            ]);
          }
        } catch (error) {
          alert("Failed to upload image: " + (error.response?.data?.message || error.message));
        } finally {
          setIsUploading(false);
        }
      }
    };
  }, [editor]);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Insert image into editor
  const insertImageFromGallery = (imageUrl) => {
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  };

  // Handle image upload with WebP compression
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`File size exceeds 5MB limit (${oversizedFiles.map((f) => f.name).join(", ")}). Please select images under 5MB.`);
      if (galleryFileInput.current) {
        galleryFileInput.current.value = "";
      }

      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const device_id = await getFingerprint();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/upload-blog-image`,
        formData,
        {
          headers: {
            authorization: localStorage.getItem("access_token"),
            'x-device-id': device_id,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;
      if (result.success && result.data) {
        const newItems = result.data.map((item) => ({
          url: item.url,
          name: item.originalName || "Uploaded Image",
          format: item.format || "webp",
          size: item.size,
        }));
        setUploadedImages((prev) => [...newItems, ...prev]);
        alert("Image uploaded successfully!");
      }
    } catch (error) {
      alert("Failed to upload images: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
      if (galleryFileInput.current) {
        galleryFileInput.current.value = "";
      }
    }
  };

  // Set editor content when loaded content changes
  useEffect(() => {
    if (editor && loadedContent !== null) {
      editor.commands.setContent(loadedContent);
      setEditorValue(loadedContent);
    }
  }, [editor, loadedContent]);

  const fetchImages = async (imageUrls) => {
    const images = await Promise.all(imageUrls.map(url =>
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/blogs/${url}`).then(res => res.blob())
    ));
    
    return images;
  }

  const getBlogData = async (id) => {
    if(!id) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-blog-detail/${id}`,
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
  
      if (result.success) {
        setFormData({
          title: result.data.title,
          metaTitle: result.data.metaTitle || "",
          metaDescription: result.data.metaDescription || "",
          old_files: result.data.featured_image,
          featured_image:[JSON.parse(result.data.featured_image)],
        });
        
        setLoadedContent(result.data.content);
        
        let previewImages = JSON.parse(result.data.featured_image);
        previewImages = previewImages.map((image) => {
          return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/blogs/${image}`;
        });

        setImagePreviews([...previewImages]);
      }
    } catch (error) {
      alert("Error fetching package details : " + error.message);   
    }
  };

  useEffect(() => {
    console.log(id);
    if (id) {
      getBlogData(id);
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const MAX_SIZE = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`File size exceeds 5MB limit (${oversizedFiles.map((f) => f.name).join(", ")}). Please select images under 5MB.`);
      if (fileInput.current) {
        fileInput.current.value = "";
      }

      return;
    }
    setFormData({ ...formData, featured_image: files });
    
    const previewImages = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewImages);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the form
    if (!formData.title ) {      
      alert("Please fill all required fields.");  

      return;
    }

    const editorContent = editor?.getHTML() || '';
    
    const data = new FormData();
    data.append("title", formData.title);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
    data.append("content", editorContent);
    data.append("old_files", formData.old_files);
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
      const endpoint = id === undefined  ? ''  : `${id}`;
      const fetchmethod = id === undefined  ? 'post'  : `put`;

      const device_id = await getFingerprint()
    
      let axiosparams = {
        method: fetchmethod,
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/save-blog/${endpoint}`,
        data: data,
        headers: {
            authorization: localStorage.getItem("access_token"),
            'x-device-id': device_id,
        },
      }

      const response = await axios(axiosparams);

      if (response?.data?.success) {
        console.log('Upload successful');
        resetForm();
        router.push('/blogs');

      //   const savedFilenames = result.data.featured_image;
      //   let uploadData = new FormData();
        
      //   if (savedFilenames) {
      //     for (let i = 0; i < files.length; i++) {
      //       uploadData.append("file[]", files[i]);
      //     }

      //     uploadData.append('featured_image', savedFilenames);
      //     uploadData.append('file', files);
      //   } else {
      //     console.error("savedFilenames is not an array:", savedFilenames);
      //   }

      //   try {
      //     const uploadResponse = await fetch('https://bookfast.in/uploadTour.php', {
      //       method: 'POST',
      //       body: uploadData,
      //     });

      //     // Check response
      //     if (uploadResponse.ok) {
      //       console.log('Upload successful');
      //       resetForm();
      //     } else {
      //       console.error('Upload failed');
      //     }
      //   } catch (error) {
      //     console.error('Error uploading files:', error);
      //   }
      } else {
        alert(response?.data?.message);
      }
    } catch (error) {
      alert("Error during submission: " + error.message);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      metaTitle: "",
      metaDescription: "",
      featured_image: [],
    });

    setImagePreviews([]);
    setEditorValue("");
    if (editor) {
      editor.commands.setContent('');
    }
  };

  // Insert table function
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
      
      if (!result) {
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
     
      <h2>Add Blog</h2>
      <div style={{ display: "flex", gap: "20px", maxWidth: "1400px", margin: "auto" }}>
        {/* Main Form */}
        <div style={{ flex: "2" }}>
          <form
            onSubmit={handleSubmit}
            style={{ maxWidth: "100%" }}
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
                required={ id === undefined ? true : false }
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

            {/* TipTap Editor for Location Covered */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="content" style={{ display: "block", fontWeight: "bold", marginBottom: "10px" }}>
                Blog Content
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
            >
              Submit
            </button>
          </form>
        </div>

        {/* Upload Image Section */}
        <div style={{ 
          width: "360px",
          flexShrink: 0,
          backgroundColor: "#ffffff", 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                Upload Images
              </h3>
            </div>
          </div>

          {/* Upload Button */}
          <div>
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
                padding: "12px",
                backgroundColor: isUploading ? "#94a3b8" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isUploading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.2s"
              }}
            >
              {isUploading ? "Uploading & Compressing..." : "📤 Upload Images"}
            </button>
          </div>

          {/* Uploaded Images List - immediately displayed */}
          <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                Uploaded Images ({uploadedImages.length})
              </span>
              {uploadedImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUploadedImages([])}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "11px",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  Clear list
                </button>
              )}
            </div>

            {uploadedImages.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "24px 12px",
                backgroundColor: "#f8fafc",
                borderRadius: "6px",
                border: "1px dashed #cbd5e1",
                color: "#64748b",
                fontSize: "12px"
              }}>
                No images uploaded yet.<br/>
                Upload an image to preview and insert it here.
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "55vh",
                overflowY: "auto",
                paddingRight: "2px"
              }}>
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "8px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      alignItems: "center"
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`Uploaded ${index}`}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: "1", minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#1e293b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }} title={image.name}>
                        {image.name || `Image ${index + 1}`}
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{
                          fontSize: "10px",
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          fontWeight: "600"
                        }}>
                          WEBP
                        </span>
                        {image.size && (
                          <span style={{ fontSize: "10px", color: "#64748b" }}>
                            {(image.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                        <button
                          type="button"
                          onClick={() => insertImageFromGallery(image.url)}
                          style={{
                            padding: "3px 8px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          + Insert
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(image.url);
                            setCopiedIndex(index);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          style={{
                            padding: "3px 8px",
                            backgroundColor: copiedIndex === index ? "#28a745" : "#e2e8f0",
                            color: copiedIndex === index ? "white" : "#334155",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "11px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {copiedIndex === index ? "✓ Copied" : "Copy URL"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBlog;