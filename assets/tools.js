let selectedFile = null;
let sourceType = document.body.dataset.source || "";
let targetType = document.body.dataset.target || "";
let convertedURL = null;
let currentImage = null;

const tools = {
  "PNG-JPG": {
    title:"PNG → JPG",
    description:"Convert PNG images into JPG format.",
    accepts:".png,image/png",
    outputs:["JPG"]
  },
  "JPG-PNG": {
    title:"JPG → PNG",
    description:"Convert JPG images into PNG format.",
    accepts:".jpg,.jpeg,image/jpeg",
    outputs:["PNG"]
  },
  "WEBP-PNG": {
    title:"WEBP → PNG",
    description:"Convert WEBP images into PNG format.",
    accepts:".webp,image/webp",
    outputs:["PNG"]
  },
  "IMAGE-PDF": {
    title:"Image → PDF",
    description:"Convert JPG, PNG or WEBP images into PDF.",
    accepts:"image/png,image/jpeg,image/webp",
    outputs:["PDF"]
  },
  "TXT-PDF": {
    title:"TXT → PDF",
    description:"Convert a text file into PDF.",
    accepts:".txt,text/plain",
    outputs:["PDF"]
  },
  "CSV-JSON": {
    title:"CSV → JSON",
    description:"Convert CSV data into JSON.",
    accepts:".csv,text/csv",
    outputs:["JSON"]
  },
  "JSON-CSV": {
    title:"JSON → CSV",
    description:"Convert JSON data into CSV.",
    accepts:".json,application/json",
    outputs:["CSV"]
  },
  "HTML-PDF": {
    title:"HTML → PDF",
    description:"Open HTML in a printable PDF-ready preview.",
    accepts:".html,.htm,text/html",
    outputs:["PDF"]
  },
  "IMAGE-WEBP": {
    title:"Image → WEBP",
    description:"Convert images into WEBP format.",
    accepts:"image/png,image/jpeg,image/webp",
    outputs:["WEBP"]
  },
  "IMAGE-PNG": {
    title:"Image → PNG",
    description:"Convert JPG, PNG or WEBP images into PNG.",
    accepts:"image/png,image/jpeg,image/webp",
    outputs:["PNG"]
  },
  "IMAGE-JPG": {
    title:"Image → JPG",
    description:"Convert JPG, PNG or WEBP images into JPG.",
    accepts:"image/png,image/jpeg,image/webp",
    outputs:["JPG"]
  },
  "IMAGE-COMPRESS": {
    title:"Compress Image",
    description:"Reduce the size of an image directly in your browser.",
    accepts:"image/png,image/jpeg,image/webp",
    special:"compress"
  },
  "IMAGE-RESIZE": {
    title:"Resize Image",
    description:"Increase or decrease image dimensions.",
    accepts:"image/png,image/jpeg,image/webp",
    special:"resize"
  },
  "IMAGE-ROTATE": {
    title:"Rotate / Flip Image",
    description:"Rotate or flip an image directly in your browser.",
    accepts:"image/png,image/jpeg,image/webp",
    special:"rotate"
  }
};

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

function openTool(source,target){
  sourceType=source;
  targetType=target;

  const tool=tools[source+"-"+target];

  document.getElementById("home").style.display="none";
  document.getElementById("converter").classList.add("active");
  document.getElementById("converterTitle").textContent=tool.title;
  document.getElementById("converterDescription").textContent=tool.description;

  fileInput.accept=tool.accepts;

  const normalOptions=document.getElementById("normalOptions");
  const imageOptions=document.getElementById("imageOptions");

  if(tool.special){
    normalOptions.style.display="none";
    imageOptions.style.display="block";

    document.getElementById("qualityBox").style.display =
      tool.special==="compress" ? "block" : "none";

    document.getElementById("resizeBox").style.display =
      tool.special==="resize" ? "block" : "none";

    document.getElementById("heightBox").style.display =
      tool.special==="resize" ? "block" : "none";

    document.getElementById("rotateBox").style.display =
      tool.special==="rotate" ? "block" : "none";

    document.getElementById("imageOutputName").value =
      tool.special==="compress" ? "compressed-image" :
      tool.special==="resize" ? "resized-image" :
      "rotated-image";
  }else{
    normalOptions.style.display="block";
    imageOptions.style.display="none";

    const formats=document.getElementById("formats");
    formats.innerHTML="";

    tool.outputs.forEach(format=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="format selected";
      button.textContent=format;
      button.onclick=function(){
        document.querySelectorAll(".format").forEach(b=>b.classList.remove("selected"));
        this.classList.add("selected");
        targetType=format;
      };
      formats.appendChild(button);
    });
  }

  resetConverter(false);
  window.scrollTo({top:0,behavior:"smooth"});
}

