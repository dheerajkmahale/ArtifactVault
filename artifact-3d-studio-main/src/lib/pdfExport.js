import { jsPDF } from 'jspdf';

/**
 * Converts an image URL to a base64 data URL via canvas/blob
 * @param {string} url 
 * @returns {Promise<string|null>}
 */
async function getBase64ImageFromUrl(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Could not fetch image for PDF embedding:', e.message);
    return null;
  }
}

/**
 * Generates an archival museum catalog card PDF for an artifact
 * @param {Object} artifact 
 */
export async function exportArtifactPDF(artifact) {
  if (!artifact) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Background subtle museum parchment tint
  doc.setFillColor(252, 251, 249);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer archival double-border
  doc.setDrawColor(212, 175, 55); // Antique Gold
  doc.setLineWidth(1.2);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - margin * 2 + 8);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - margin * 2 + 4);

  // Top Header Banner
  doc.setFillColor(18, 24, 38); // Dark Obsidian Navy
  doc.rect(margin, margin, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(245, 197, 66); // Gold text
  doc.text('ARTIFACTVAULT ARCHIVAL CATALOG CARD', margin + 6, margin + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 225, 235);
  doc.text('DIGITAL PRESERVATION REGISTRY  •  AI & CURATORIAL VERIFIED RECORD', margin + 6, margin + 17);

  // Status & Verification Stamp in Header Right
  const isVerified = !!artifact.curatorVerified;
  const stampText = isVerified ? 'CURATOR VERIFIED' : 'AI SUGGESTED';
  const stampBg = isVerified ? [16, 185, 129] : [245, 158, 11]; // Emerald or Amber

  doc.setFillColor(stampBg[0], stampBg[1], stampBg[2]);
  doc.roundedRect(pageWidth - margin - 46, margin + 6, 40, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(stampText, pageWidth - margin - 44, margin + 13.5);

  let currentY = margin + 33;

  // Title & Catalog ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 25, 35);
  const titleLines = doc.splitTextToSize(artifact.title || 'Untitled Artifact', contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7.5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 115, 130);
  const catalogId = artifact.id || artifact._id || 'AV-UNKNOWN';
  const dateStr = artifact.createdAt ? new Date(artifact.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString();
  doc.text(`CATALOG ID: ${catalogId}   |   DATE DIGITIZED: ${dateStr}`, margin, currentY);
  currentY += 6;

  // Decorative Golden Divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Classification Data Extraction
  const classification = artifact.classification || {};
  const category = classification.category || 'Archeological Relic';
  const era = classification.era || artifact.metadata?.estimatedEra || 'Classical Antiquity';
  const region = classification.region || artifact.metadata?.culturalOrigin || 'Unknown Origin';
  const material = classification.material || artifact.metadata?.material || 'Mixed Material';
  const condition = classification.condition || artifact.metadata?.condition || 'Archived Specimen';
  const confidence = classification.confidence || 94;
  const description = classification.description || artifact.description || 'Archived photogrammetric specimen preserved for historical research.';

  // Image & Quick Specs Side by Side
  const imgBoxWidth = 58;
  const imgBoxHeight = 58;
  const specsStartX = margin + imgBoxWidth + 8;
  const specsWidth = contentWidth - imgBoxWidth - 8;

  // Frame for Artifact Image
  doc.setDrawColor(200, 195, 185);
  doc.setLineWidth(0.5);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, currentY, imgBoxWidth, imgBoxHeight, 'FD');

  if (artifact.original_image_url) {
    try {
      const base64 = await getBase64ImageFromUrl(artifact.original_image_url);
      if (base64) {
        doc.addImage(base64, 'JPEG', margin + 1, currentY + 1, imgBoxWidth - 2, imgBoxHeight - 2);
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text('[Archival Photo]', margin + 15, currentY + 30);
      }
    } catch {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('[Archival Photo]', margin + 15, currentY + 30);
    }
  }

  // Specifications Table (Right side of image)
  const specs = [
    { label: 'Category', value: category },
    { label: 'Estimated Era', value: era },
    { label: 'Cultural Origin', value: region },
    { label: 'Primary Material', value: material },
    { label: 'Physical State', value: condition },
    { label: 'AI Confidence', value: `${confidence}% Match (Gemini Vision)` },
  ];

  let specY = currentY + 6;
  specs.forEach((spec) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 95, 105);
    doc.text(`${spec.label.toUpperCase()}:`, specsStartX, specY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(20, 25, 35);
    const valText = doc.splitTextToSize(spec.value, specsWidth - 36);
    doc.text(valText, specsStartX + 36, specY);

    specY += 8.5;
  });

  currentY += imgBoxHeight + 12;

  // Curatorial Analysis Section
  doc.setFillColor(242, 245, 250);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CURATORIAL ANALYSIS & PROVENANCE RECORD', margin + 4, currentY + 5);
  currentY += 12;

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(35, 40, 50);
  const descLines = doc.splitTextToSize(description, contentWidth);
  doc.text(descLines, margin, currentY, { lineHeightFactor: 1.35 });
  currentY += descLines.length * 6 + 10;

  // Preservation Notes / Classification Footnote
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(70, 75, 90);
  doc.text('ARCHIVAL VERIFICATION PROTOCOL:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 105, 120);
  const verificationNote = isVerified
    ? 'This record has undergone human curatorial review and confirmation. Curatorial attributes, era classification, and physical descriptions have been verified by an authorized vault specialist.'
    : 'This record was analyzed autonomously by Google Gemini 2.5 Flash Vision AI. Initial material and era classifications remain subject to museum specialist confirmation.';
  const noteLines = doc.splitTextToSize(verificationNote, contentWidth - 8);
  doc.text(noteLines, margin + 4, currentY + 11);

  // Bottom Footer
  const footerY = pageHeight - margin - 3;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 135, 145);
  doc.text('ARTIFACTVAULT ARCHIVE  •  3D SPATIAL PRESERVATION PLATFORM', margin, footerY);
  doc.text(`PAGE 1 OF 1  •  DOCUMENT ID: AV-DOC-${Date.now().toString(36).toUpperCase()}`, pageWidth - margin - 65, footerY);

  // Save PDF
  const cleanTitle = (artifact.title || 'artifact')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  doc.save(`${cleanTitle}-catalog-card.pdf`);
}
