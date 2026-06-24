import emailjs from '@emailjs/browser';

// ============================================================
// EmailJS Configuration - Uses environment variables
// Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in .env
// ============================================================
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY; 

export const ORDER_EMAIL = 'bradley@hsss.net.au';

// ============================================================
// Helper: Format ISO date to friendly "13 Feb 2026"
// ============================================================
function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ============================================================
// Color constants
// ============================================================
const C = {
  navy: '#003A70', cyan: '#00AEEF', bg: '#F4F7FA', white: '#FFFFFF',
  label: '#5A7D9E', text: '#333333', border: '#D0D9E3',
  amber: '#F59E0B', amberBg: '#FFF8E1', amberBorder: '#FFE082',
};

// SVG diagram color constants
const D = {
  bg: '#001B3D', wall: '#64748B', glassThin: 'rgba(0,174,239,0.55)',
  glass: 'rgba(0,174,239,0.12)', glassBorder: 'rgba(0,174,239,0.4)',
  door: 'rgba(0,174,239,0.35)', doorBorder: '#00AEEF',
  hinge: '#00AEEF', dim: '#F59E0B', dimDash: '6,4',
  label: '#5A7D9E', faded: 'rgba(0,174,239,0.08)',
  arcStroke: 'rgba(0,174,239,0.3)', arcDash: '8,6',
  walkBorder: 'rgba(100,116,139,0.5)', walkDash: '5,4',
};

// ============================================================
// SVG Diagram Generators (return SVG markup strings)
// ============================================================

function svgDimLine(x1, y1, x2, y2, label, offset = 0, vertical = false, fontSize = 11) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  let caps = '';
  if (vertical) {
    caps = `<line x1="${x1-4}" y1="${y1}" x2="${x1+4}" y2="${y1}" stroke="${D.dim}" stroke-width="1.5"/>` +
           `<line x1="${x2-4}" y1="${y2}" x2="${x2+4}" y2="${y2}" stroke="${D.dim}" stroke-width="1.5"/>`;
  } else {
    caps = `<line x1="${x1}" y1="${y1-4}" x2="${x1}" y2="${y1+4}" stroke="${D.dim}" stroke-width="1.5"/>` +
           `<line x1="${x2}" y1="${y2-4}" x2="${x2}" y2="${y2+4}" stroke="${D.dim}" stroke-width="1.5"/>`;
  }
  let txt = '';
  if (vertical) {
    txt = `<text x="${mx+offset}" y="${my}" text-anchor="middle" dominant-baseline="middle" fill="${D.dim}" font-size="${fontSize}" font-weight="700" font-family="Arial" transform="rotate(-90,${mx+offset},${my})">${label}</text>`;
  } else {
    txt = `<text x="${mx}" y="${my+offset}" text-anchor="middle" dominant-baseline="middle" fill="${D.dim}" font-size="${fontSize}" font-weight="700" font-family="Arial">${label}</text>`;
  }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${D.dim}" stroke-width="1.2" stroke-dasharray="${D.dimDash}"/>${caps}${txt}`;
}

function svgHinge(cx, cy, r = 6) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${D.hinge}" stroke="#fff" stroke-width="1.5"/>`;
}

function svgBracket(x, y, s = 10) {
  return `<rect x="${x-s/2}" y="${y-s/2}" width="${s}" height="${s}" fill="none" stroke="${D.wall}" stroke-width="1.5"/>`;
}

