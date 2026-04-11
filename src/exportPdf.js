import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Helper: load an image URL into a base64 string (needed for linked photos)
function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve(null); // skip if can't load
    img.src = url;
  });
}

// Helper: add a new page if content would overflow
function checkPageBreak(pdf, y, needed, margin, pageH) {
  if (y + needed > pageH - margin) {
    pdf.addPage();
    return margin;
  }
  return y;
}

export async function exportTripPdf(trip) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Fonts & colors ──────────────────────────────────────────────────────────
  const colorDark   = [61, 43, 26];
  const colorAccent = [200, 114, 42];
  const colorMid    = [122, 92, 60];
  const colorLight  = [154, 122, 90];

  // ── Cover photo ─────────────────────────────────────────────────────────────
  if (trip.coverPhoto) {
    let imgData = trip.coverPhoto;
    if (imgData.startsWith("http")) imgData = await loadImageAsBase64(imgData);
    if (imgData) {
      try {
        pdf.addImage(imgData, "JPEG", margin, y, contentW, 55, undefined, "FAST");
        y += 57;
      } catch { /* skip if image fails */ }
    }
  }

  // ── Title ───────────────────────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...colorDark);
  pdf.text(trip.title || "Untitled Trip", margin, y);
  y += 9;

  // ── Location ────────────────────────────────────────────────────────────────
  const loc = trip.multiCountry && trip.countryList
    ? trip.countryList.filter(c => c.country).map(c => [c.cities, c.country].filter(Boolean).join(", ")).join("  ·  ")
    : [trip.city, trip.country].filter(Boolean).join(", ");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(...colorAccent);
  pdf.text("📍 " + (loc || "—"), margin, y);
  y += 7;

  // ── Meta chips ──────────────────────────────────────────────────────────────
  const chips = [
    trip.startDate && `📅 ${trip.startDate}`,
    trip.days && `🗓 ${trip.days} days`,
    trip.season && trip.season !== "N/A (Tropical)" && trip.season,
    trip.companions && `👥 ${trip.companions}`,
    trip.budget && `💰 ${trip.budget}`,
    trip.goAgain && `Go again? ${trip.goAgain}`,
  ].filter(Boolean);

  if (chips.length) {
    pdf.setFontSize(9);
    pdf.setTextColor(...colorMid);
    pdf.text(chips.join("   "), margin, y);
    y += 6;
  }

  // ── Highlights ──────────────────────────────────────────────────────────────
  if (trip.highlights) {
    y = checkPageBreak(pdf, y, 12, margin, pageH);
    pdf.setDrawColor(240, 221, 184);
    pdf.setFillColor(254, 249, 240);
    pdf.roundedRect(margin, y, contentW, 10, 2, 2, "FD");
    pdf.setFontSize(10);
    pdf.setTextColor(...colorDark);
    pdf.text("✨ " + trip.highlights, margin + 3, y + 6.5);
    y += 14;
  }

  // ── Divider ─────────────────────────────────────────────────────────────────
  pdf.setDrawColor(...colorAccent);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Day by Day ──────────────────────────────────────────────────────────────
  for (const day of trip.tripDays) {
    if (!day.activities && !day.feelings && !day.tags?.length && !day.photos?.length) continue;

    y = checkPageBreak(pdf, y, 14, margin, pageH);

    // Day header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...colorAccent);
    pdf.text(`Day ${day.dayNum}`, margin, y);
    y += 6;

    // Tags
    if (day.tags?.length) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...colorMid);
      pdf.text(day.tags.join("  "), margin, y);
      y += 5;
    }

    // Activities
    if (day.activities) {
      y = checkPageBreak(pdf, y, 8, margin, pageH);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...colorDark);
      pdf.text("Activities:", margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colorMid);
      const lines = pdf.splitTextToSize(day.activities, contentW - 22);
      pdf.text(lines, margin + 22, y);
      y += lines.length * 4.5 + 2;
    }

    // Note
    if (day.feelings) {
      y = checkPageBreak(pdf, y, 8, margin, pageH);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...colorDark);
      pdf.text("Note:", margin, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...colorMid);
      const lines = pdf.splitTextToSize(day.feelings, contentW - 14);
      pdf.text(lines, margin + 14, y);
      y += lines.length * 4.5 + 2;
    }

    // Photos — up to 3 per row
    if (day.photos?.length) {
      const photoW = (contentW - 6) / 3;
      const photoH = photoW * 0.65;
      y = checkPageBreak(pdf, y, photoH + 8, margin, pageH);
      let px = margin;
      let rowH = 0;
      for (let i = 0; i < day.photos.length; i++) {
        const photo = day.photos[i];
        let imgData = photo.data;
        if (imgData?.startsWith("http")) imgData = await loadImageAsBase64(imgData);
        if (imgData) {
          try {
            pdf.addImage(imgData, "JPEG", px, y, photoW, photoH, undefined, "FAST");
            // caption
            if (photo.caption) {
              pdf.setFontSize(7);
              pdf.setTextColor(...colorLight);
              pdf.text(photo.caption, px, y + photoH + 3, { maxWidth: photoW });
            }
            rowH = photoH + (photo.caption ? 5 : 2);
          } catch { /* skip */ }
        }
        px += photoW + 3;
        if ((i + 1) % 3 === 0) { y += rowH + 2; px = margin; rowH = 0; }
      }
      if (day.photos.length % 3 !== 0) y += rowH + 2;
    }

    // Day divider
    pdf.setDrawColor(224, 212, 188);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y + 1, pageW - margin, y + 1);
    y += 6;
  }

  // ── Reflections ─────────────────────────────────────────────────────────────
  if (trip.reflection || trip.rating > 0) {
    y = checkPageBreak(pdf, y, 20, margin, pageH);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...colorAccent);
    pdf.text("Reflection", margin, y);
    y += 6;

    if (trip.rating > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(232, 168, 56);
      pdf.text("★".repeat(trip.rating) + "☆".repeat(5 - trip.rating), margin, y);
      y += 7;
    }

    if (trip.reflection) {
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(...colorMid);
      const lines = pdf.splitTextToSize(trip.reflection, contentW);
      y = checkPageBreak(pdf, y, lines.length * 5, margin, pageH);
      pdf.text(lines, margin, y);
      y += lines.length * 5 + 4;
    }
  }

  // ── Footer on every page ─────────────────────────────────────────────────────
  const totalPages = pdf.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...colorLight);
    pdf.text("My Holiday Journal", margin, pageH - 8);
    pdf.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 8, { align: "right" });
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const filename = `${(trip.title || "trip").replace(/[^a-z0-9]/gi, "_")}_${trip.startDate || "export"}.pdf`;
  pdf.save(filename);
}