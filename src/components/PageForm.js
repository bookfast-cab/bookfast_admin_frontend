import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import api from "src/@core/utils/api";
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
          // If heading is completely empty, convert it to paragraph
          if ($from.parent.content.size === 0) {
            return editor.commands.setParagraph();
          }

          // At the end or within heading: split block and convert the newly created second block to paragraph
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


const PageForm = ({ hidefeatureImage }) => {
  const Router = useRouter();
  const { id, page_type: queryPageType } = Router.query;


  const [formData, setFormData] = useState({
    title: "",
    page_type: queryPageType || "main",
    featuredImage: null,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    schemaMarkup: "",
    customHeadTags: "",
  });

  useEffect(() => {
    if (!id && queryPageType) {
      setFormData((prev) => ({
        ...prev,
        page_type: queryPageType,
      }));
    }
  }, [id, queryPageType]);

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

    // 1. Header Section
    let html = `<div class="row">
            <div class="col-lg-8 offset-lg-2 text-center mb-5">
                <h2 id="faq-heading" class="features-title">
                    Frequently Asked <span style="color: #1532d1;">Questions</span>
                </h2>
                <p class="features-subtitle">
                    Find answers to common questions about BookFast outstation taxi services,
                    one-way and round-trip cab bookings, fares, vehicles and travel support.
                </p>
            </div>
        </div>
        <div class="row">\n`; // Start row for the 6-6 columns

    // 2. Prepare left and right column HTML
    let leftHtml = `          <div class="col-md-6">
            <div class="accordion faq-card-accordion" id="faqLeft">\n`;
            
    let rightHtml = `          <div class="col-md-6">
            <div class="accordion faq-card-accordion" id="faqRight">\n`;

    // Calculate the middle point to split the array
    const midIndex = Math.ceil(faqList.length / 2);

    // 3. Loop through FAQs and divide them
    faqList.forEach((faq, index) => {
      const faqNum = index + 1;
      const isFirst = index === 0;
      const isLeftColumn = index < midIndex;
      
      const buttonClass = isFirst ? "accordion-button" : "accordion-button collapsed";
      const ariaExpanded = isFirst ? "true" : "false";
      const collapseClass = isFirst ? "accordion-collapse collapse show" : "accordion-collapse collapse";
      
      // Ensure the accordion data-bs-parent targets the correct column ID
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

      // Append to the respective column
      if (isLeftColumn) {
        leftHtml += itemHtml;
      } else {
        rightHtml += itemHtml;
      }
    });

    // Close the accordions and columns
    leftHtml += `            </div>\n          </div>\n`;
    rightHtml += `            </div>\n          </div>\n`;

    // 4. Combine and close the row
    html += leftHtml + rightHtml + `        </div>`;

    return html;
    
  };


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
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loadedContent, setLoadedContent] = useState(null); // Track loaded content

  // Image Alt Modal State
  const [altModalOpen, setAltModalOpen] = useState(false);
  const [altModalImageSrc, setAltModalImageSrc] = useState("");
  const [altModalAltText, setAltModalAltText] = useState("");
  const [altModalIsNewInsert, setAltModalIsNewInsert] = useState(false);

  const handleConfirmAltModal = () => {
    if (!editor) return;
    if (altModalIsNewInsert) {
      editor.chain().focus().setImage({
        src: altModalImageSrc,
        alt: altModalAltText.trim(),
      }).run();
    } else {
      editor.chain().focus().updateAttributes('image', {
        alt: altModalAltText.trim(),
      }).run();
    }
    setAltModalOpen(false);
    setAltModalImageSrc("");
    setAltModalAltText("");
  };

  const handleOpenEditAltForSelectedImage = () => {
    if (!editor) return;
    const attrs = editor.getAttributes('image');
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

  // Tiptap editor configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in table and heading nodes so our custom ones take effect
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
    ],
    content: editorContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border border-gray-300 rounded-md',
      },
    },
    immediatelyRender: false,
  });

  // Custom image handler for Tiptap
  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setErrorMessage(`File "${file.name}" exceeds 5MB limit. Please select an image under 5MB.`);
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
          const errMsg = "Failed to upload image: " + (error.response?.data?.message || error.message);
          setErrorMessage(errMsg);
        } finally {
          setIsUploading(false);
        }
      }
    };
  }, [editor]);

  // Ensuring the component is rendered only on the client side
  useEffect(() => {
    setIsBrowser(true);
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


  // Insert image from gallery into editor
  const insertImageFromGallery = (imageUrl) => {
    if (editor) {
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
      const msg = `File size exceeds 5MB limit (${oversizedFiles.map((f) => f.name).join(", ")}). Please select images under 5MB.`;
      setErrorMessage(msg);
      alert(msg);
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
          page_type: result.data.page_type || "main",
          featuredImage: result.data.featuredImage,
          metaTitle: result.data.metaTitle || "",
          metaDescription: result.data.metaDescription || "",
          metaKeywords: result.data.metaKeywords || result.data.meta_keywords || "",
          schemaMarkup: result.data.schemaMarkup || result.data.schema_markup || result.data.schema || "",
          customHeadTags: result.data.customHeadTags || result.data.custom_head_tags || result.data.head_tags || "",
        });

        let content = result.data.content || "";
        const faqs = [];
        if (typeof window !== 'undefined') {
            // First try to parse from faq_content if available
            let faqHtml = result.data.faq_content;
            
            // Backward compatibility: If no faq_content, check if it's embedded in content
            if (!faqHtml && content && content.includes('id="faqLeft"')) {
               const parser = new DOMParser();
               const doc = parser.parseFromString(content, 'text/html');
               const accordionWrapper = doc.querySelector('#faqLeft');
               if (accordionWrapper) {
                   // Get the parent container (the .row with columns)
                   const row = accordionWrapper.closest('.row');
                   if (row) {
                       faqHtml = row.outerHTML;
                       row.remove();
                   } else {
                       faqHtml = accordionWrapper.outerHTML;
                       accordionWrapper.remove();
                   }
                   content = doc.body.innerHTML;
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
        setLoadedContent(content);

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

    if (!hidefeatureImage && !formData.featuredImage && !id) {
      setErrorMessage("Please select an image.");
      setLoading(false);

      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("page_type", formData.page_type || "main");
    data.append("content", editorContent);
    data.append("faq_content", generateFaqHTML());
    if (formData.featuredImage) {
      data.append("featuredImage", formData.featuredImage);
    }
    data.append("metaTitle", formData.metaTitle || "");
    data.append("metaDescription", formData.metaDescription || "");
    data.append("metaKeywords", formData.metaKeywords || "");
    data.append("schemaMarkup", formData.schemaMarkup || "");
    data.append("customHeadTags", formData.customHeadTags || "");

    try {
      const endpoint = id ? `website-trip/${id}` : "save-website-form";
      const formmethod = id ? "PUT" : "POST";

      const result = await api({
        method: formmethod,
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${endpoint}`,
        data: data
      });

      if (result?.data?.success) {
        const redirectPath = (formData.page_type === "landing") ? "/websiteForm/landing" : "/websiteForm/view";
        if (!formData.featuredImage) {
          setSuccessMessage("Form submitted and file uploaded successfully.");
          setErrorMessage("");
          setFormData({
            title: "",
            page_type: formData.page_type || "main",
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
            schemaMarkup: "",
            customHeadTags: "",
            featuredImage: null,
          });
          editor?.commands.setContent('');
          Router.push(redirectPath);

          return;
        }
        const newFileName = result?.data?.data.featuredImage;

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
            metaKeywords: "",
            schemaMarkup: "",
            customHeadTags: "",
          });
          editor?.commands.setContent('');
          if (fileInput.current) fileInput.current.value = "";
        } else {
          setErrorMessage("File upload error: " + uploadResult.message);
        }
      } else {
        setErrorMessage("Error saving form data: " + result?.data?.message);
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

        <button
          type="button"
          onClick={handleOpenEditAltForSelectedImage}
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
            {/* Page Type Field */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="page_type" style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}>
                Page Type <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                id="page_type"
                name="page_type"
                value={formData.page_type || "main"}
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
                <option value="main">Main Page (One Way Trip)</option>
                <option value="landing">Landing Page</option>
              </select>
            </div>

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
                    Configure search engine meta tags, structured schema markup, and custom head scripts for this trip page.
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
                  placeholder="e.g. chandigarh to delhi taxi, one way cab chandigarh to delhi, outstation taxi booking"
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
                  placeholder={`<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "TaxiService",\n  "name": "...",\n  "provider": "..."\n}\n</script>`}
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
                  Paste structured data script or raw JSON-LD for rich snippets (TaxiService, WebPage, FAQs, Breadcrumbs).
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
                  placeholder={`<meta name="robots" content="index, follow" />\n<link rel="canonical" href="https://bookfast.in/cab/chandigarh-to-delhi" />\n<meta property="og:type" content="website" />`}
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

            {/* Featured Image Field */}
            {!hidefeatureImage && (
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
            )}

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
                <div onDoubleClick={handleEditorDoubleClick}>
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

            {/* FAQ Section */}
            
            {/* Submit Button */}
            <button
              type="submit"
              style={{
                padding: "12px 30px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                margin: "40px 0",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                boxShadow: "0 4px 6px rgba(40, 167, 69, 0.2)",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Submit Form'}
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
          <div style={{ display: "flex", flexDirection: "column" }}>
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
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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

        <div style={{
          marginTop: "40px",
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e5e7eb"
        }}>
          {/* Section Header */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: "20px", 
            borderBottom: "1px solid #e5e7eb", 
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
                placeholder="e.g. Does BookFast offer one-way taxi service?"
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
                placeholder="e.g. Yes, BookFast offers affordable one-way outstation taxi services."
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

          {/* Added FAQs List */}
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
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
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
                      }}
                    >
                      {editingFaqIndex === index ? (
                        /* Inline Edit Mode */
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
                        /* Display Card Matching User Mockup */
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
                          {/* Top Row: "01 · FAQ Item" and Action Icons */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#111827", letterSpacing: "0.2px" }}>
                              {itemNumber} · FAQ Item
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {/* Edit Pencil Icon Button */}
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

                              {/* Delete Trash Icon Button (Red) */}
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
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </button>

                              {/* Drag Handle (Six Dots) */}
                              <div
                                draggable
                                onDragStart={(e) => {
                                  setDraggedFaqIndex(index);
                                  e.dataTransfer.effectAllowed = "move";
                                }}
                                onDragEnd={() => setDraggedFaqIndex(null)}
                                style={{ 
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "22px",
                                  height: "22px",
                                  color: "#9ca3af", 
                                  cursor: "grab", 
                                  borderRadius: "4px",
                                  userSelect: "none",
                                  transition: "color 0.15s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = "#4b5563"}
                                onMouseOut={(e) => e.currentTarget.style.color = "#9ca3af"}
                                title="Drag to reorder"
                              >
                                <svg width="13" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="8" cy="4" r="2.2"></circle>
                                  <circle cx="16" cy="4" r="2.2"></circle>
                                  <circle cx="8" cy="12" r="2.2"></circle>
                                  <circle cx="16" cy="12" r="2.2"></circle>
                                  <circle cx="8" cy="20" r="2.2"></circle>
                                  <circle cx="16" cy="20" r="2.2"></circle>
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Second Row: Question */}
                          <div style={{ fontWeight: "700", fontSize: "15px", color: "#111827", marginBottom: "8px", lineHeight: "1.4" }}>
                            Q: {faq.question}
                          </div>

                          {/* Third Row: Green "ANSWER" Label */}
                          <div style={{ fontSize: "11px", fontWeight: "800", color: "#16a34a", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "4px" }}>
                            ANSWER
                          </div>

                          {/* Fourth Row: Answer Content */}
                          <div 
                            style={{ fontSize: "13.5px", color: "#374151", lineHeight: "1.55", wordBreak: "break-word" }}
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

    </>
  );
};

export default PageForm;