// --- FRONT & RETURN ---
function svgFrontReturn(front = 900, ret = 900, fixed = 238, door = 662, isLH = true) {
  const W = 300, H = 290, topY = 55, botY = 240, leftX = 65, rightX = 255;
  const innerH = botY - topY, innerW = rightX - leftX, wallT = 8;
  const fixedW = innerW * (fixed / front), doorW = innerW * (door / front);
  const arcR = Math.min(innerH, innerW) * 0.72;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="300">
    <rect width="${W}" height="${H}" rx="8" fill="${D.bg}"/>
    <text x="${rightX-30}" y="${topY+innerH*0.4}" text-anchor="middle" fill="${D.faded}" font-size="48" font-weight="800" font-family="Arial">${isLH?'LH':'RH'}</text>
    <rect x="${leftX-4}" y="${topY-wallT/2}" width="${innerW+wallT+8}" height="${wallT}" rx="3" fill="${D.wall}"/>
    <rect x="${rightX}" y="${topY-wallT/2}" width="${wallT}" height="${innerH+wallT}" rx="3" fill="${D.wall}"/>
    ${svgBracket(rightX+wallT/2, topY)}
    <rect x="${leftX}" y="${topY}" width="4" height="${innerH}" fill="${D.glassThin}" rx="1"/>
    <text x="${leftX+14}" y="${topY+innerH/2}" text-anchor="middle" dominant-baseline="middle" fill="${D.label}" font-size="10" font-family="Arial" font-weight="500" transform="rotate(-90,${leftX+14},${topY+innerH/2})">Return</text>
    <rect x="${rightX-fixedW}" y="${botY-3}" width="${fixedW}" height="14" fill="${D.glass}" stroke="${D.glassBorder}" stroke-width="1.5" rx="2"/>
    <text x="${rightX-fixedW/2}" y="${botY+4}" text-anchor="middle" dominant-baseline="middle" fill="${D.label}" font-size="9" font-family="Arial">Fixed</text>
    <rect x="${leftX}" y="${botY-4}" width="${doorW}" height="16" fill="${D.door}" stroke="${D.doorBorder}" stroke-width="2" rx="3"/>
    <text x="${leftX+doorW/2}" y="${botY+4}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="10" font-family="Arial" font-weight="700">Door</text>
    <path d="M ${leftX+arcR} ${botY} A ${arcR} ${arcR} 0 0 0 ${leftX} ${botY-arcR}" fill="none" stroke="${D.arcStroke}" stroke-width="1.5" stroke-dasharray="${D.arcDash}"/>
    ${svgHinge(leftX, botY)}
    ${svgDimLine(leftX, H-15, rightX, H-15, front+'mm', 14)}
    ${svgDimLine(leftX-18, topY, leftX-18, botY, ret+'mm', -16, true)}
  </svg>`;
}

// --- FRONT ONLY ---
function svgFrontOnly(w2w = 1200, door = 662, leftPanel = 200, rightPanel = 200, hingeSide = 'LHS') {
  const W = 300, H = 180, wallH = 100, leftX = 50, rightX = 250, wallT = 8;
  const innerW = rightX - leftX, midY = H / 2 + 5;
  const doorPixW = innerW * (door / w2w), leftPixW = innerW * (leftPanel / w2w);
  const rightPixW = innerW - doorPixW - leftPixW;
  const doorStartX = leftX + leftPixW, rightStartX = doorStartX + doorPixW;
  const hingeX = hingeSide === 'LHS' ? doorStartX : rightStartX;
  const arcR = wallH * 0.55;
  const isLH = hingeSide === 'LHS';
  const arcPath = isLH
    ? `M ${hingeX+arcR} ${midY} A ${arcR} ${arcR} 0 0 0 ${hingeX} ${midY-arcR}`
    : `M ${hingeX-arcR} ${midY} A ${arcR} ${arcR} 0 0 1 ${hingeX} ${midY-arcR}`;
  let leftPanelSvg = '';
  if (leftPanel > 0) {
    leftPanelSvg = `<rect x="${leftX+2}" y="${midY-5}" width="${leftPixW-4}" height="12" fill="${D.glass}" stroke="${D.glassBorder}" stroke-width="1.2" rx="2"/>` +
      `<text x="${leftX+leftPixW/2}" y="${midY+1}" text-anchor="middle" dominant-baseline="middle" fill="${D.label}" font-size="8" font-family="Arial">${leftPanel}mm</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="300">
    <rect width="${W}" height="${H}" rx="8" fill="${D.bg}"/>
    <text x="${W/2}" y="${midY-28}" text-anchor="middle" fill="${D.faded}" font-size="36" font-weight="800" font-family="Arial">${isLH?'LH':'RH'}</text>
    <rect x="${leftX-wallT/2}" y="${midY-wallH/2}" width="${wallT}" height="${wallH}" rx="3" fill="${D.wall}"/>
    <rect x="${rightX-wallT/2}" y="${midY-wallH/2}" width="${wallT}" height="${wallH}" rx="3" fill="${D.wall}"/>
    <rect x="${doorStartX}" y="${midY-6}" width="${doorPixW}" height="14" fill="${D.door}" stroke="${D.doorBorder}" stroke-width="2" rx="3"/>
    <text x="${doorStartX+doorPixW/2}" y="${midY+1}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="9" font-family="Arial" font-weight="700">Door ${door}mm</text>
    <rect x="${rightStartX+2}" y="${midY-5}" width="${rightPixW-4}" height="12" fill="${D.glass}" stroke="${D.glassBorder}" stroke-width="1.2" rx="2"/>
    <text x="${rightStartX+rightPixW/2}" y="${midY+1}" text-anchor="middle" dominant-baseline="middle" fill="${D.label}" font-size="8" font-family="Arial">${rightPanel}mm</text>
    ${leftPanelSvg}
    <path d="${arcPath}" fill="none" stroke="${D.arcStroke}" stroke-width="1.5" stroke-dasharray="${D.arcDash}"/>
    ${svgHinge(hingeX, midY, 5)}
    ${svgDimLine(leftX, H-12, rightX, H-12, w2w+'mm', -12)}
  </svg>`;
}

// --- SPLAYED ---
function svgSplayed(wallA = 900, wallB = 1100, legA = 625, legB = 425, door = 662) {
  const W = 300, H = 300, wallT = 8;
  const wallTopLeftX = 88, wallTopY = 52, wallRightX = 245, wallBotY = 252;
  const upperStart = { x: wallTopLeftX, y: wallTopY + wallT/2 + 2 };
  const hingeP = { x: 48, y: 215 };
  const doorEndP = { x: 172, y: 242 };
  const lowerEnd = { x: wallRightX - 2, y: wallBotY - 2 };
  const upperDx = hingeP.x - upperStart.x, upperDy = hingeP.y - upperStart.y;
  const upperAngle = Math.atan2(upperDy, upperDx) * 180 / Math.PI;
  const doorDx = doorEndP.x - hingeP.x, doorDy = doorEndP.y - hingeP.y;
  const doorAngle = Math.atan2(doorDy, doorDx) * 180 / Math.PI;
  const upperMid = { x: (upperStart.x+hingeP.x)/2, y: (upperStart.y+hingeP.y)/2 };
  const doorMid = { x: (hingeP.x+doorEndP.x)/2, y: (hingeP.y+doorEndP.y)/2 };
  const lowerMid = { x: (doorEndP.x+lowerEnd.x)/2, y: (doorEndP.y+lowerEnd.y)/2 };
  const arcR = 110;
  const doorAngleRad = Math.atan2(doorDy, doorDx);
  const upperToHingeRad = Math.atan2(upperStart.y-hingeP.y, upperStart.x-hingeP.x);
  const arcX1 = hingeP.x + arcR*Math.cos(doorAngleRad);
  const arcY1 = hingeP.y + arcR*Math.sin(doorAngleRad);
  const arcX2 = hingeP.x + arcR*Math.cos(upperToHingeRad);
  const arcY2 = hingeP.y + arcR*Math.sin(upperToHingeRad);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="300">
    <rect width="${W}" height="${H}" rx="8" fill="${D.bg}"/>
    <rect x="${wallTopLeftX-4}" y="${wallTopY-wallT/2}" width="${wallRightX-wallTopLeftX+wallT+4}" height="${wallT}" rx="3" fill="${D.wall}"/>
    <rect x="${wallRightX}" y="${wallTopY-wallT/2}" width="${wallT}" height="${wallBotY-wallTopY+wallT}" rx="3" fill="${D.wall}"/>
    ${svgBracket(wallRightX+wallT/2, wallTopY)}
    <line x1="${upperStart.x}" y1="${upperStart.y}" x2="${hingeP.x+3}" y2="${hingeP.y-5}" stroke="${D.glassThin}" stroke-width="3.5" stroke-linecap="round"/>
    <text x="${upperMid.x-16}" y="${upperMid.y}" text-anchor="middle" dominant-baseline="middle" fill="${D.label}" font-size="10" font-family="Arial" font-weight="600" transform="rotate(${upperAngle},${upperMid.x-16},${upperMid.y})">${legA}mm</text>
    <line x1="${hingeP.x+6}" y1="${hingeP.y+1}" x2="${doorEndP.x-2}" y2="${doorEndP.y-1}" stroke="${D.doorBorder}" stroke-width="15" stroke-linecap="round"/>
    <line x1="${hingeP.x+6}" y1="${hingeP.y+1}" x2="${doorEndP.x-2}" y2="${doorEndP.y-1}" stroke="${D.door}" stroke-width="12" stroke-linecap="round"/>
    <text x="${doorMid.x}" y="${doorMid.y-1}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="9" font-family="Arial" font-weight="700" transform="rotate(${doorAngle},${doorMid.x},${doorMid.y-1})">Door ${door}mm</text>
    <rect x="${doorEndP.x+2}" y="${doorEndP.y-6}" width="${lowerEnd.x-doorEndP.x-4}" height="14" fill="${D.glass}" stroke="${D.glassBorder}" stroke-width="1.5" rx="2"/>
    <text x="${lowerMid.x}" y="${lowerMid.y+14}" text-anchor="middle" dominant-baseline="middle" fill="${D.label}" font-size="10" font-family="Arial" font-weight="600">${legB}mm</text>
    <path d="M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 0 0 ${arcX2} ${arcY2}" fill="none" stroke="${D.arcStroke}" stroke-width="1.5" stroke-dasharray="${D.arcDash}"/>
    ${svgHinge(hingeP.x, hingeP.y)}
    ${svgDimLine(wallTopLeftX, wallTopY-22, wallRightX, wallTopY-22, wallA+'mm', -13)}
    ${svgDimLine(wallRightX+22, wallTopY, wallRightX+22, wallBotY, wallB+'mm', 18, true)}
  </svg>`;
}