dropzone.addEventListener("click",function(event){
  if(event.target!==fileInput) fileInput.click();
});

fileInput.addEventListener("change",function(event){
  if(event.target.files.length) selectFile(event.target.files[0]);
});

dropzone.addEventListener("dragover",function(event){
  event.preventDefault();
  dropzone.classList.add("drag");
});

dropzone.addEventListener("dragleave",function(){
  dropzone.classList.remove("drag");
});

dropzone.addEventListener("drop",function(event){
  event.preventDefault();
  dropzone.classList.remove("drag");
  if(event.dataTransfer.files.length) selectFile(event.dataTransfer.files[0]);
});

async function selectFile(file){
  selectedFile=file;

  document.getElementById("fileInfo").style.display="block";
  document.getElementById("fileName").textContent=file.name;
  document.getElementById("fileSize").textContent=formatSize(file.size);

  if(tools[sourceType+"-"+targetType] && tools[sourceType+"-"+targetType].special){
    document.getElementById("imageOutputName").value=file.name.replace(/\.[^/.]+$/,"");

    try{
      currentImage=await loadImage(file);

      const w=currentImage.width || currentImage.naturalWidth;
      const h=currentImage.height || currentImage.naturalHeight;

      document.getElementById("originalDimensions").textContent =
        "Original: "+w+" × "+h+" pixels";

      document.getElementById("resizeWidth").value=w;
      document.getElementById("resizeHeight").value=h;
    }catch(error){
      currentImage=null;
    }
  }else{
    document.getElementById("outputName").value=file.name.replace(/\.[^/.]+$/,"");
  }

  document.getElementById("result").classList.remove("show");
}

async function startConversion(){
  if(!selectedFile){
    alert("Please choose a file first.");
    return;
  }

  const button=document.getElementById("convertButton");
  button.disabled=true;

  document.getElementById("progress").classList.add("show");
  document.getElementById("result").classList.remove("show");

  try{
    const tool=tools[sourceType+"-"+targetType];
    let result=null;

    await progress(5,"Starting...");

    if(tool.special==="compress"){
      result=await compressImage(selectedFile);
    }else if(tool.special==="resize"){
      result=await resizeImage(selectedFile);
    }else if(tool.special==="rotate"){
      result=await rotateImage(selectedFile);
    }else if(targetType==="JPG"){
      result=await imageConversion(selectedFile,"image/jpeg");
    }else if(targetType==="PNG"){
      result=await imageConversion(selectedFile,"image/png");
    }else if(targetType==="WEBP"){
      result=await imageConversion(selectedFile,"image/webp");
    }else if(targetType==="PDF"){
      if(sourceType==="IMAGE") result=await imageToPDF(selectedFile);
      else if(sourceType==="TXT") result=await textToPDF(selectedFile);
      else if(sourceType==="HTML") result=await htmlToPrintView(selectedFile);
    }else if(targetType==="JSON"){
      result=await csvToJSON(selectedFile);
    }else if(targetType==="CSV"){
      result=await jsonToCSV(selectedFile);
    }

    if(!result) throw new Error("This conversion is not available.");

    await progress(100,"Conversion complete.");
    showResult(result);
  }catch(error){
    showError(error && error.message ? error.message : "Unable to convert this file.");
  }

  button.disabled=false;
}

function loadImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();

    reader.onload=function(event){
      const image=new Image();

      image.onload=function(){ resolve(image); };

      image.onerror=function(){
        reject(new Error("Unable to read this image. The file may be damaged or use an unsupported image format."));
      };

      image.src=event.target.result;
    };

    reader.onerror=function(){
      reject(new Error("The browser could not read this file."));
    };

    reader.readAsDataURL(file);
  });
}

async function imageConversion(file,mime){
  await progress(20,"Reading image...");

  const image=await loadImage(file);

  await progress(45,"Processing image...");

  const width=image.naturalWidth || image.width;
  const height=image.naturalHeight || image.height;

  if(!width || !height) throw new Error("The image dimensions could not be detected.");

  const canvas=document.createElement("canvas");
  canvas.width=width;
  canvas.height=height;

  const ctx=canvas.getContext("2d");

  if(mime==="image/jpeg"){
    ctx.fillStyle="#ffffff";
    ctx.fillRect(0,0,width,height);
  }

  ctx.drawImage(image,0,0,width,height);

  await progress(75,"Creating output file...");

  const quality=Number(document.getElementById("quality").value)/100;

  const blob=await canvasToBlob(canvas,mime,quality);

  await progress(90,"Preparing preview...");

  return {blob,previewType:"image"};
}

async function compressImage(file){
  await progress(15,"Reading image...");

  const image=await loadImage(file);

  const width=image.naturalWidth || image.width;
  const height=image.naturalHeight || image.height;

  const quality=Number(document.getElementById("quality").value)/100;

  await progress(45,"Compressing image...");

  const canvas=document.createElement("canvas");
  canvas.width=width;
  canvas.height=height;

  const ctx=canvas.getContext("2d");

  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,width,height);
  ctx.drawImage(image,0,0,width,height);

  const mime=file.type==="image/webp" ? "image/webp" : "image/jpeg";
  const blob=await canvasToBlob(canvas,mime,quality);

  await progress(90,"Preparing compressed image...");

  return {blob,previewType:"image"};
}

async function resizeImage(file){
  await progress(15,"Reading image...");

  const image=await loadImage(file);

  let width=Number(document.getElementById("resizeWidth").value);
  let height=Number(document.getElementById("resizeHeight").value);

  const originalWidth=image.naturalWidth || image.width;
  const originalHeight=image.naturalHeight || image.height;

  if(!width || width<1) width=originalWidth;
  if(!height || height<1) height=originalHeight;

  if(document.getElementById("keepRatio").checked){
    const ratio=originalHeight/originalWidth;
    height=Math.round(width*ratio);
    document.getElementById("resizeHeight").value=height;
  }

  await progress(45,"Resizing image...");

  const canvas=document.createElement("canvas");
  canvas.width=width;
  canvas.height=height;

  const ctx=canvas.getContext("2d");
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality="high";

  ctx.drawImage(image,0,0,width,height);

  const mime=file.type==="image/png" ? "image/png" : "image/jpeg";
  const quality=Number(document.getElementById("quality").value)/100;
  const blob=await canvasToBlob(canvas,mime,quality);

  await progress(90,"Preparing resized image...");

  return {blob,previewType:"image"};
}

async function rotateImage(file){
  await progress(20,"Reading image...");

  const image=await loadImage(file);

  const width=image.naturalWidth || image.width;
  const height=image.naturalHeight || image.height;
  const rotation=Number(document.getElementById("rotation").value);
  const flip=document.getElementById("flip").value;

  const sideways=rotation===90 || rotation===270;

  const canvas=document.createElement("canvas");
  canvas.width=sideways ? height : width;
  canvas.height=sideways ? width : height;

  const ctx=canvas.getContext("2d");

  ctx.translate(canvas.width/2,canvas.height/2);
  ctx.rotate(rotation*Math.PI/180);

  if(flip==="horizontal") ctx.scale(-1,1);
  if(flip==="vertical") ctx.scale(1,-1);

  ctx.drawImage(image,-width/2,-height/2,width,height);

  await progress(75,"Creating rotated image...");

  const blob=await canvasToBlob(canvas,"image/png",1);

  await progress(90,"Preparing preview...");

  return {blob,previewType:"image"};
}

