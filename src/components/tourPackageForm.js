import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
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
import axios from 'axios';
import getFingerprint from 'src/utils/Fingerprint';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

// Custom Heading extension to automatically revert to paragraph on new line (Enter key)
const CustomHeading = Heading.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type.name === this.name) {
          if ($from.parent.content.size === 0) {
            return editor.commands.setParagraph();
          }

          return editor.chain()
            .splitBlock()
            .setParagraph()
            .run();
        }

        return false;
      },
    };
  },
});

// Slugify helper
const slugify = (text) => {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const TourPackageForm = (params) => {
  const router = useRouter();
  const queryPackageType = params?.package_type || router?.query?.package_type || router?.query?.type || "main";

  const [formData, setFormData] = useState({
    title: "",
    page_slug: "",
    package_type: queryPackageType || "main",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    schemaMarkup: "",
    customHeadTags: "",
    duration: "",
    locationCovered: "",
    packageCost: "",
    featured_image: [],
    itinerary: [],
  });

  useEffect(() => {
    if (queryPackageType) {
      setFormData((prev) => ({
        ...prev,
        package_type: queryPackageType,
      }));
    }
  }, [queryPackageType]);

  const [itineraryDay, setItineraryDay] = useState({
    title: "",
    image: "",
    tags: "",
    benefits: "",
    description: "",
  });
  const [editingItineraryIndex, setEditingItineraryIndex] = useState(null);
  const itineraryFormRef = useRef(null);
  const itineraryImageInputRef = useRef(null);
  const [isUploadingItineraryImage, setIsUploadingItineraryImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // FAQ State
  const [faqList, setFaqList] = useState([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [editingFaqIndex, setEditingFaqIndex] = useState(null);
  const [editFaqQuestion, setEditFaqQuestion] = useState("");
  const [editFaqAnswer, setEditFaqAnswer] = useState("");
  const [draggedFaqIndex, setDraggedFaqIndex] = useState(null);

  const handleStartEditFaq = (index) => {
    setEditingFaqIndex(index);
    setEditFaqQuestion(faqList[index]?.question || "");
    setEditFaqAnswer(faqList[index]?.answer || "");
  };

  const handleSaveEditFaq = (index) => {
    if (!editFaqQuestion.trim() || !editFaqAnswer.trim()) {
      alert("Both Question and Answer are required.");

      return;
    }
    const updated = [...faqList];
    updated[index] = {
      question: editFaqQuestion.trim(),
      answer: editFaqAnswer.trim(),
    };
    setFaqList(updated);
    setEditingFaqIndex(null);
    setEditFaqQuestion("");
    setEditFaqAnswer("");
  };

  const handleCancelEditFaq = () => {
    setEditingFaqIndex(null);
    setEditFaqQuestion("");
    setEditFaqAnswer("");
  };

  const generateFaqHTML = () => {
    if (faqList.length === 0) return "";

    let html = `<div class="row">
            <div class="col-lg-8 offset-lg-2 text-center mb-5">
                <h2 id="faq-heading" class="features-title">
                    Frequently Asked <span style="color: #1532d1;">Questions</span>
                </h2>
                <p class="features-subtitle">
                    Find answers to common questions about tour packages, travel itinerary, bookings, and support.
                </p>
            </div>
        </div>
        <div class="row">\n`;

    let leftHtml = `          <div class="col-md-6">
            <div class="accordion faq-card-accordion" id="faqLeft">\n`;
            
    let rightHtml = `          <div class="col-md-6">
            <div class="accordion faq-card-accordion" id="faqRight">\n`;

    const midIndex = Math.ceil(faqList.length / 2);

    faqList.forEach((faq, index) => {
      const faqNum = index + 1;
      const isFirst = index === 0;
      const isLeftColumn = index < midIndex;
      
      const buttonClass = isFirst ? "accordion-button" : "accordion-button collapsed";
      const ariaExpanded = isFirst ? "true" : "false";
      const collapseClass = isFirst ? "accordion-collapse collapse show" : "accordion-collapse collapse";
      
      const parentId = isLeftColumn ? "faqLeft" : "faqRight";
      
      const itemHtml = `              <div class="accordion-item">
                <h3 class="accordion-header" id="faqHeading${faqNum}">
                  <button
                    class="${buttonClass}"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#faq${faqNum}"
                    aria-expanded="${ariaExpanded}"
                    aria-controls="faq${faqNum}">
                    ${faq.question}
                  </button>
                </h3>
                <div
                  id="faq${faqNum}"
                  class="${collapseClass}"
                  aria-labelledby="faqHeading${faqNum}"
                  data-bs-parent="#${parentId}">
                  <div class="accordion-body">
                    ${faq.answer}
                  </div>
                </div>
              </div>\n`;

      if (isLeftColumn) {
        leftHtml += itemHtml;
      } else {
        rightHtml += itemHtml;
      }
    });

    leftHtml += `            </div>\n          </div>\n`;
    rightHtml += `            </div>\n          </div>\n`;

    html += leftHtml + rightHtml + `        </div>`;

    return html;
  };

  const [editorValue, setEditorValue] = useState("");
  const [isBrowser, setIsBrowser] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loadedContent, setLoadedContent] = useState(null);
  const [loadedLocationCovered, setLoadedLocationCovered] = useState(null);
  const [activeEditorTarget, setActiveEditorTarget] = useState("content");

  // Image Alt Modal State
  const [altModalOpen, setAltModalOpen] = useState(false);
  const [altModalImageSrc, setAltModalImageSrc] = useState("");
  const [altModalAltText, setAltModalAltText] = useState("");
  const [altModalIsNewInsert, setAltModalIsNewInsert] = useState(false);

  const handleConfirmAltModal = () => {
    const currentTargetEditor = activeEditorTarget === "location" ? locationEditor : editor;
    if (!currentTargetEditor) return;
    if (altModalIsNewInsert) {
      currentTargetEditor.chain().focus().setImage({
        src: altModalImageSrc,
        alt: altModalAltText.trim(),
      }).run();
    } else {
      currentTargetEditor.chain().focus().updateAttributes('image', {
        alt: altModalAltText.trim(),
      }).run();
    }
    setAltModalOpen(false);
    setAltModalImageSrc("");
    setAltModalAltText("");
  };

  const handleOpenEditAltForSelectedImage = (targetEditor) => {
    const currentTargetEditor = targetEditor || (activeEditorTarget === "location" ? locationEditor : editor);
    if (!currentTargetEditor) return;
    const attrs = currentTargetEditor.getAttributes('image');
    if (attrs?.src) {
      setAltModalImageSrc(attrs.src);
      setAltModalAltText(attrs.alt || "");
      setAltModalIsNewInsert(false);
      setAltModalOpen(true);
    } else {
      alert("Please click or select an image in the editor first to edit its alt text, or double-click the image.");
    }
  };

  const handleEditorDoubleClick = (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      const src = e.target.getAttribute('src') || '';
      const alt = e.target.getAttribute('alt') || '';
      setAltModalImageSrc(src);
      setAltModalAltText(alt);
      setAltModalIsNewInsert(false);
      setAltModalOpen(true);
    }
  };
  
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

  // TipTap extensions shared by both Location Covered and Content editors
  const editorExtensions = [
    StarterKit.configure({
      table: false,
      heading: false,
    }),
    CustomHeading.configure({
      levels: [1, 2, 3, 4, 5, 6],
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
  ];

  // TipTap editor for Content
  const editor = useEditor({
    extensions: editorExtensions,
    content: "",
    editorProps: {
      attributes: {
        class: 'content-prosemirror focus:outline-none',
        style: 'min-height: 300px; padding: 12px 14px; outline: none; cursor: text;',
      },
    },
    immediatelyRender: false,
  });

  // TipTap editor for Location Covered (Identical / Ek Sa Editor)
  const locationEditor = useEditor({
    extensions: editorExtensions,
    content: "",
    editorProps: {
      attributes: {
        class: 'location-prosemirror focus:outline-none',
        style: 'min-height: 220px; padding: 12px 14px; outline: none; cursor: text;',
      },
    },
    immediatelyRender: false,
  });

  // Custom image handler for TipTap (compressed to WebP via backend)
  const addImage = useCallback(async (targetEditor) => {
    if (targetEditor === locationEditor || activeEditorTarget === "location") {
      setActiveEditorTarget("location");
    } else {
      setActiveEditorTarget("content");
    }
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
            setUploadedImages((prev) => [
              {
                url: uploaded.url,
                name: uploaded.originalName || file.name,
                format: uploaded.format || "webp",
                size: uploaded.size,
              },
              ...prev,
            ]);
            const defaultAlt = file.name ? file.name.replace(/\.[^/.]+$/, "") : "";
            setAltModalImageSrc(uploaded.url);
            setAltModalAltText(defaultAlt);
            setAltModalIsNewInsert(true);
            setAltModalOpen(true);
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

  // Insert image from gallery into editor
  const insertImageFromGallery = (imageUrl) => {
    const target = activeEditorTarget === "location" ? locationEditor : editor;
    if (target) {
      setAltModalImageSrc(imageUrl);
      setAltModalAltText("");
      setAltModalIsNewInsert(true);
      setAltModalOpen(true);
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
        setSuccessMessage("Image uploaded successfully!");
      }
    } catch (error) {
      setErrorMessage("Failed to upload images: " + (error.response?.data?.message || error.message));
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

  useEffect(() => {
    if (locationEditor && loadedLocationCovered !== null) {
      locationEditor.commands.setContent(loadedLocationCovered);
    }
  }, [locationEditor, loadedLocationCovered]);

  const fetchImages = async (imageUrls) => {
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
  
      if (result.success) {
        let images = await fetchImages(JSON.parse(result.data.featured_image));
        let loadedItinerary = [];
        try {
          const rawItineraries = result.itineraries || [];
          if (Array.isArray(rawItineraries)) {
            rawItineraries.forEach((item) => {
              let details = item?.itinerary_details !== undefined ? item.itinerary_details : item;
              if (typeof details === "string") {
                try {
                  details = JSON.parse(details);
                  if (typeof details === "string") {
                    details = JSON.parse(details);
                  }
                } catch (parseErr) {
                  console.error("Error parsing itinerary_details string", parseErr);
                }
              }

              if (Array.isArray(details)) {
                loadedItinerary.push(...details);
              } else if (details && typeof details === "object") {
                if (Array.isArray(details.days)) {
                  loadedItinerary.push(...details.days);
                } else if (details.title || details.description) {
                  loadedItinerary.push(details);
                }
              }
            });
          }
        } catch (err) {
          console.error("Failed to parse itinerary details", err);
        }

        setFormData({
          title: result.data.title,
          page_slug: result.data.page_slug || slugify(result.data.title),
          package_type: result.data.package_type || "main",
          metaTitle: result.data.metaTitle || "",
          metaDescription: result.data.metaDescription || "",
          metaKeywords: result.data.metaKeywords || "",
          schemaMarkup: result.data.schemaMarkup || "",
          customHeadTags: result.data.customHeadTags || "",
          duration: result.data.duration,
          locationCovered: result.data.location_covered || "",
          packageCost: result.data.package_cost,
          featured_image: [...images],
          itinerary: Array.isArray(loadedItinerary) ? loadedItinerary : [],
        });
        
        let contentHtml = result.data.content || "";
        const faqs = [];
        if (typeof window !== 'undefined') {
            let faqHtml = result.data.faq_content;
            if (!faqHtml && contentHtml && contentHtml.includes('id="faqLeft"')) {
               const parser = new DOMParser();
               const doc = parser.parseFromString(contentHtml, 'text/html');
               const accordionWrapper = doc.querySelector('#faqLeft');
               if (accordionWrapper) {
                   const row = accordionWrapper.closest('.row');
                   if (row) {
                       faqHtml = row.outerHTML;
                       row.remove();
                   } else {
                       faqHtml = accordionWrapper.outerHTML;
                       accordionWrapper.remove();
                   }
                   contentHtml = doc.body.innerHTML;
               }
            }

            if (faqHtml) {
               const parser = new DOMParser();
               const doc = parser.parseFromString(faqHtml, 'text/html');
               const accordionItems = doc.querySelectorAll('.accordion-item');
               accordionItems.forEach(item => {
                   const question = item.querySelector('.accordion-button')?.textContent || '';
                   const answer = item.querySelector('.accordion-body')?.innerHTML || '';
                   if (question && answer) {
                       faqs.push({ question: question.trim(), answer: answer.trim() });
                   }
               });
            }
        }
        setFaqList(faqs);
        setLoadedLocationCovered(result.data.location_covered || "");
        setLoadedContent(contentHtml);
        
        let previewImages = JSON.parse(result.data.featured_image);
        previewImages = previewImages.map((image) => {
          return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/tour_packages/${image}`;
        });

        setImagePreviews([...previewImages]);
      }
    } catch (error) {
      alert("Error fetching package details : " + error.message);   
    }
  };

  useEffect(() => {
    if (params.id && editor && locationEditor) {
      getTourPackage(params.id);
    }
  }, [params.id, editor, locationEditor]);

  const handleItineraryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds 5MB limit. Please select an image under 5MB.`);
      if (itineraryImageInputRef.current) itineraryImageInputRef.current.value = "";
      
return;
    }

    setIsUploadingItineraryImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('images', file);
      const device_id = await getFingerprint();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/upload-blog-image`,
        uploadFormData,
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
        const uploadedUrl = result.data[0].url;
        setItineraryDay((prev) => ({
          ...prev,
          image: uploadedUrl,
        }));
      } else {
        alert("Failed to upload itinerary image: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      alert("Failed to upload itinerary image: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUploadingItineraryImage(false);
      if (itineraryImageInputRef.current) {
        itineraryImageInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (errorMessage) {
      setErrorMessage("");
    }
    if (name === "title") {
      setFormData((prev) => {
        const shouldSyncSlug = !prev.page_slug || prev.page_slug === slugify(prev.title);

        return {
          ...prev,
          title: value,
          page_slug: shouldSyncSlug ? slugify(value) : prev.page_slug,
        };
      });
    } else if (name === "page_slug") {
      setFormData((prev) => ({
        ...prev,
        page_slug: slugify(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
  
  const handleItineraryChange = (e) => {
    const { name, value } = e.target;
    setItineraryDay({
      ...itineraryDay,
      [name]: value,
    });
  };

  const handleSaveItineraryDay = () => {
    if (!itineraryDay.title && !itineraryDay.description) {
      alert("Please provide at least a Title or Description for this day.");

      return;
    }

    if (editingItineraryIndex !== null) {
      // Update the day in place without deleting or changing order
      const updatedItinerary = [...formData.itinerary];
      updatedItinerary[editingItineraryIndex] = { ...itineraryDay };
      setFormData({
        ...formData,
        itinerary: updatedItinerary,
      });
      setEditingItineraryIndex(null);
    } else {
      // Add new day to the end of itinerary
      setFormData({
        ...formData,
        itinerary: [...formData.itinerary, { ...itineraryDay }],
      });
    }

    setItineraryDay({ title: "", image: "", tags: "", benefits: "", description: "" });
  };

  const handleCancelEditItineraryDay = () => {
    setEditingItineraryIndex(null);
    setItineraryDay({ title: "", image: "", tags: "", benefits: "", description: "" });
  };

  const handleStartEditItineraryDay = (index) => {
    setEditingItineraryIndex(index);
    setItineraryDay({ ...formData.itinerary[index] });
    if (itineraryFormRef.current) {
      itineraryFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const removeItineraryDay = (index) => {
    if (editingItineraryIndex === index) {
      setEditingItineraryIndex(null);
      setItineraryDay({ title: "", image: "", tags: "", benefits: "", description: "" });
    } else if (editingItineraryIndex !== null && index < editingItineraryIndex) {
      setEditingItineraryIndex((prev) => prev - 1);
    }

    const updatedItinerary = formData.itinerary.filter((_, i) => i !== index);
    setFormData({ ...formData, itinerary: updatedItinerary });
  };

  const addItineraryDay = handleSaveItineraryDay;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the form
    if (!formData.title || !formData.duration || !formData.packageCost) {      
      alert("Please fill all required fields.");  
      setErrorMessage("Please fill all required fields.");

      return;
    }

    const editorContent = editor?.getHTML() || '';
    const locationContent = locationEditor?.getHTML() || '';
    const finalSlug = slugify(formData.page_slug || formData.title);
    
    const data = new FormData();
    data.append("title", formData.title);
    data.append("page_slug", finalSlug);
    data.append("slug", finalSlug);
    data.append("package_type", formData.package_type || "main");
    data.append("type", formData.package_type || "main");
    data.append("metaTitle", formData.metaTitle || "");
    data.append("metaDescription", formData.metaDescription || "");
    data.append("metaKeywords", formData.metaKeywords || "");
    data.append("schemaMarkup", formData.schemaMarkup || "");
    data.append("customHeadTags", formData.customHeadTags || "");
    data.append("duration", formData.duration);
    data.append("package_cost", formData.packageCost);
    data.append("location_covered", locationContent);
    data.append("content", editorContent);
    data.append("faq_content", generateFaqHTML());
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

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        result = null;
      }

      if (!response.ok || !result?.success) {
        const errorMsg = result?.message || result?.error || `Request failed with status ${response.status}`;
        setErrorMessage(errorMsg);
        alert(errorMsg);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        return;
      }

      setErrorMessage("");

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

        const redirectPath = (formData.package_type === "urbania") ? "/urbaniaTourPackages" : "/tourPackages/view";

        try {
          const uploadResponse = await fetch('https://bookfast.in/uploadTour.php', {
            method: 'POST',
            body: uploadData,
          });

          // Check response
          if (uploadResponse.ok) {
            console.log('Upload successful');
            resetForm();
            router.push(redirectPath);
          } else {
            console.error('Upload failed');
            resetForm();
            router.push(redirectPath);
          }
        } catch (error) {
          console.error('Error uploading files:', error);
          resetForm();
          router.push(redirectPath);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      setErrorMessage(error.message);
      alert("Error during submission: " + error.message);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      page_slug: "",
      package_type: formData.package_type || "main",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      schemaMarkup: "",
      customHeadTags: "",
      duration: "",
      locationCovered: "",
      packageCost: "",
      featured_image: [],
      itinerary: [],
    });
    setFaqList([]);
    setFaqQuestion("");
    setFaqAnswer("");
    setEditingFaqIndex(null);
    setImagePreviews([]);
    setEditorValue("");
    setItineraryDay({ title: "", image: "", tags: "", benefits: "", description: "" });
    if (editor) {
      editor.commands.setContent('');
    }
    if (locationEditor) {
      locationEditor.commands.setContent('');
    }
  };

  // Insert table function
  const insertTable = (targetEditor = editor) => {
    const activeEd = targetEditor || editor;
    if (!activeEd) {
      console.log('Editor not available');

      return;
    }
    
    try {
      const result = activeEd.chain().focus().insertTable({ 
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
        activeEd.chain().focus().insertContent(tableHTML).run();
      }
    } catch (error) {
      console.error('Error inserting table:', error);
    }
  };

  // Toolbar component
   // Toolbar component
  const EditorToolbar = ({ editor: editorInstance = editor }) => {
    const editor = editorInstance;
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
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderBottom: '2px solid #ced4da',
        borderRadius: '6px 6px 0 0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
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
          value={
            editor.isActive('heading', { level: 1 }) ? "1" :
            editor.isActive('heading', { level: 2 }) ? "2" :
            editor.isActive('heading', { level: 3 }) ? "3" :
            editor.isActive('heading', { level: 4 }) ? "4" :
            editor.isActive('heading', { level: 5 }) ? "5" :
            editor.isActive('heading', { level: 6 }) ? "6" : ""
          }
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level) {
              editor.chain().focus().setHeading({ level }).run();
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
          onClick={() => addImage(editor)}
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

        <button
          type="button"
          onClick={() => handleOpenEditAltForSelectedImage(editor)}
          style={{
            padding: '6px 10px',
            border: '1px solid #ccc',
            backgroundColor: editor.isActive('image') ? '#007BFF' : '#fff',
            color: editor.isActive('image') ? '#fff' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Set / Edit Alt Text for image (Select or double-click image)"
        >
          🏷️ Alt
        </button>

        {/* Table Buttons */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '10px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
          <button
            type="button"
            onClick={() => insertTable(editor)}
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
     
     

      <div style={{ display: "flex", gap: "20px", maxWidth: "1400px", margin: "auto" }}>
        {/* Main Form */}
        <div style={{ flex: "2" }}>
          {errorMessage && (
            <div style={{
              padding: "14px 18px",
              backgroundColor: "#fef2f2",
              border: "1px solid #f87171",
              borderRadius: "8px",
              color: "#991b1b",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(239, 68, 68, 0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>⚠️</span>
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#991b1b",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "18px",
                  lineHeight: 1
                }}
                title="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            style={{ maxWidth: "100%" }}
            encType="multipart/form-data"
          >
            {/* Package Type Field */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="package_type" style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}>
                Package Type <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                id="package_type"
                name="package_type"
                value={formData.package_type || "main"}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="main">Main Tour Package</option>
                <option value="urbania">Urbania Tour Package</option>
              </select>
            </div>

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
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "4px",
                  border: errorMessage && errorMessage.toLowerCase().includes("title") ? "2px solid #ef4444" : "1px solid #ccc",
                  backgroundColor: errorMessage && errorMessage.toLowerCase().includes("title") ? "#fff5f5" : "#fff",
                  boxSizing: "border-box"
                }}
              />
              {errorMessage && errorMessage.toLowerCase().includes("title") && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", fontWeight: "500" }}>
                  ⚠️ {errorMessage}
                </div>
              )}
            </div>

            {/* Slug Field */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <label htmlFor="page_slug" style={{ display: "block", fontWeight: "bold" }}>
                  Slug (URL)
                </label>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Auto-generated from title or custom
                </span>
              </div>
              <input
                type="text"
                id="page_slug"
                name="page_slug"
                value={formData.page_slug || ""}
                onChange={handleInputChange}
                placeholder="e.g. chandigarh-to-kashmir"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "4px",
                  border: errorMessage && errorMessage.toLowerCase().includes("slug") ? "2px solid #ef4444" : "1px solid #cbd5e1",
                  backgroundColor: errorMessage && errorMessage.toLowerCase().includes("slug") ? "#fff5f5" : "#fff",
                  boxSizing: "border-box"
                }}
              />
              {errorMessage && errorMessage.toLowerCase().includes("slug") && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", fontWeight: "500" }}>
                  ⚠️ {errorMessage}
                </div>
              )}
            </div>

            {/* SEO & Meta Tags Card Section */}
            <div style={{
              margin: "25px 0",
              padding: "20px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
                paddingBottom: "12px",
                borderBottom: "1px solid #e2e8f0"
              }}>
                <div>
                  <h3 style={{ margin: "0", fontSize: "17px", fontWeight: "600", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🏷️</span> SEO & Meta Configuration
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                    Configure search engine meta tags, structured schema markup, and custom head scripts for this package page.
                  </p>
                </div>
              </div>

              {/* Meta Title */}
              <div style={{ marginBottom: "18px" }}>
                <label htmlFor="metaTitle" style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#334155", marginBottom: "6px" }}>
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="Enter SEO meta title"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Meta Description */}
              <div style={{ marginBottom: "18px" }}>
                <label htmlFor="metaDescription" style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#334155", marginBottom: "6px" }}>
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="Enter SEO meta description (recommended 150-160 characters)"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Meta Keywords */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <label htmlFor="metaKeywords" style={{ fontWeight: "600", fontSize: "14px", color: "#334155" }}>
                    Meta Keywords
                  </label>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Comma separated</span>
                </div>
                <textarea
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. tour package, kashmir tour package, outstation tour"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
                <small style={{ display: "block", marginTop: "4px", color: "#64748b", fontSize: "12px" }}>
                  Enter keywords separated by commas for search engines.
                </small>
              </div>

              {/* Schema Markup (JSON-LD) */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <label htmlFor="schemaMarkup" style={{ fontWeight: "600", fontSize: "14px", color: "#334155" }}>
                    Schema Markup (JSON-LD)
                  </label>
                  <span style={{ fontSize: "12px", color: "#0070f3", fontFamily: "monospace" }}>&lt;script type="application/ld+json"&gt;</span>
                </div>
                <textarea
                  id="schemaMarkup"
                  name="schemaMarkup"
                  value={formData.schemaMarkup || ""}
                  onChange={handleInputChange}
                  placeholder={`<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "TouristTrip",\n  "name": "...",\n  "description": "..."\n}\n</script>`}
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                    lineHeight: "1.5"
                  }}
                />
                <small style={{ display: "block", marginTop: "4px", color: "#64748b", fontSize: "12px" }}>
                  Paste structured data script or raw JSON-LD for rich snippets (TouristTrip, Product, Breadcrumbs, FAQs).
                </small>
              </div>

              {/* Custom Meta Head Tags */}
              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <label htmlFor="customHeadTags" style={{ fontWeight: "600", fontSize: "14px", color: "#334155" }}>
                    Custom Meta Head Tags
                  </label>
                  <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>&lt;head&gt; tags</span>
                </div>
                <textarea
                  id="customHeadTags"
                  name="customHeadTags"
                  value={formData.customHeadTags || ""}
                  onChange={handleInputChange}
                  placeholder={`<meta name="robots" content="index, follow" />\n<link rel="canonical" href="https://bookfast.in/tour-packages/chandigarh-to-kashmir" />\n<meta property="og:type" content="website" />`}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                    lineHeight: "1.5"
                  }}
                />
                <small style={{ display: "block", marginTop: "4px", color: "#64748b", fontSize: "12px" }}>
                  Add custom HTML tags to inject into the &lt;head&gt; element (e.g. custom canonical links, Open Graph tags, robots meta tags, Twitter cards).
                </small>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <label htmlFor="duration" style={{ display: "block", fontWeight: "bold" }}>
                  Duration (Varchar / Text) <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <span style={{ fontSize: "12px", color: "#64748b" }}>e.g. 3 Days / 2 Nights, 4N/5D, 5 Days</span>
              </div>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g. 3 Days / 2 Nights, 3D/2N, 5 Days"
                required
                style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                <label htmlFor="packageCost" style={{ display: "block", fontWeight: "bold" }}>
                  Package Cost <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Text / Varchar (e.g. 15000, ₹ 15,000, Starting from 5000)</span>
              </div>
              <input
                type="text"
                id="packageCost"
                name="packageCost"
                value={formData.packageCost}
                onChange={handleInputChange}
                placeholder="e.g. 15000, ₹ 15,000, Starting from 5000"
                required
                style={{ width: "100%", padding: "10px", marginTop: "5px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
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

            {/* Location Covered (TipTap Editor) */}
            <div 
              style={{ marginBottom: "30px" }}
              onFocus={() => setActiveEditorTarget("location")}
              onClick={() => {
                setActiveEditorTarget("location");
                if (locationEditor && !locationEditor.isFocused) {
                  locationEditor.commands.focus();
                }
              }}
            >
              <label htmlFor="locationCovered" style={{ display: "block", fontWeight: "bold", fontSize: "16px", marginBottom: "10px" }}>
                Location Covered
              </label>
              {isBrowser && locationEditor && (
                <div 
                  onDoubleClick={(e) => handleEditorDoubleClick(e, locationEditor)}
                  onClick={() => {
                    setActiveEditorTarget("location");
                    locationEditor.commands.focus();
                  }}
                  style={{ cursor: "text" }}
                >
                  <EditorToolbar editor={locationEditor} />
                  <EditorContent 
                    editor={locationEditor} 
                    className="location-tiptap-content"
                    style={{
                      border: '1px solid #dee2e6',
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      minHeight: '220px',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>
              )}
            </div>

            {/* TipTap Editor for Content */}
            <div 
              style={{ marginBottom: "20px" }} 
              onFocus={() => setActiveEditorTarget("content")} 
              onClick={() => {
                setActiveEditorTarget("content");
                if (editor && !editor.isFocused) {
                  editor.commands.focus();
                }
              }}
            >
              <label htmlFor="content" style={{ display: "block", fontWeight: "bold", fontSize: "16px", marginBottom: "10px" }}>
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
                <div 
                  onDoubleClick={(e) => handleEditorDoubleClick(e, editor)}
                  onClick={() => {
                    setActiveEditorTarget("content");
                    editor.commands.focus();
                  }}
                  style={{ cursor: "text" }}
                >
                  <EditorToolbar editor={editor} />
                  <EditorContent 
                    editor={editor} 
                    className="content-tiptap-content"
                    style={{
                      border: '1px solid #dee2e6',
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      minHeight: '300px',
                      backgroundColor: '#fff',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Itinerary Section */}
            <div ref={itineraryFormRef} style={{ maxWidth: "100%", margin: "30px auto", padding: "20px", border: editingItineraryIndex !== null ? "2px solid #2563eb" : "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: editingItineraryIndex !== null ? "#f8faff" : "#f9f9f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "10px", borderBottom: "1px solid #e2e8f0" }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: editingItineraryIndex !== null ? "#2563eb" : "#0f172a" }}>
                  {editingItineraryIndex !== null ? `✏️ Edit Day ${editingItineraryIndex + 1}` : "Add Itinerary Day"}
                </h2>
                {editingItineraryIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEditItineraryDay}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#fff",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  >
                    ✕ Cancel Edit
                  </button>
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="dayTitle" style={{ display: "block", fontWeight: "bold" }}>Day Title:</label>
                <input
                  type="text"
                  id="dayTitle"
                  name="title"
                  value={itineraryDay.title}
                  onChange={handleItineraryChange}
                  placeholder="e.g. Day 1: Arrival & Local Sightseeing"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" }}
                />
              </div>

              {/* Day Image Upload Section */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}>Day Image:</label>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                  <input
                    type="file"
                    ref={itineraryImageInputRef}
                    accept="image/*"
                    onChange={handleItineraryImageUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => itineraryImageInputRef.current?.click()}
                    disabled={isUploadingItineraryImage}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: isUploadingItineraryImage ? "#94a3b8" : "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: isUploadingItineraryImage ? "not-allowed" : "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    {isUploadingItineraryImage ? "Uploading Image..." : "📷 Upload Day Image"}
                  </button>

                  {itineraryDay.image && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={itineraryDay.image}
                        alt="Day preview"
                        style={{
                          width: "80px",
                          height: "55px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setItineraryDay((prev) => ({ ...prev, image: "" }))}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "11px",
                          cursor: "pointer"
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>
                <small style={{ color: "#64748b", display: "block", marginTop: "4px", fontSize: "12px" }}>
                  Upload an image for this itinerary day (WebP compressed).
                </small>
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
              
              {editingItineraryIndex !== null ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleSaveItineraryDay}
                    style={{
                      flex: 1,
                      padding: "11px",
                      backgroundColor: "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "14px"
                    }}
                  >
                    💾 Update Day {editingItineraryIndex + 1}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditItineraryDay}
                    style={{
                      padding: "11px 20px",
                      backgroundColor: "#e2e8f0",
                      color: "#334155",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveItineraryDay}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "11px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  + Add Day
                </button>
              )}
            </div>

            <h3>Current Itinerary:</h3>
            {formData.itinerary.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No itinerary days added yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                {formData.itinerary.map((day, index) => {
                  const isBeingEdited = editingItineraryIndex === index;

                  return (
                    <div 
                      key={index}
                      style={{
                        display: "flex",
                        gap: "15px",
                        padding: "14px 16px",
                        backgroundColor: isBeingEdited ? "#eff6ff" : "#fff",
                        borderRadius: "6px",
                        border: isBeingEdited ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", gap: "14px", flex: 1, alignItems: "flex-start" }}>
                        {day.image && (
                          <img
                            src={day.image}
                            alt={day.title || `Day ${index + 1}`}
                            style={{
                              width: "90px",
                              height: "65px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #cbd5e1",
                              flexShrink: 0
                            }}
                          />
                        )}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ fontWeight: "bold", fontSize: "15px", color: "#0f172a" }}>
                              Day {index + 1}: {day.title || "Untitled Day"}
                            </div>
                            {isBeingEdited && (
                              <span style={{
                                backgroundColor: "#2563eb",
                                color: "#fff",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: "600"
                              }}>
                                Editing...
                              </span>
                            )}
                          </div>
                          {day.tags && (
                            <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "3px" }}>
                              <strong>Tags:</strong> {day.tags}
                            </div>
                          )}
                          {day.benefits && (
                            <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "3px" }}>
                              <strong>Benefits:</strong> {day.benefits}
                            </div>
                          )}
                          {day.description && (
                            <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px", whiteSpace: "pre-line" }}>
                              {day.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (isBeingEdited) {
                              handleCancelEditItineraryDay();
                            } else {
                              handleStartEditItineraryDay(index);
                            }
                          }}
                          style={{
                            backgroundColor: isBeingEdited ? "#2563eb" : "#f1f5f9",
                            color: isBeingEdited ? "#fff" : "#2563eb",
                            padding: "6px 12px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                          title={isBeingEdited ? "Cancel Editing" : "Edit Day"}
                        >
                          {isBeingEdited ? "Cancel" : "✏️ Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(index)}
                          style={{
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            padding: "6px 12px",
                            border: "1px solid #fecaca",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          Remove Day
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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

      <div style={{ flex: "1", minWidth: 0, width: "100%", maxWidth: "100%" }}>
        {/* Upload Image Section */}
        <div style={{ 
          backgroundColor: "#ffffff", 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          boxSizing: "border-box",
          width: "100%",
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

        {/* FAQ Section */}
        <div style={{
          marginTop: "40px",
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e5e7eb"
        }}>
<div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                marginBottom: "20px", 
                borderBottom: "1px solid #e2e8f0", 
                paddingBottom: "12px" 
              }}>
                <h3 style={{ margin: 0, color: "#111827", fontSize: "18px", fontWeight: "700" }}>
                  Frequently Asked Questions (FAQ)
                </h3>
                {faqList.length > 0 && (
                  <span style={{ 
                    backgroundColor: "#eff6ff", 
                    color: "#2563eb", 
                    fontSize: "12px", 
                    fontWeight: "600", 
                    padding: "2px 10px", 
                    borderRadius: "12px", 
                    border: "1px solid #bfdbfe" 
                  }}>
                    {faqList.length} {faqList.length === 1 ? "FAQ" : "FAQs"}
                  </span>
                )}
              </div>

              {/* Add New FAQ Card */}
              <div style={{ 
                backgroundColor: "#ffffff", 
                padding: "18px 20px", 
                borderRadius: "12px", 
                marginBottom: "25px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
              }}>
                <h4 style={{ margin: "0 0 14px 0", color: "#1f2937", fontSize: "14.5px", fontWeight: "600" }}>
                  + Add New FAQ
                </h4>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "5px" }}>
                    Question:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. What is included in this tour package?"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "9px 12px", 
                      borderRadius: "6px", 
                      border: "1px solid #d1d5db", 
                      fontSize: "13.5px", 
                      outline: "none",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                    onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#16a34a", letterSpacing: "0.5px", marginBottom: "5px" }}>
                    ANSWER <span style={{ fontWeight: "400", color: "#6b7280" }}>(HTML supported)</span>:
                  </label>
                  <textarea
                    placeholder="e.g. The package includes hotel stay, sightseeing, cab transfers, and breakfast."
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    rows={3}
                    style={{ 
                      width: "100%", 
                      padding: "9px 12px", 
                      borderRadius: "6px", 
                      border: "1px solid #d1d5db", 
                      fontSize: "13.5px", 
                      fontFamily: "inherit", 
                      outline: "none",
                      backgroundColor: "#ffffff",
                      boxSizing: "border-box",
                      resize: "vertical"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                    onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (faqQuestion.trim() && faqAnswer.trim()) {
                      setFaqList([...faqList, { question: faqQuestion.trim(), answer: faqAnswer.trim() }]);
                      setFaqQuestion("");
                      setFaqAnswer("");
                    } else {
                      alert("Please enter both Question and Answer.");
                    }
                  }}
                  style={{ 
                    padding: "8px 18px", 
                    backgroundColor: "#2563eb", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "6px", 
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                >
                  + Add FAQ
                </button>
              </div>

              {faqList.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", color: "#111827", fontSize: "14.5px", fontWeight: "600" }}>
                    Added FAQs ({faqList.length})
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {faqList.map((faq, index) => {
                      const itemNumber = String(index + 1).padStart(2, "0");

                      return (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => setDraggedFaqIndex(index)}
                          onDragEnd={() => setDraggedFaqIndex(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (draggedFaqIndex === null || draggedFaqIndex === index) return;
                            const reordered = [...faqList];
                            const [removed] = reordered.splice(draggedFaqIndex, 1);
                            reordered.splice(index, 0, removed);
                            setFaqList(reordered);
                            setDraggedFaqIndex(null);
                          }}
                          style={{
                            opacity: draggedFaqIndex === index ? 0.35 : 1,
                            transition: "opacity 0.15s ease",
                            cursor: "grab"
                          }}
                        >
                          {editingFaqIndex === index ? (
                            <div style={{
                              padding: "16px 20px",
                              backgroundColor: "#ffffff",
                              border: "1.5px solid #2563eb",
                              borderRadius: "12px",
                              boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb" }}>
                                  {itemNumber} · FAQ Item (Editing)
                                </span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditFaq(index)}
                                    style={{
                                      padding: "4px 10px",
                                      backgroundColor: "#16a34a",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "5px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    ✓ Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEditFaq}
                                    style={{
                                      padding: "4px 10px",
                                      backgroundColor: "#6b7280",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "5px",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    ✕ Cancel
                                  </button>
                                </div>
                              </div>

                              <div style={{ marginBottom: "10px" }}>
                                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#4b5563", marginBottom: "4px" }}>
                                  Question:
                                </label>
                                <input
                                  type="text"
                                  value={editFaqQuestion}
                                  onChange={(e) => setEditFaqQuestion(e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "13.5px",
                                    backgroundColor: "#fff",
                                    boxSizing: "border-box",
                                    outline: "none"
                                  }}
                                />
                              </div>

                              <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#16a34a", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "4px" }}>
                                  ANSWER (HTML supported):
                                </label>
                                <textarea
                                  value={editFaqAnswer}
                                  onChange={(e) => setEditFaqAnswer(e.target.value)}
                                  rows={3}
                                  style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "13.5px",
                                    fontFamily: "inherit",
                                    backgroundColor: "#fff",
                                    boxSizing: "border-box",
                                    outline: "none",
                                    resize: "vertical"
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div style={{ 
                              padding: "16px 20px", 
                              backgroundColor: "#ffffff", 
                              border: "1px solid #e5e7eb", 
                              borderRadius: "12px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = "#cbd5e1";
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = "#e5e7eb";
                              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                            }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#111827", letterSpacing: "0.2px" }}>
                                  {itemNumber} · FAQ Item
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditFaq(index)}
                                    style={{ 
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: "22px",
                                      height: "22px",
                                      background: "none",
                                      border: "none", 
                                      color: "#9ca3af", 
                                      cursor: "pointer", 
                                      borderRadius: "4px",
                                      padding: 0,
                                      transition: "color 0.15s, background-color 0.15s"
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.color = "#2563eb";
                                      e.currentTarget.style.backgroundColor = "#eff6ff";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.color = "#9ca3af";
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                    title="Edit FAQ"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 20h9"></path>
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to remove this FAQ?")) {
                                        const newFaqList = [...faqList];
                                        newFaqList.splice(index, 1);
                                        setFaqList(newFaqList);
                                        if (editingFaqIndex === index) {
                                          setEditingFaqIndex(null);
                                        }
                                      }
                                    }}
                                    style={{ 
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: "22px",
                                      height: "22px",
                                      background: "none",
                                      border: "none", 
                                      color: "#ef4444", 
                                      cursor: "pointer", 
                                      borderRadius: "4px",
                                      padding: 0,
                                      transition: "color 0.15s, background-color 0.15s"
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.color = "#dc2626";
                                      e.currentTarget.style.backgroundColor = "#fee2e2";
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.color = "#ef4444";
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                    title="Delete FAQ"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937", marginBottom: "6px" }}>
                                {faq.question}
                              </div>

                              <div 
                                style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.5" }}
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>

      {/* Image Alt Text Dialog */}
      <Dialog
        open={altModalOpen}
        onClose={() => setAltModalOpen(false)}
        maxWidth="sm"
        fullWidth
        style={{ zIndex: 9999 }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: "#1976d2", pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          {altModalIsNewInsert ? "🖼️ Add Image Alt Text (SEO)" : "✏️ Edit Image Alt Text"}
        </DialogTitle>
        <DialogContent dividers>
          {altModalImageSrc && (
            <div style={{ textAlign: "center", marginBottom: "16px", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
              <img
                src={altModalImageSrc}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "160px", objectFit: "contain", borderRadius: "4px" }}
              />
            </div>
          )}
          <TextField
            autoFocus
            label="Image Alt Text (SEO Description)"
            placeholder="e.g. Chandigarh to Delhi cab service"
            fullWidth
            variant="outlined"
            value={altModalAltText}
            onChange={(e) => setAltModalAltText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmAltModal();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAltModalOpen(false)} color="inherit">
            Cancel
          </Button>
          {altModalIsNewInsert && (
            <Button
              onClick={() => {
                editor?.chain().focus().setImage({ src: altModalImageSrc, alt: "" }).run();
                setAltModalOpen(false);
              }}
              color="secondary"
            >
              Skip Alt
            </Button>
          )}
          <Button
            onClick={handleConfirmAltModal}
            variant="contained"
            color="primary"
          >
            {altModalIsNewInsert ? "Insert Image" : "Save Alt Text"}
          </Button>
        </DialogActions>
      </Dialog>

      <style dangerouslySetInnerHTML={{
        __html: `
        .location-tiptap-content .ProseMirror {
          min-height: 220px !important;
          padding: 12px 14px !important;
          outline: none !important;
          cursor: text !important;
        }
        .content-tiptap-content .ProseMirror {
          min-height: 300px !important;
          padding: 12px 14px !important;
          outline: none !important;
          cursor: text !important;
        }
        .location-tiptap-content .ProseMirror p,
        .content-tiptap-content .ProseMirror p {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
      `
      }} />
    </>
  );
};

export default TourPackageForm;