// --- FIXED PANEL ---
function svgFixedPanel(w2w = 1200, panelMM = 500, subType = 'RH') {
  const W = 300, H = 180, wallH = 90, leftX = 50, rightX = 250, wallT = 8;
  const innerW = rightX - leftX, midY = H / 2 + 8;
  const isRH = subType === 'RH' || subType === 'Fixed Panel RH';
  const panelPixW = innerW * (panelMM / w2w), walkPixW = innerW - panelPixW;
  const panelStartX = isRH ? rightX - panelPixW : leftX;
  const walkStartX = isRH ? leftX : leftX + panelPixW;
  const dividerX = isRH ? panelStartX : panelStartX + panelPixW;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="300">
    <rect width="${W}" height="${H}" rx="8" fill="${D.bg}"/>
    <text x="${W/2}" y="${midY-24}" text-anchor="middle" fill="${D.faded}" font-size="36" font-weight="800" font-family="Arial">${isRH?'RH':'LH'}</text>
    <rect x="${leftX-wallT/2}" y="${midY-wallH/2}" width="${wallT}" height="${wallH}" rx="3" fill="${D.wall}"/>
    <rect x="${rightX-wallT/2}" y="${midY-wallH/2}" width="${wallT}" height="${wallH}" rx="3" fill="${D.wall}"/>
    <rect x="${walkStartX+2}" y="${midY-8}" width="${walkPixW-4}" height="18" fill="none" stroke="${D.walkBorder}" stroke-width="1.5" stroke-dasharray="${D.walkDash}" rx="3"/>
    <text x="${walkStartX+walkPixW/2}" y="${midY+1}" text-anchor="middle" dominant-baseline="middle" fill="${D.label}" font-size="10" font-family="Arial" font-weight="500">Walk</text>
    <rect x="${panelStartX+2}" y="${midY-7}" width="${panelPixW-4}" height="16" fill="${D.door}" stroke="${D.doorBorder}" stroke-width="1.5" rx="3"/>
    <text x="${panelStartX+panelPixW/2}" y="${midY+1}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="10" font-family="Arial" font-weight="600">Fixed</text>
    <line x1="${dividerX}" y1="${midY-wallH/2+15}" x2="${dividerX}" y2="${midY+wallH/2-15}" stroke="${D.glassBorder}" stroke-width="1" stroke-dasharray="4,3"/>
    ${svgDimLine(panelStartX+2, midY-28, panelStartX+panelPixW-2, midY-28, panelMM+'mm', -12, false, 10)}
    ${svgDimLine(leftX, H-10, rightX, H-10, w2w+'mm (wall to wall)', -12)}
  </svg>`;
}

// ============================================================
// SVG to Base64 PNG converter (renders in hidden canvas)
// ============================================================
async function svgToBase64Png(svgString, width = 200) {
  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(width * ratio);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(''); // Return empty on error - email will skip the diagram
    };

    img.src = url;
  });
}

// ============================================================
// Generate diagram for a screen config
// ============================================================
function generateSvgForScreen(s) {
  if (s.type === 'Front & Return') {
    return svgFrontReturn(s.frontMM, s.returnMM, s.fixedMM || 238, s.doorMM || 662, s.isLH !== false);
  }
  if (s.type === 'Front Only') {
    return svgFrontOnly(s.w2wMM, s.doorMM || 662, s.leftPanelMM || 0, s.rightPanelMM || 0, s.hingeSide || 'LHS');
  }
  if (s.type === 'Splayed') {
    return svgSplayed(s.wallA || 900, s.wallB || 1100, s.legA || 625, s.legB || 425, s.doorMM || 662);
  }
  if (s.type === 'Fixed Panel') {
    return svgFixedPanel(s.wallToWallMM, s.panelMM || 500, s.subType || 'RH');
  }
  return '';
}

// ============================================================
// Build HTML email body
// ============================================================
async function buildHtmlEmail(quoteData, screens, customerType, locationLabels, user, builderProfile) {
  const bp = builderProfile || {};
  const isSupplyInstall = customerType === 'Supply & Install';
  const jobRef = quoteData.jobRef || 'ORDER';
  const screenCount = screens.length;

  // Calculate totals - handle price as object {exGst,incGst} or plain number
  let totalExGst = 0;
  let hasCustom = false;
  screens.forEach(s => {
    if (s.price) {
      const ex = typeof s.price === 'object' ? s.price.exGst : Number(s.price);
      totalExGst += Number(ex) || 0;
    }
    if (s.isCustom) hasCustom = true;
  });
  const totalIncGst = totalExGst * 1.1;
  const fmtPrice = (v) => '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Generate diagram PNGs
  const diagramImages = [];
  for (const s of screens) {
    const svg = generateSvgForScreen(s);
    if (svg) {
      const png = await svgToBase64Png(svg);
      diagramImages.push(png);
    } else {
      diagramImages.push('');
    }
  }

  // HTML row helper
  const row = (label, value) => `<tr><td style="padding:3px 0;font-size:13px;color:${C.label};width:130px;vertical-align:top">${label}:</td><td style="padding:3px 0;font-size:13px;color:${C.text};font-weight:500">${value}</td></tr>`;
  const specRow = (label, value, bold) => `<tr><td style="padding:4px 10px;font-size:12px;color:${C.label};font-weight:600;width:120px;vertical-align:top">${label}</td><td style="padding:4px 10px;font-size:12px;color:${C.text};font-weight:${bold?700:400}">${value}</td></tr>`;
  const sectionHead = (text) => `<tr><td colspan="2" style="padding:0 0 8px"><div style="font-size:13px;font-weight:700;color:${C.cyan};text-transform:uppercase;letter-spacing:1px">${text}</div></td></tr>`;

  // Build screen sections
  let screenHtml = '';
  screens.forEach((s, i) => {
    const label = locationLabels && locationLabels[i] ? ` - ${locationLabels[i]}` : '';

    // Handle price as object or number
    let exGst = 0;
    if (s.price) {
      exGst = typeof s.price === 'object' ? Number(s.price.exGst) : Number(s.price);
    }
    const incGst = exGst * 1.1;
    const priceStr = exGst > 0
      ? `${fmtPrice(exGst)} ex GST  (${fmtPrice(incGst)} inc GST)`
      : 'TBC (custom panel)';

    // Diagram image
    let diagramHtml = '';
    if (diagramImages[i]) {
      diagramHtml = `<tr><td colspan="2" style="padding:8px 0"><img src="${diagramImages[i]}" width="300" style="max-width:100%;height:auto;display:block" alt="${s.type} diagram"/></td></tr>`;
    }

    // Approximate measurements warning
    let approxHtml = '';
    if (s.approxOnly) {
      approxHtml = `<tr><td colspan="2" style="padding:6px 10px">
        <div style="background:${C.amberBg};border:1px solid ${C.amberBorder};border-radius:6px;padding:8px 12px">
          <div style="font-size:12px;font-weight:700;color:#E65100">&#9888; Approximate Measurements</div>
          <div style="font-size:11px;color:#BF360C;margin-top:2px">Not an exact sheet-to-sheet size - Availability date: <strong>${fmtDate(s.approxDate || '')}</strong></div>
        </div>
      </td></tr>`;
    }

    // Screen-type-specific specs
    let specs = '';
    specs += specRow('Type', s.summary || s.type + (s.subType ? ` (${s.subType})` : '') + (s.isCustom ? ' - CUSTOM' : ''));
    specs += specRow('Colour', s.colour);
    specs += specRow('Waterstop', s.waterstop + 'mm');

    if (s.type === 'Front & Return') {
      specs += specRow('Front', s.frontMM + 'mm');
      specs += specRow('Return', s.returnMM + 'mm');
      specs += specRow('Config', s.isLH ? 'LH Return' : 'RH Return');
    } else if (s.type === 'Front Only') {
      specs += specRow('Wall to Wall', s.w2wMM + 'mm');
      if (s.leftPanelMM || s.rightPanelMM) {
        specs += specRow('Panels', `Left: ${s.leftPanelMM||0}mm, Right: ${s.rightPanelMM||0}mm`);
      }
    } else if (s.type === 'Splayed') {
      specs += specRow('Size', `${s.wallA||900} x ${s.wallB||1100}mm`);
      specs += specRow('Legs', `${s.legA||625}mm / ${s.legB||425}mm`);
    } else if (s.type === 'Fixed Panel') {
      specs += specRow('Sub-type', s.subType || 'RH');
      specs += specRow('Panel', (s.panelMM||500) + 'mm');
      specs += specRow('Wall to Wall', s.wallToWallMM + 'mm');
    }

    if (s.doorMM && s.type !== 'Fixed Panel') {
      if (s.isSliding) {
        specs += specRow('Door', 'Sliding');
      } else {
        specs += specRow('Door', `${s.doorMM}mm hinged (${s.hingeSide || 'LHS'})`);
      }
    }

    if (s.isCustom) {
      specs += specRow('Custom', `Measure date: ${fmtDate(s.measureDate) || 'TBC'}`);
    }

    specs += approxHtml;
    specs += specRow('Price', priceStr, true);

    screenHtml += `
    <tr><td style="padding:0 28px 20px">
      <div style="border-top:2px solid ${C.cyan};margin:0 0 16px"></div>
      <table cellpadding="0" cellspacing="0" width="100%"><tbody>
        <tr><td colspan="2" style="padding:0 0 8px"><div style="font-size:13px;font-weight:700;color:${C.cyan};text-transform:uppercase;letter-spacing:1px">Screen ${i+1} of ${screenCount}${label}</div></td></tr>
        ${diagramHtml}
        <tr><td colspan="2" style="padding:8px 0 0"><table cellpadding="0" cellspacing="0" width="100%"><tbody>${specs}</tbody></table></td></tr>
      </tbody></table>
    </td></tr>`;
  });

  // Submitted timestamp
  const now = new Date();
  const submitted = `${now.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()]} ${now.getFullYear()}, ${now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}`;

  // Full HTML email
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:${C.bg};font-family:Arial,Helvetica,sans-serif">
  <table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.white};border-radius:8px;overflow:hidden;margin:20px auto">
    <tbody>
      <tr><td style="background:${C.navy};padding:20px 28px">
        <table cellpadding="0" cellspacing="0" width="100%"><tbody><tr>
          <td style="font-size:22px;font-weight:700;color:#fff">HSSS</td>
          <td style="text-align:right;font-size:11px;color:${C.cyan};font-weight:600">NEW ORDER</td>
        </tr></tbody></table>
      </td></tr>
      <tr><td style="background:${C.cyan};padding:10px 28px">
        <table cellpadding="0" cellspacing="0" width="100%"><tbody><tr>
          <td style="font-size:15px;font-weight:700;color:${C.navy}">${jobRef}</td>
          <td style="text-align:right;font-size:12px;color:${C.navy};font-weight:500">${screenCount} screen${screenCount>1?'s':''} &bull; ${customerType}</td>
        </tr></tbody></table>
      </td></tr>
      <tr><td style="padding:24px 28px">
        <table cellpadding="0" cellspacing="0" width="100%"><tbody>
          ${sectionHead('Ordered By')}
          ${row('Company', bp.company_name || 'Not set')}
          ${row('Contact', bp.contact_name || user?.email || 'Unknown')}
          ${row('Email', bp.contact_email || user?.email || '')}
          ${row('Phone', bp.mobile || bp.contact_phone || '')}
          ${bp.abn ? row('ABN', bp.abn) : ''}
          ${row('Service', customerType)}
        </tbody></table>
        <div style="border-top:2px solid ${C.cyan};margin:20px 0 16px"></div>
        <table cellpadding="0" cellspacing="0" width="100%"><tbody>
          ${sectionHead('Job Details')}
          ${row('Job Ref', jobRef)}
          ${row('Job Address', `${quoteData.deliveryAddress || ''}, ${quoteData.deliverySuburb || ''} ${quoteData.deliveryState || ''}`)}
          ${quoteData.siteContact?.name ? row('Site Contact', `${quoteData.siteContact.name} - ${quoteData.siteContact.phone}`) : ''}
          ${isSupplyInstall
            ? row('Hob Delivery', fmtDate(quoteData.hobDate)) + row('Glass Install', fmtDate(quoteData.glassDate))
            : row('Delivery Date', fmtDate(quoteData.deliveryDate))}
          ${row('Submitted', submitted)}
          ${quoteData.notes ? row('Notes', quoteData.notes) : ''}
        </tbody></table>
      </td></tr>

      ${screenHtml}

      <tr><td style="padding:0 28px"><div style="border-top:3px solid ${C.navy}"></div></td></tr>
      <tr><td style="padding:16px 28px;background:${C.bg}">
        <table cellpadding="0" cellspacing="0" width="100%"><tbody><tr>
          <td style="font-size:14px;font-weight:700;color:${C.navy}">ORDER TOTAL</td>
          <td style="text-align:right">
            <span style="font-size:18px;font-weight:700;color:${C.navy}">${fmtPrice(totalExGst)}</span>
            <span style="font-size:12px;color:${C.label}"> ex GST</span><br/>
            <span style="font-size:12px;color:${C.label}">${fmtPrice(totalIncGst)} inc GST</span>
          </td>
        </tr>
        ${hasCustom ? `<tr><td colspan="2" style="font-size:11px;color:#c33;padding-top:6px;">+ Custom screens require measure - pricing TBC</td></tr>` : ''}
        </tbody></table>
      </td></tr>
      <tr><td style="padding:16px 28px;background:${C.navy};text-align:center">
        <div style="font-size:11px;color:${C.label}">Sent from HSSS Builder App &bull; ${submitted}</div>
      </td></tr>
    </tbody>
  </table>
  </body></html>`;
}