function canvasToBlob(canvas,mime,quality){
  return new Promise((resolve,reject)=>{
    canvas.toBlob(blob=>{
      if(blob) resolve(blob);
      else reject(new Error("The browser could not create the output image."));
    },mime,quality);
  });
}

async function imageToPDF(file){
  await progress(20,"Reading image...");

  const image=await loadImage(file);

  const width=image.naturalWidth || image.width;
  const height=image.naturalHeight || image.height;

  const canvas=document.createElement("canvas");
  canvas.width=width;
  canvas.height=height;

  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,width,height);
  ctx.drawImage(image,0,0,width,height);

  await progress(55,"Creating PDF...");

  const jpeg=canvas.toDataURL("image/jpeg",0.90);
  const pdfBytes=makeImagePDF(jpeg,width,height);

  await progress(90,"Preparing PDF preview...");

  return {
    blob:new Blob([pdfBytes],{type:"application/pdf"}),
    previewType:"pdf"
  };
}

function makeImagePDF(dataURL,width,height){
  const base64=dataURL.split(",")[1];
  const binary=atob(base64);
  const imageBytes=new Uint8Array(binary.length);

  for(let i=0;i<binary.length;i++) imageBytes[i]=binary.charCodeAt(i);

  const pageContent=`q
${width} 0 0 ${height} 0 0 cm
/Im1 Do
Q`;

  const objects=[];
  objects[1]="<< /Type /Catalog /Pages 2 0 R >>";
  objects[2]="<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3]=`<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${width} ${height}]
/Resources << /XObject << /Im1 5 0 R >> >>
/Contents 4 0 R
>>`;
  objects[4]=`<< /Length ${byteLength(pageContent)} >>
stream
${pageContent}
endstream`;
  objects[5]=`<<
/Type /XObject
/Subtype /Image
/Width ${width}
/Height ${height}
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Filter /DCTDecode
/Length ${imageBytes.length}
>>
stream`;

  let pdf="%PDF-1.4\n";
  const offsets=new Array(6).fill(0);

  for(let i=1;i<=4;i++){
    offsets[i]=byteLength(pdf);
    pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  offsets[5]=byteLength(pdf);

  const imageHeader=new TextEncoder().encode(objects[5]+"\n");
  const prefix=new TextEncoder().encode(pdf);
  const suffix=new TextEncoder().encode("\nendstream\nendobj\n");

  let bodyLength=prefix.length+imageHeader.length+imageBytes.length+suffix.length;
  const xrefOffset=bodyLength;

  let xref=`xref
0 6
0000000000 65535 f 
`;

  for(let i=1;i<=5;i++){
    xref+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  }

  const trailer=`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;

  const tail=new TextEncoder().encode(xref+trailer);

  const final=new Uint8Array(
    prefix.length+imageHeader.length+imageBytes.length+suffix.length+tail.length
  );

  let position=0;
  final.set(prefix,position); position+=prefix.length;
  final.set(imageHeader,position); position+=imageHeader.length;
  final.set(imageBytes,position); position+=imageBytes.length;
  final.set(suffix,position); position+=suffix.length;
  final.set(tail,position);

  return final;
}

async function textToPDF(file){
  await progress(25,"Reading text file...");
  const text=await file.text();
  await progress(55,"Creating PDF...");

  const bytes=makeTextPDF(text);

  await progress(90,"Preparing PDF preview...");

  return {
    blob:new Blob([bytes],{type:"application/pdf"}),
    previewType:"pdf"
  };
}