// ============================================================
// Public API - same signatures as the original
// ============================================================

/**
 * Send an order email via EmailJS - HTML with diagrams
 */
export async function sendOrderEmail(quoteData, screens, customerType, labels, user, builderProfile) {
  try {
    const bp = builderProfile || {};
    let htmlBody;
    try {
      htmlBody = await buildHtmlEmail(quoteData, screens, customerType, labels, user, builderProfile);
      console.log('Email HTML built OK, length:', htmlBody.length);
    } catch (buildErr) {
      console.error('STEP 1 FAILED - buildHtmlEmail error:', buildErr);
      return { success: false, error: 'HTML build failed: ' + (buildErr.message || buildErr) };
    }

    const companyName = bp.company_name || 'Unknown';
    const contactName = bp.contact_name || user?.email || 'Unknown';

    const templateParams = {
      to_email: ORDER_EMAIL,
      subject: `New Builder Order - ${quoteData.jobRef || 'ORDER'} (${contactName} - ${customerType})`,
      job_ref: quoteData.jobRef || 'No ref',
      builder_name: contactName,
      builder_company: companyName,
      builder_email: bp.contact_email || user?.email || '',
      builder_phone: bp.mobile || bp.contact_phone || '',
      customer_type: customerType,
      delivery_address: `${quoteData.deliveryAddress || ''}, ${quoteData.deliverySuburb || ''} ${quoteData.deliveryState || ''}`,
      site_contact: quoteData.siteContact?.name ? `${quoteData.siteContact.name} - ${quoteData.siteContact.phone}` : 'Not specified',
      delivery_dates: customerType === 'Supply & Install'
        ? `Hob: ${fmtDate(quoteData.hobDate)}, Glass: ${fmtDate(quoteData.glassDate)}`
        : `Delivery: ${fmtDate(quoteData.deliveryDate)}`,
      notes: quoteData.notes || 'None',
      screen_count: screens.length.toString(),
      message: htmlBody,
    };

    const payloadSize = JSON.stringify(templateParams).length;
    console.log('Email payload size:', payloadSize, 'bytes (' + Math.round(payloadSize/1024) + 'KB)');
    console.log('Config check - Service:', EMAILJS_SERVICE_ID ? 'SET' : 'MISSING', 'Template:', EMAILJS_TEMPLATE_ID ? 'SET' : 'MISSING', 'Key:', EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING');
      // Safety: strip diagrams if payload exceeds EmailJS 50KB limit
      if (payloadSize > 48000) {
        console.warn('Payload too large (' + payloadSize + 'b), stripping diagrams');
        templateParams.message = templateParams.message.replace(/<img[^>]*alt="[^"]*diagram"[^>]*\/>/gi, '');
        console.log('Stripped payload size:', JSON.stringify(templateParams).length);
      }
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log('Order email sent:', result.status);
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    console.error('Error type:', typeof error, 'Status:', error?.status, 'Text:', error?.text, 'Message:', error?.message);
    return { success: false, error: error.text || error.message || 'Failed to send email' };
  }
}

/**
 * Send a custom order email via EmailJS
 */
export async function sendCustomOrderEmail(data) {
  const line = '-'.repeat(40);
  let body = '';
  body += `CUSTOM ORDER REQUEST\n`;
  body += `${line}\n\n`;
  body += `JOB ADDRESS\n`;
  body += `${data.address}\n`;
  body += `${data.suburb}, ${data.state}\n\n`;
  body += `DESCRIPTION\n${data.details}\n\n`;
  if (data.contactName) {
    body += `SITE CONTACT\n`;
    body += `${data.contactName} - ${data.contactPhone}\n\n`;
  }
  body += `PREFERRED MEASURE DATE: ${fmtDate(data.measureDate)}\n`;
  body += `${line}\n`;

  const templateParams = {
    to_email: ORDER_EMAIL,
    subject: `Custom Order Request - ${data.suburb}`,
    message: body,
    delivery_address: `${data.address}, ${data.suburb} ${data.state}`,
  };

  try {
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log('Custom order email sent:', result.text);
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.text || 'Failed to send email' };
  }
}