function makeTextPDF(text){
  const pageWidth=595;
  const pageHeight=842;
  const margin=40;
  const fontSize=11;
  const lineHeight=15;
  const lines=wrapText(text,85);
  const linesPerPage=Math.floor((pageHeight-margin*2)/lineHeight);
  const pages=[];

  for(let i=0;i<lines.length;i+=linesPerPage) pages.push(lines.slice(i,i+linesPerPage));
  if(!pages.length) pages.push([""]);

  const objects=[];
  objects[1]="<< /Type /Catalog /Pages 2 0 R >>";

  let nextObject=3;
  const pageNumbers=[];
  const contentNumbers=[];

  pages.forEach(()=>{
    pageNumbers.push(nextObject++);
    contentNumbers.push(nextObject++);
  });

  const fontNumber=nextObject++;
  const kids=pageNumbers.map(n=>`${n} 0 R`).join(" ");

  objects[2]=`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;

  pages.forEach((pageLines,index)=>{
    const pageNumber=pageNumbers[index];
    const contentNumber=contentNumbers[index];

    objects[pageNumber]=`<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${pageWidth} ${pageHeight}]
/Resources << /Font << /F1 ${fontNumber} 0 R >> >>
/Contents ${contentNumber} 0 R
>>`;

    let stream="BT\n";
    stream+=`/F1 ${fontSize} Tf\n`;
    stream+=`${margin} ${pageHeight-margin} Td\n`;
    stream+=`${lineHeight} TL\n`;

    pageLines.forEach(line=>{
      stream+=`(${escapePDF(line)}) Tj\nT*\n`;
    });

    stream+="ET";

    objects[contentNumber]=`<< /Length ${byteLength(stream)} >>
stream
${stream}
endstream`;
  });

  objects[fontNumber]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let pdf="%PDF-1.4\n";
  const offsets=new Array(nextObject).fill(0);

  for(let i=1;i<nextObject;i++){
    offsets[i]=byteLength(pdf);
    pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset=byteLength(pdf);

  pdf+=`xref
0 ${nextObject}
0000000000 65535 f 
`;

  for(let i=1;i<nextObject;i++){
    pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  }

  pdf+=`trailer
<< /Size ${nextObject} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;

  return new TextEncoder().encode(pdf);
}

function wrapText(text,maxLength){
  const result=[];

  text.split(/\r?\n/).forEach(line=>{
    if(line.length===0){
      result.push("");
      return;
    }

    for(let i=0;i<line.length;i+=maxLength){
      result.push(line.substring(i,i+maxLength));
    }
  });

  return result;
}

function escapePDF(text){
  return String(text)
    .replace(/\\/g,"\\\\")
    .replace(/\(/g,"\\(")
    .replace(/\)/g,"\\)");
}

function byteLength(text){
  return new TextEncoder().encode(text).length;
}

async function csvToJSON(file){
  await progress(25,"Reading CSV...");
  const text=await file.text();
  await progress(50,"Converting CSV to JSON...");

  const rows=parseCSV(text);

  if(!rows.length) throw new Error("The CSV file is empty.");

  const headers=rows[0];

  const data=rows.slice(1).filter(row=>row.length>0).map(row=>{
    const object={};
    headers.forEach((header,index)=>object[header]=row[index] ?? "");
    return object;
  });

  const json=JSON.stringify(data,null,2);

  await progress(90,"Preparing JSON preview...");

  return {
    blob:new Blob([json],{type:"application/json"}),
    previewType:"text",
    previewText:json
  };
}

function parseCSV(text){
  const rows=[];
  let row=[];
  let value="";
  let insideQuotes=false;

  for(let i=0;i<text.length;i++){
    const char=text[i];
    const next=text[i+1];

    if(char==="\"" && insideQuotes && next==="\""){
      value+="\"";
      i++;
      continue;
    }

    if(char==="\""){
      insideQuotes=!insideQuotes;
      continue;
    }

    if(char==="," && !insideQuotes){
      row.push(value);
      value="";
      continue;
    }

    if((char==="\n" || char==="\r") && !insideQuotes){
      if(char==="\r" && next==="\n") i++;
      row.push(value);
      rows.push(row);
      row=[];
      value="";
      continue;
    }

    value+=char;
  }

  if(value.length>0 || row.length>0){
    row.push(value);
    rows.push(row);
  }

  return rows;
}

async function jsonToCSV(file){
  await progress(25,"Reading JSON...");
  const text=await file.text();

  let data;
  try{
    data=JSON.parse(text);
  }catch{
    throw new Error("The JSON file is not valid.");
  }

  await progress(50,"Converting JSON to CSV...");

  if(!Array.isArray(data)) data=[data];
  if(!data.length) throw new Error("The JSON file contains no records.");

  const headers=[...new Set(
    data.flatMap(item =>
      item && typeof item==="object" && !Array.isArray(item)
        ? Object.keys(item)
        : []
    )
  )];

  if(!headers.length) throw new Error("No object fields were found in the JSON.");

  const rows=[headers];

  data.forEach(item=>{
    rows.push(headers.map(header=>{
      const value=item && typeof item==="object" ? item[header] : "";
      return value !== null && typeof value==="object"
        ? JSON.stringify(value)
        : value ?? "";
    }));
  });

  const csv=rows.map(row=>row.map(csvEscape).join(",")).join("\n");

  await progress(90,"Preparing CSV preview...");

  return {
    blob:new Blob([csv],{type:"text/csv"}),
    previewType:"text",
    previewText:csv
  };
}

function csvEscape(value){
  let string=String(value);

  if(/[",\n\r]/.test(string)){
    string="\""+string.replace(/"/g,"\"\"")+"\"";
  }

  return string;
}

async function htmlToPrintView(file){
  await progress(30,"Reading HTML...");
  const html=await file.text();
  await progress(70,"Preparing HTML preview...");

  return {
    blob:new Blob([html],{type:"text/html"}),
    previewType:"html-print"
  };
}

function showResult(result){
  const resultBox=document.getElementById("result");
  const preview=document.getElementById("preview");
  const message=document.getElementById("resultMessage");
  const download=document.getElementById("download");

  preview.innerHTML="";

  if(convertedURL){
    URL.revokeObjectURL(convertedURL);
    convertedURL=null;
  }

  message.innerHTML=`<div class="success"><strong>✓ Conversion Complete — 100%</strong><br><br>Your file is ready.</div>`;

  if(result.previewType==="image"){
    convertedURL=URL.createObjectURL(result.blob);

    const image=document.createElement("img");
    image.src=convertedURL;
    image.alt="Converted image";

    preview.appendChild(image);
    setupDownload(download,result.blob);
  }

  if(result.previewType==="pdf"){
    convertedURL=URL.createObjectURL(result.blob);

    const iframe=document.createElement("iframe");
    iframe.src=convertedURL;
    iframe.title="PDF Preview";

    preview.appendChild(iframe);
    setupDownload(download,result.blob);
  }

  if(result.previewType==="text"){
    const pre=document.createElement("pre");
    pre.textContent=result.previewText;

    preview.appendChild(pre);

    convertedURL=URL.createObjectURL(result.blob);
    setupDownload(download,result.blob);
  }

  if(result.previewType==="html-print"){
    convertedURL=URL.createObjectURL(result.blob);

    const iframe=document.createElement("iframe");
    iframe.src=convertedURL;
    iframe.title="HTML Preview";

    preview.appendChild(iframe);

    download.textContent="Open / Print HTML";
    download.href="#";
    download.onclick=function(event){
      event.preventDefault();
      window.open(convertedURL,"_blank");
    };
  }

  resultBox.classList.add("show");
  resultBox.scrollIntoView({behavior:"smooth",block:"start"});
}

function setupDownload(link,blob){
  link.textContent="Download File";
  link.href=convertedURL;
  link.download=getOutputName();
  link.onclick=null;
}

function getOutputName(){
  let name;

  if(tools[sourceType+"-"+targetType] && tools[sourceType+"-"+targetType].special){
    name=document.getElementById("imageOutputName").value.trim() || "edited-image";
  }else{
    name=document.getElementById("outputName").value.trim() || "converted-file";
  }

  name=name.replace(/\.[^/.]+$/,"");

  let extension="file";

  if(tools[sourceType+"-"+targetType] && tools[sourceType+"-"+targetType].special){
    const special=tools[sourceType+"-"+targetType].special;
    extension=special==="compress" ? "jpg" : special==="resize" ? "jpg" : "png";
  }else{
    extension={
      JPG:"jpg",
      PNG:"png",
      WEBP:"webp",
      PDF:"pdf",
      JSON:"json",
      CSV:"csv"
    }[targetType] || "file";
  }

  return name+"."+extension;
}

function progress(percent,message){
  return new Promise(resolve=>{
    setTimeout(()=>{
      document.getElementById("progressFill").style.width=percent+"%";
      document.getElementById("progressPercent").textContent=percent+"%";
      document.getElementById("progressStatus").textContent=percent>=100 ? "Complete" : "Converting";
      document.getElementById("status").textContent=message;
      resolve();
    },80);
  });
}

function showError(message){
  document.getElementById("result").classList.add("show");
  document.getElementById("resultMessage").innerHTML=
    `<div class="error"><strong>Conversion failed</strong><br><br>${escapeHTML(message)}</div>`;
  document.getElementById("preview").innerHTML="";
}

function resetConverter(clearFile=true){
  if(clearFile){
    selectedFile=null;
    currentImage=null;
    fileInput.value="";
    document.getElementById("fileInfo").style.display="none";
  }

  if(convertedURL){
    URL.revokeObjectURL(convertedURL);
    convertedURL=null;
  }

  document.getElementById("result").classList.remove("show");
  document.getElementById("progress").classList.remove("show");
  document.getElementById("progressFill").style.width="0%";
  document.getElementById("progressPercent").textContent="0%";
  document.getElementById("status").textContent="";
}

function backHome(){
  resetConverter();

  document.getElementById("converter").classList.remove("active");
  document.getElementById("home").style.display="block";

  window.scrollTo({top:0,behavior:"smooth"});
}

function formatSize(bytes){
  if(bytes<1024) return bytes+" bytes";
  if(bytes<1024*1024) return (bytes/1024).toFixed(2)+" KB";
  if(bytes<1024*1024*1024) return (bytes/(1024*1024)).toFixed(2)+" MB";
  return (bytes/(1024*1024*1024)).toFixed(2)+" GB";
}

function escapeHTML(text){
  return String(text)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

/* Keep the aspect ratio while changing width. */
document.getElementById("resizeWidth").addEventListener("input",function(){
  if(!document.getElementById("keepRatio").checked || !currentImage) return;

  const width=Number(this.value);
  const originalWidth=currentImage.naturalWidth || currentImage.width;
  const originalHeight=currentImage.naturalHeight || currentImage.height;

  if(width>0){
    document.getElementById("resizeHeight").value=
      Math.round(width*(originalHeight/originalWidth));
  }
});



function initToolPage(){
  const key = sourceType + "-" + targetType;
  const tool = tools[key];
  if(!tool) return;

  document.getElementById("converterTitle").textContent = tool.title;
  document.getElementById("converterDescription").textContent = tool.description;
  fileInput.accept = tool.accepts;

  const normalOptions = document.getElementById("normalOptions");
  const imageOptions = document.getElementById("imageOptions");

  if(tool.special){
    normalOptions.style.display = "none";
    imageOptions.style.display = "block";

    document.getElementById("qualityBox").style.display =
      tool.special === "compress" ? "block" : "none";
    document.getElementById("resizeBox").style.display =
      tool.special === "resize" ? "block" : "none";
    document.getElementById("heightBox").style.display =
      tool.special === "resize" ? "block" : "none";
    document.getElementById("rotateBox").style.display =
      tool.special === "rotate" ? "block" : "none";

    document.getElementById("imageOutputName").value =
      tool.special === "compress" ? "compressed-image" :
      tool.special === "resize" ? "resized-image" :
      "rotated-image";
  } else {
    normalOptions.style.display = "block";
    imageOptions.style.display = "none";

    const formats = document.getElementById("formats");
    formats.innerHTML = "";

    tool.outputs.forEach(format => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "format selected";
      button.textContent = format;
      button.onclick = function(){
        document.querySelectorAll(".format").forEach(b => b.classList.remove("selected"));
        this.classList.add("selected");
        targetType = format;
      };
      formats.appendChild(button);
    });
  }
}

document.addEventListener("DOMContentLoaded", initToolPage);
